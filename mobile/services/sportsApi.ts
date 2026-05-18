import axios from 'axios';

// -------------------------------------------------------------
// SECURE ENDPOINT CONFIGURATION
// -------------------------------------------------------------
// Since we deploy changes in real-time to Vercel, targeting the Vercel 
// API ensures that the mobile app works instantly out-of-the-box on 
// physical devices, iOS simulators, and Android emulators without manual IP setup!
const PRODUCTION_URL = 'https://rawsportslive.vercel.app/api';
const LOCAL_DEV_URL = 'http://localhost:3000/api'; // iOS Simulator
const ANDROID_EMULATOR_URL = 'http://10.0.2.2:3000/api'; // Android Emulator

const api = axios.create({
  baseURL: PRODUCTION_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Graceful fallback system for local development testing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If production endpoint fails or is in cold-start, we try local fallbacks in development
    if (__DEV__ && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Attempt iOS simulator localhost
      try {
        console.log('Production API failed. Retrying local iOS endpoint...');
        originalRequest.baseURL = LOCAL_DEV_URL;
        return await axios(originalRequest);
      } catch (err1) {
        // Attempt Android emulator host loopback
        try {
          console.log('Local iOS failed. Retrying local Android endpoint...');
          originalRequest.baseURL = ANDROID_EMULATOR_URL;
          return await axios(originalRequest);
        } catch (err2) {
          console.error('All sports API endpoints failed.', err2);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const sportsApi = {
  getLiveScores: async (sport: string) => {
    const res = await api.get(`/sports/${sport}/live`);
    return res.data;
  },
  
  getFixtures: async (sport: string) => {
    const res = await api.get(`/sports/${sport}/fixtures`);
    return res.data;
  },
  
  getStandings: async (sport: string) => {
    const res = await api.get(`/sports/${sport}/standings`);
    return res.data;
  },
  
  // Custom global search mock/proxy
  searchSports: async (query: string) => {
    // Return unified search matching queries
    const sports = ['football', 'cricket', 'basketball', 'ufc', 'f1', 'tennis', 'esports'];
    const results = [];
    
    // Quick search simulation
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      if ('premier league'.includes(q) || 'arsenal'.includes(q) || 'chelsea'.includes(q) || 'football'.includes(q)) {
        results.push({ id: 'fb-live-1', type: 'match', sport: 'football', name: 'Arsenal vs Chelsea', subtitle: 'Premier League - Live' });
        results.push({ id: 'fb-fx-1', type: 'match', sport: 'football', name: 'Manchester City vs Real Madrid', subtitle: 'Champions League - Upcoming' });
      }
      if ('india'.includes(q) || 'australia'.includes(q) || 'cricket'.includes(q)) {
        results.push({ id: 'cr-live-1', type: 'match', sport: 'cricket', name: 'India vs Australia', subtitle: 'WTC Finals - Live' });
      }
      if ('lakers'.includes(q) || 'warriors'.includes(q) || 'nba'.includes(q)) {
        results.push({ id: 'bk-live-1', type: 'match', sport: 'basketball', name: 'LA Lakers vs Golden State Warriors', subtitle: 'NBA - Live' });
      }
    }
    return results;
  }
};
