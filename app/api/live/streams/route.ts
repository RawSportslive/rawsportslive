import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL CHANNEL REGISTRY  (Play Store safe – only verified, official channels)
// ─────────────────────────────────────────────────────────────────────────────
export const OFFICIAL_CHANNELS: Record<string, { id: string; name: string; sport: string }[]> = {
  wrestling: [
    { id: 'UCJ5v_MCY6GNUBTO8-D3XoAg', name: 'WWE', sport: 'wrestling' },
    { id: 'UCIr4vkCsn0tdTW2xZ1jRG1g', name: 'AEW', sport: 'wrestling' },
  ],
  basketball: [
    { id: 'UCWJ2lWNubArHWmf3FIHbfcQ', name: 'NBA', sport: 'basketball' },
  ],
  football: [
    { id: 'UCpcTrCXblq78GZrTUTLWeBw', name: 'UEFA', sport: 'football' },
    { id: 'UCG5qGWdu8nIRZqJ_GgDwQ-w', name: 'Premier League', sport: 'football' },
    { id: 'UCVGOWXDMhXmkjR0D-X0K1NQ', name: 'ESPN FC', sport: 'football' },
  ],
  cricket: [
    { id: 'UCt2JXOLNxqry7B_4rRZME3Q', name: 'ICC', sport: 'cricket' },
  ],
  ufc: [
    { id: 'UCvgfXK4nTYKudb0rFR6noLA', name: 'UFC', sport: 'ufc' },
  ],
  f1: [
    { id: 'UCB_qr75-ydFVKSF9Dmo6izg', name: 'Formula 1', sport: 'f1' },
  ],
  tennis: [
    { id: 'UCzAYW60ZZ-rB8f-VqIsuPWg', name: 'ATP Tour', sport: 'tennis' },
  ],
  esports: [
    { id: 'UCey_c7U86mJGz1VJWH5CYPA', name: 'ESL', sport: 'esports' },
    { id: 'UCzVgCrOcBAWYEHTtVOMPAtw', name: 'Valorant Champions Tour', sport: 'esports' },
  ],
};

// All channels flat list
const ALL_CHANNELS = Object.values(OFFICIAL_CHANNELS).flat();

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache (3-minute TTL to respect YouTube API quota)
// ─────────────────────────────────────────────────────────────────────────────
interface CacheEntry {
  data: LiveStream[];
  timestamp: number;
}
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export interface LiveStream {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  sport: string;
  thumbnail: string;
  status: 'live' | 'upcoming' | 'completed';
  scheduledStartTime?: string;
  actualStartTime?: string;
  viewerCount?: number;
  description: string;
  publishedAt: string;
  // Play Store compliance: always attribute source
  sourceLabel: string;
  embedUrl: string;
}

async function fetchLiveStreamsForChannel(
  channelId: string,
  channelName: string,
  sport: string,
  apiKey: string
): Promise<LiveStream[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('eventType', 'live');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '5');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return [];

  const json = await res.json();
  const items = json.items ?? [];

  return items.map((item: any) => {
    const videoId = item.id?.videoId ?? '';
    return {
      videoId,
      title: item.snippet?.title ?? '',
      channelId,
      channelName,
      sport,
      thumbnail:
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        '',
      status: 'live' as const,
      description: item.snippet?.description ?? '',
      publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
      actualStartTime: item.snippet?.publishedAt,
      sourceLabel: `© ${channelName} — Official YouTube Channel`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
    };
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || 'all';
    const forceRefresh = searchParams.get('refresh') === '1';

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Return cached data if still fresh
    if (!forceRefresh && cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
      const filtered = sport === 'all' ? cache.data : cache.data.filter((s) => s.sport === sport);
      return NextResponse.json({
        streams: filtered,
        cached: true,
        fetchedAt: new Date(cache.timestamp).toISOString(),
        totalLive: filtered.length,
      });
    }

    // Fetch live streams from all official channels concurrently
    const channelsToQuery = sport === 'all'
      ? ALL_CHANNELS
      : (OFFICIAL_CHANNELS[sport] ?? ALL_CHANNELS);

    const results = await Promise.allSettled(
      channelsToQuery.map((ch) =>
        fetchLiveStreamsForChannel(ch.id, ch.name, ch.sport, apiKey)
      )
    );

    const streams: LiveStream[] = results
      .filter((r): r is PromiseFulfilledResult<LiveStream[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .filter((s) => s.videoId);

    // Update cache (cache all sports together)
    if (sport === 'all') {
      cache = { data: streams, timestamp: Date.now() };
    }

    return NextResponse.json({
      streams,
      cached: false,
      fetchedAt: new Date().toISOString(),
      totalLive: streams.length,
    });
  } catch (error) {
    console.error('[live/streams] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch live streams' }, { status: 500 });
  }
}
