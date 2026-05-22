import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Live Video Service
// All requests go through the Next.js backend which holds the YouTube API key.
// The mobile app NEVER directly calls the YouTube API – keys stay server-side.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://rawsportslive.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────────────────────
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
  sourceLabel: string;  // e.g. "© WWE — Official YouTube Channel"
  embedUrl: string;
}

export interface LiveStreamsResponse {
  streams: LiveStream[];
  cached: boolean;
  fetchedAt: string;
  totalLive: number;
}

export interface UpcomingStreamsResponse {
  streams: LiveStream[];
  cached: boolean;
  fetchedAt: string;
}

// ─── Simple in-app cache to avoid re-fetching within 2 minutes ───────────────
const IN_APP_CACHE: Map<string, { data: any; at: number }> = new Map();
const APP_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function getCached<T>(key: string): T | null {
  const entry = IN_APP_CACHE.get(key);
  if (entry && Date.now() - entry.at < APP_CACHE_TTL) return entry.data as T;
  return null;
}
function setCache(key: string, data: any) {
  IN_APP_CACHE.set(key, { data, at: Date.now() });
}

// ─── API Methods ──────────────────────────────────────────────────────────────
export const liveVideoService = {
  /**
   * Fetch currently LIVE streams from all official channels.
   * @param sport  'all' | sport key. Filters server-side.
   * @param forceRefresh  Bypass server cache (use sparingly – YouTube quota)
   */
  getLiveStreams: async (sport = 'all', forceRefresh = false): Promise<LiveStreamsResponse> => {
    const cacheKey = `live:${sport}`;
    if (!forceRefresh) {
      const cached = getCached<LiveStreamsResponse>(cacheKey);
      if (cached) return cached;
    }
    const params: Record<string, string> = { sport };
    if (forceRefresh) params.refresh = '1';
    const { data } = await api.get<LiveStreamsResponse>('/api/live/streams', { params });
    setCache(cacheKey, data);
    return data;
  },

  /**
   * Fetch UPCOMING / scheduled streams from official channels.
   */
  getUpcomingStreams: async (sport = 'all', forceRefresh = false): Promise<UpcomingStreamsResponse> => {
    const cacheKey = `upcoming:${sport}`;
    if (!forceRefresh) {
      const cached = getCached<UpcomingStreamsResponse>(cacheKey);
      if (cached) return cached;
    }
    const params: Record<string, string> = { sport };
    if (forceRefresh) params.refresh = '1';
    const { data } = await api.get<UpcomingStreamsResponse>('/api/live/upcoming', { params });
    setCache(cacheKey, data);
    return data;
  },

  /**
   * Get full official channel registry.
   */
  getChannels: async () => {
    const cached = getCached<any>('channels');
    if (cached) return cached;
    const { data } = await api.get('/api/live/channels');
    setCache('channels', data);
    return data;
  },

  /** Clear all in-app cache (for pull-to-refresh) */
  clearCache: () => IN_APP_CACHE.clear(),
};
