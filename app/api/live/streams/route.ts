import { NextResponse } from 'next/server';
import { OFFICIAL_CHANNELS, ALL_CHANNELS, LiveStream } from '../shared';

interface CacheEntry {
  data: LiveStream[];
  timestamp: number;
}
let cache: CacheEntry | null = null;
// 5 min cache — fast refresh for real live events
const CACHE_TTL_MS = 5 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Scraper: detects real live streams from public YouTube channel page.
// Uses ZERO API quota. Picks up marathon/continuous streams the API misses.
// ─────────────────────────────────────────────────────────────────────────────
async function scrapeLiveStreamForChannel(
  channelId: string,
  channelName: string,
  sport: string
): Promise<LiveStream[]> {
  try {
    const url = `https://www.youtube.com/channel/${channelId}/live`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const html = await res.text();

    // Strict live detection:
    // 1. Page must contain YouTube's own "isLive":true signal
    // 2. Page must NOT contain LIVE_STREAM_OFFLINE (channel is off-air)
    // This eliminates old replays/marathons that aren't real live broadcasts
    const isReallyLive =
      html.includes('"isLive":true') &&
      !html.includes('LIVE_STREAM_OFFLINE');

    // Extract videoId — first match on the page
    const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (!videoIdMatch || !isReallyLive) return [];

    const videoId = videoIdMatch[1];

    // Extract title
    const titleMatch =
      html.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}/) ||
      html.match(/"title":"([^"]+)"/);
    let title = titleMatch ? titleMatch[1] : `${channelName} Live`;
    // Decode common unicode escapes
    title = title
      .replace(/\\u0026/g, '&')
      .replace(/\\u003c/g, '<')
      .replace(/\\u003e/g, '>')
      .replace(/\\"/g, '"');

    return [
      {
        videoId,
        title,
        channelId,
        channelName,
        sport,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        status: 'live' as const,
        description: `Live broadcast from ${channelName}`,
        publishedAt: new Date().toISOString(),
        actualStartTime: new Date().toISOString(),
        sourceLabel: `© ${channelName} — Official YouTube Channel`,
        // Direct channel embed — works even without videoId, zero API quota
        embedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1`,
      },
    ];
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || 'all';
    const forceRefresh = searchParams.get('refresh') === '1';

    // Return cached data if still fresh
    if (!forceRefresh && cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
      const filtered =
        sport === 'all' ? cache.data : cache.data.filter((s) => s.sport === sport);
      return NextResponse.json({
        streams: filtered,
        cached: true,
        fetchedAt: new Date(cache.timestamp).toISOString(),
        totalLive: filtered.length,
      });
    }

    const channelsToQuery =
      sport === 'all' ? ALL_CHANNELS : OFFICIAL_CHANNELS[sport] ?? ALL_CHANNELS;

    // Scrape all channels concurrently — no API quota used
    const results = await Promise.allSettled(
      channelsToQuery.map((ch) =>
        scrapeLiveStreamForChannel(ch.id, ch.name, ch.sport)
      )
    );

    const streams: LiveStream[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') streams.push(...r.value);
    }

    const validStreams = streams.filter((s) => s.videoId);

    if (sport === 'all') {
      cache = { data: validStreams, timestamp: Date.now() };
    }

    return NextResponse.json({
      streams: validStreams,
      cached: false,
      fetchedAt: new Date().toISOString(),
      totalLive: validStreams.length,
      method: 'scraper_no_quota',
    });
  } catch (error) {
    console.error('[live/streams] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch live streams' }, { status: 500 });
  }
}
