import { useQuery } from '@tanstack/react-query';
import { liveVideoService, LiveStream } from '../services/liveVideoService';
import type { SportKey } from '../constants/liveChannels';

// ─────────────────────────────────────────────────────────────────────────────
// useLiveStreams  – auto-refreshes every 3 minutes
// ─────────────────────────────────────────────────────────────────────────────
export function useLiveStreams(sport: SportKey = 'all') {
  return useQuery({
    queryKey: ['live-streams', sport],
    queryFn: () => liveVideoService.getLiveStreams(sport),
    refetchInterval: 3 * 60 * 1000,        // poll every 3 min
    refetchIntervalInBackground: true,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    select: (data) => data.streams ?? [],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useUpcomingStreams  – auto-refreshes every 5 minutes
// ─────────────────────────────────────────────────────────────────────────────
export function useUpcomingStreams(sport: SportKey = 'all') {
  return useQuery({
    queryKey: ['upcoming-streams', sport],
    queryFn: () => liveVideoService.getUpcomingStreams(sport),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    retry: 2,
    select: (data) => data.streams ?? [],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useLiveHub  – Combined: live + upcoming, returns split lists and metadata
// ─────────────────────────────────────────────────────────────────────────────
export function useLiveHub(sport: SportKey = 'all') {
  const live = useLiveStreams(sport);
  const upcoming = useUpcomingStreams(sport);

  const liveStreams: LiveStream[] = live.data ?? [];
  const upcomingStreams: LiveStream[] = upcoming.data ?? [];

  // Trending = live streams sorted by viewer count desc (if available)
  const trending = [...liveStreams].sort(
    (a, b) => (b.viewerCount ?? 0) - (a.viewerCount ?? 0)
  );

  const isLoading = live.isLoading || upcoming.isLoading;
  const isRefetching = live.isRefetching || upcoming.isRefetching;
  const isError = live.isError && upcoming.isError;

  const refetchAll = async () => {
    liveVideoService.clearCache();
    await Promise.all([live.refetch(), upcoming.refetch()]);
  };

  return {
    liveStreams,
    upcomingStreams,
    trending,
    isLoading,
    isRefetching,
    isError,
    refetchAll,
    totalLive: liveStreams.length,
  };
}
