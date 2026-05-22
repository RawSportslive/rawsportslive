import { NextResponse } from 'next/server';
import { OFFICIAL_CHANNELS, LiveStream } from '../shared';

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Force-refresh all live stream caches
// Protected by a shared secret header: x-admin-secret
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'rawsports-admin';

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-admin-secret');
  return secret === ADMIN_SECRET;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  try {
    // Force-refresh by hitting our own live/streams and upcoming endpoints
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://rawsportslive.vercel.app';

    const [liveRes, upcomingRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/live/streams?sport=all&refresh=1`),
      fetch(`${baseUrl}/api/live/upcoming?sport=all&refresh=1`),
    ]);

    const live = liveRes.status === 'fulfilled' ? await liveRes.value.json() : { error: 'Failed' };
    const upcoming = upcomingRes.status === 'fulfilled' ? await upcomingRes.value.json() : { error: 'Failed' };

    return NextResponse.json({
      success: true,
      refreshedAt: new Date().toISOString(),
      live: {
        totalLive: live.totalLive ?? 0,
        fetchedAt: live.fetchedAt,
      },
      upcoming: {
        total: upcoming.streams?.length ?? 0,
        fetchedAt: upcoming.fetchedAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Refresh failed', detail: String(error) }, { status: 500 });
  }
}

// GET: Return live system status / analytics
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totalChannels = Object.values(OFFICIAL_CHANNELS).flat().length;
  const sportBreakdown = Object.entries(OFFICIAL_CHANNELS).map(([sport, channels]) => ({
    sport,
    channelCount: channels.length,
    channels: channels.map((c) => ({ name: c.name, id: c.id })),
  }));

  return NextResponse.json({
    system: 'RawSports Live Video System',
    status: 'operational',
    totalOfficialChannels: totalChannels,
    supportedSports: Object.keys(OFFICIAL_CHANNELS).length,
    sportBreakdown,
    cacheTTL: { liveStreams: '3 minutes', upcomingStreams: '5 minutes' },
    compliance: {
      youtubeToS: true,
      dmca: true,
      playStorePolicy: true,
      contentType: 'Official YouTube channel embeds only',
      noDownloading: true,
      noRestreaming: true,
    },
    apis: [
      { path: '/api/live/streams', description: 'Fetch current live streams' },
      { path: '/api/live/upcoming', description: 'Fetch upcoming scheduled streams' },
      { path: '/api/live/channels', description: 'List all official channels' },
      { path: '/api/live/admin', description: 'Admin controls (auth required)' },
    ],
  });
}
