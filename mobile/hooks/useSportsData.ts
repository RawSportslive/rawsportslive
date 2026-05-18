import { useQuery } from '@tanstack/react-query';
import { sportsApi } from '../services/sportsApi';

// Caching configuration keys
export const SPORTS_KEYS = {
  liveScores: (sport: string) => ['sports', sport, 'live'] as const,
  fixtures: (sport: string) => ['sports', sport, 'fixtures'] as const,
  standings: (sport: string) => ['sports', sport, 'standings'] as const,
  search: (query: string) => ['sports', 'search', query] as const,
};

// -------------------------------------------------------------
// REACT QUERY HOOKS FOR SPORTS DATA
// -------------------------------------------------------------

// Live Scores Hook - Polls every 30 seconds to keep scores fresh in real time!
export function useLiveScores(sport: string) {
  return useQuery({
    queryKey: SPORTS_KEYS.liveScores(sport),
    queryFn: () => sportsApi.getLiveScores(sport),
    refetchInterval: 30000, // Background poll every 30s
    staleTime: 15000,      // Consider stale after 15s
    refetchOnWindowFocus: true,
  });
}

// Fixtures & Schedules Hook - Refetches every 5 minutes
export function useFixtures(sport: string) {
  return useQuery({
    queryKey: SPORTS_KEYS.fixtures(sport),
    queryFn: () => sportsApi.getFixtures(sport),
    staleTime: 300000, // 5 minutes cache
  });
}

// Standings & Rankings Hook - Refetches every 30 minutes
export function useStandings(sport: string) {
  return useQuery({
    queryKey: SPORTS_KEYS.standings(sport),
    queryFn: () => sportsApi.getStandings(sport),
    staleTime: 1800000, // 30 minutes cache
  });
}

// Global Search Hook
export function useSportsSearch(query: string) {
  return useQuery({
    queryKey: SPORTS_KEYS.search(query),
    queryFn: () => sportsApi.searchSports(query),
    enabled: query.trim().length > 1, // Only run if query is long enough
    staleTime: 60000, // 1 minute cache
  });
}
