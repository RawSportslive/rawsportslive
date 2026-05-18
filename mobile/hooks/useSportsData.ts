import { useQuery } from '@tanstack/react-query';
import { sportsApi } from '../services/sportsApi';

// Refetch live scores every 30 seconds for real-time match state
export const useLiveMatches = (sport: string) => {
  return useQuery({
    queryKey: ['liveMatches', sport],
    queryFn: () => sportsApi.getLiveMatches(sport),
    refetchInterval: 30000, // 30 seconds auto-refresh
    staleTime: 15000,
    retry: 2,
  });
};

// Refetch fixtures every 2 hours (or on mount/focus)
export const useFixtures = (sport: string) => {
  return useQuery({
    queryKey: ['fixtures', sport],
    queryFn: () => sportsApi.getFixtures(sport),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 2,
  });
};

// Refetch standings every 6 hours
export const useStandings = (sport: string) => {
  return useQuery({
    queryKey: ['standings', sport],
    queryFn: () => sportsApi.getStandings(sport),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    retry: 2,
  });
};
