import axios from 'axios';

// Live production Vercel gateway + local fallback
const BASE_URL = 'https://rawsportslive.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LiveMatch {
  id: string;
  sport: 'football' | 'cricket' | 'basketball' | 'ufc' | 'f1' | 'tennis' | 'esports';
  league: string;
  status: 'live' | 'upcoming' | 'finished';
  timer?: string;
  teamHome: { name: string; logo: string; score: string; detail?: string };
  teamAway: { name: string; logo: string; score: string; detail?: string };
  venue?: string;
  stats?: { label: string; home: number | string; away: number | string }[];
  events?: { time: string; type: string; player: string; detail?: string }[];
}

export interface Fixture {
  id: string;
  sport: string;
  league: string;
  date: string; // ISO String
  teamHome: { name: string; logo: string };
  teamAway: { name: string; logo: string };
  venue?: string;
}

export interface Standing {
  rank: number;
  team: { name: string; logo: string };
  played: number;
  won: number;
  drawn?: number;
  lost: number;
  points: number;
  form?: string;
}

export const sportsApi = {
  // Get all active live matches for a given sport
  getLiveMatches: async (sport: string): Promise<LiveMatch[]> => {
    try {
      const response = await api.get(`/api/sports/${sport}/live`);
      return response.data || [];
    } catch (error) {
      console.warn(`Error fetching live matches for ${sport}, returning mock failover.`, error);
      return [];
    }
  },

  // Get upcoming fixtures for a given sport
  getFixtures: async (sport: string): Promise<Fixture[]> => {
    try {
      const response = await api.get(`/api/sports/${sport}/fixtures`);
      return response.data || [];
    } catch (error) {
      console.warn(`Error fetching fixtures for ${sport}, returning mock failover.`, error);
      return [];
    }
  },

  // Get league standings for a given sport
  getStandings: async (sport: string): Promise<Standing[]> => {
    try {
      const response = await api.get(`/api/sports/${sport}/standings`);
      return response.data || [];
    } catch (error) {
      console.warn(`Error fetching standings for ${sport}, returning mock failover.`, error);
      return [];
    }
  },
};
