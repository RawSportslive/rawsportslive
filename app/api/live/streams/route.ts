import { NextResponse } from 'next/server';
import { OFFICIAL_CHANNELS, ALL_CHANNELS, LiveStream } from '../shared';

// In-memory cache (3-minute TTL to respect YouTube API quota)
interface CacheEntry {
  data: LiveStream[];
  timestamp: number;
}
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // Reduced cache TTL to 15 mins for better live status synchronization

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

  const res = await fetch(url.toString(), { next: { revalidate: 900 } });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errorMessage = errJson?.error?.message || 'Unknown YouTube API error';
    const reason = errJson?.error?.errors?.[0]?.reason ?? '';
    throw new Error(`YOUTUBE_API_FAILED: ${errorMessage} (${reason})`);
  }

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
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      status: 'live' as const,
      description: item.snippet?.description ?? '',
      publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
      actualStartTime: item.snippet?.publishedAt,
      sourceLabel: `© ${channelName} — Official YouTube Channel`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
    };
  });
}

// Fallback scraper to fetch live stream without API Key
async function scrapeLiveStreamForChannel(
  channelId: string,
  channelName: string,
  sport: string
): Promise<LiveStream[]> {
  try {
    const url = `https://www.youtube.com/channel/${channelId}/live`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!res.ok) return [];
    const html = await res.text();
    
    const videoIdMatch = html.match(/"videoId":"([^"]+)"/);
    const isLiveMatch = html.includes('isLive') || html.includes('LIVE_STARTED') || html.includes('liveStreamability');
    
    if (videoIdMatch && isLiveMatch) {
      const videoId = videoIdMatch[1];
      const titleMatch = html.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}/) || html.match(/"title":"([^"]+)"/);
      // Clean unicode characters
      let title = titleMatch ? titleMatch[1] : 'Live Broadcast';
      title = title.replace(/\\u0026/g, '&')
                   .replace(/\\u003c/g, '<')
                   .replace(/\\u003e/g, '>')
                   .replace(/\\"/g, '"');
                   
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      return [{
        videoId,
        title,
        channelId,
        channelName,
        sport,
        thumbnail,
        status: 'live' as const,
        description: `Live video coverage directly from ${channelName} official stream.`,
        publishedAt: new Date().toISOString(),
        actualStartTime: new Date().toISOString(),
        sourceLabel: `© ${channelName} — Official YouTube Channel`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      }];
    }
    return [];
  } catch (err) {
    console.error(`[live/streams] Fallback scrape failed for channel ${channelName}:`, err);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || 'all';
    const forceRefresh = searchParams.get('refresh') === '1';

    const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEYS?.split(',')[0]?.trim();

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

    let streams: LiveStream[] = [];
    let methodUsed = 'youtube_api';
    const errors: string[] = [];

    if (!apiKey) {
      console.warn('[live/streams] YOUTUBE_API_KEY is not set. Using scraper directly.');
      methodUsed = 'scraper';
      const results = await Promise.allSettled(
        channelsToQuery.map((ch) => scrapeLiveStreamForChannel(ch.id, ch.name, ch.sport))
      );
      for (const r of results) {
        if (r.status === 'fulfilled') {
          streams.push(...r.value);
        }
      }
    } else {
      // Attempt API call
      const results = await Promise.allSettled(
        channelsToQuery.map((ch) => fetchLiveStreamsForChannel(ch.id, ch.name, ch.sport, apiKey))
      );

      let apiFailed = false;
      for (const r of results) {
        if (r.status === 'fulfilled') {
          streams.push(...r.value);
        } else {
          errors.push(r.reason?.message || 'Unknown API error');
          apiFailed = true;
        }
      }

      // If API failed to find any streams (either due to error or genuine lack of live streams),
      // we check our scraper to be absolutely certain we don't miss live matches.
      if (streams.length === 0 || apiFailed) {
        console.info(`[live/streams] API key returned 0 live results (or failed). Running scraping fallback. API errors:`, errors);
        methodUsed = 'scraper_fallback';
        const scrapeResults = await Promise.allSettled(
          channelsToQuery.map((ch) => scrapeLiveStreamForChannel(ch.id, ch.name, ch.sport))
        );
        
        // Clear previous empty streams list in case some calls failed
        const scrapedStreams: LiveStream[] = [];
        for (const r of scrapeResults) {
          if (r.status === 'fulfilled') {
            scrapedStreams.push(...r.value);
          }
        }
        
        if (scrapedStreams.length > 0) {
          streams = scrapedStreams;
        }
      }
    }
    
    const validStreams = streams.filter((s) => s.videoId);

    // Update cache (cache all sports together)
    if (sport === 'all') {
      cache = { data: validStreams, timestamp: Date.now() };
    }

    return NextResponse.json({
      streams: validStreams,
      cached: false,
      fetchedAt: new Date().toISOString(),
      totalLive: validStreams.length,
      method: methodUsed,
    });
  } catch (error) {
    console.error('[live/streams] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch live streams' }, { status: 500 });
  }
}
