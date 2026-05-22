import { NextResponse } from 'next/server';
import { OFFICIAL_CHANNELS, ALL_CHANNELS, LiveStream } from '../shared';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache (3-minute TTL to respect YouTube API quota)
// ─────────────────────────────────────────────────────────────────────────────
interface CacheEntry {
  data: LiveStream[];
  timestamp: number;
}
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

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

  const res = await fetch(url.toString(), { next: { revalidate: 180 } });
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
