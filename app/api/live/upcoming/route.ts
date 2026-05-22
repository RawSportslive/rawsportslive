import { NextResponse } from 'next/server';
import { OFFICIAL_CHANNELS, LiveStream } from '../streams/route';

// ─────────────────────────────────────────────────────────────────────────────
// Upcoming streams cache (5-minute TTL)
// ─────────────────────────────────────────────────────────────────────────────
interface CacheEntry {
  data: LiveStream[];
  timestamp: number;
}
let upcomingCache: CacheEntry | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

const ALL_CHANNELS = Object.values(OFFICIAL_CHANNELS).flat();

async function fetchUpcomingForChannel(
  channelId: string,
  channelName: string,
  sport: string,
  apiKey: string
): Promise<LiveStream[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('eventType', 'upcoming');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '3');
  url.searchParams.set('order', 'date');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return [];

  const json = await res.json();
  const items = json.items ?? [];

  // Fetch video details (including scheduledStartTime) for upcoming videos
  const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean).join(',');
  if (!videoIds) return [];

  const detailUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  detailUrl.searchParams.set('part', 'snippet,liveStreamingDetails');
  detailUrl.searchParams.set('id', videoIds);
  detailUrl.searchParams.set('key', apiKey);

  const detailRes = await fetch(detailUrl.toString());
  const detailJson = await detailRes.json();
  const detailItems = detailJson.items ?? [];

  return detailItems.map((item: any) => {
    const videoId = item.id ?? '';
    const scheduledStart = item.liveStreamingDetails?.scheduledStartTime;
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
      status: 'upcoming' as const,
      description: item.snippet?.description ?? '',
      publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
      scheduledStartTime: scheduledStart,
      sourceLabel: `© ${channelName} — Official YouTube Channel`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    };
  }).filter((s: LiveStream) => s.videoId);
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

    if (!forceRefresh && upcomingCache && Date.now() - upcomingCache.timestamp < CACHE_TTL_MS) {
      const filtered = sport === 'all'
        ? upcomingCache.data
        : upcomingCache.data.filter((s) => s.sport === sport);
      return NextResponse.json({
        streams: filtered,
        cached: true,
        fetchedAt: new Date(upcomingCache.timestamp).toISOString(),
      });
    }

    const channelsToQuery = sport === 'all'
      ? ALL_CHANNELS
      : (OFFICIAL_CHANNELS[sport] ?? ALL_CHANNELS);

    const results = await Promise.allSettled(
      channelsToQuery.map((ch) =>
        fetchUpcomingForChannel(ch.id, ch.name, ch.sport, apiKey)
      )
    );

    const streams: LiveStream[] = results
      .filter((r): r is PromiseFulfilledResult<LiveStream[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .filter((s) => s.videoId)
      // Sort by scheduled start time ascending
      .sort((a, b) => {
        const aTime = a.scheduledStartTime ? new Date(a.scheduledStartTime).getTime() : Infinity;
        const bTime = b.scheduledStartTime ? new Date(b.scheduledStartTime).getTime() : Infinity;
        return aTime - bTime;
      });

    if (sport === 'all') {
      upcomingCache = { data: streams, timestamp: Date.now() };
    }

    return NextResponse.json({
      streams,
      cached: false,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[live/upcoming] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch upcoming streams' }, { status: 500 });
  }
}
