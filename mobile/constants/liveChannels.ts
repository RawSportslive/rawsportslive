// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL LIVE SPORTS CHANNELS REGISTRY
// All channels are official, verified YouTube channels only.
// Embedding via YouTube official player ensures full Play Store compliance.
// ─────────────────────────────────────────────────────────────────────────────

export interface Channel {
  id: string;
  name: string;
  sport: SportKey;
  description: string;
}

export type SportKey =
  | 'all'
  | 'wrestling'
  | 'football'
  | 'cricket'
  | 'basketball'
  | 'ufc'
  | 'f1'
  | 'tennis'
  | 'esports';

export const SPORT_LABELS: Record<SportKey, string> = {
  all: '🔥 All',
  wrestling: '🤼 Wrestling',
  football: '⚽ Football',
  cricket: '🏏 Cricket',
  basketball: '🏀 Basketball',
  ufc: '🥊 UFC/MMA',
  f1: '🏎️ Formula 1',
  tennis: '🎾 Tennis',
  esports: '🎮 Esports',
};

export const SPORT_COLORS: Record<SportKey, string> = {
  all: '#E50914',
  wrestling: '#FF6B00',
  football: '#00A651',
  cricket: '#1E88E5',
  basketball: '#F57C00',
  ufc: '#D32F2F',
  f1: '#E91E63',
  tennis: '#8BC34A',
  esports: '#7B1FA2',
};

export const SPORT_ICONS: Record<SportKey, string> = {
  all: '🔥',
  wrestling: '🤼',
  football: '⚽',
  cricket: '🏏',
  basketball: '🏀',
  ufc: '🥊',
  f1: '🏎️',
  tennis: '🎾',
  esports: '🎮',
};

export const OFFICIAL_CHANNELS: Record<SportKey, Channel[]> = {
  all: [],
  wrestling: [
    {
      id: 'UCJ5v_MCY6GNUBTO8-D3XoAg',
      name: 'WWE',
      sport: 'wrestling',
      description: 'World Wrestling Entertainment – Official Channel',
    },
    {
      id: 'UCIr4vkCsn0tdTW2xZ1jRG1g',
      name: 'AEW',
      sport: 'wrestling',
      description: 'All Elite Wrestling – Official Channel',
    },
  ],
  basketball: [
    {
      id: 'UCWJ2lWNubArHWmf3FIHbfcQ',
      name: 'NBA',
      sport: 'basketball',
      description: 'National Basketball Association – Official Channel',
    },
  ],
  football: [
    {
      id: 'UCpcTrCXblq78GZrTUTLWeBw',
      name: 'UEFA',
      sport: 'football',
      description: 'Union of European Football Associations – Official Channel',
    },
    {
      id: 'UCG5qGWdu8nIRZqJ_GgDwQ-w',
      name: 'Premier League',
      sport: 'football',
      description: 'English Premier League – Official Channel',
    },
    {
      id: 'UCVGOWXDMhXmkjR0D-X0K1NQ',
      name: 'ESPN FC',
      sport: 'football',
      description: 'ESPN Football Coverage – Official Channel',
    },
  ],
  cricket: [
    {
      id: 'UCt2JXOLNxqry7B_4rRZME3Q',
      name: 'ICC',
      sport: 'cricket',
      description: 'International Cricket Council – Official Channel',
    },
  ],
  ufc: [
    {
      id: 'UCvgfXK4nTYKudb0rFR6noLA',
      name: 'UFC',
      sport: 'ufc',
      description: 'Ultimate Fighting Championship – Official Channel',
    },
  ],
  f1: [
    {
      id: 'UCB_qr75-ydFVKSF9Dmo6izg',
      name: 'Formula 1',
      sport: 'f1',
      description: 'Formula 1 – Official Channel',
    },
  ],
  tennis: [
    {
      id: 'UCzAYW60ZZ-rB8f-VqIsuPWg',
      name: 'ATP Tour',
      sport: 'tennis',
      description: 'Association of Tennis Professionals – Official Channel',
    },
  ],
  esports: [
    {
      id: 'UCey_c7U86mJGz1VJWH5CYPA',
      name: 'ESL',
      sport: 'esports',
      description: 'ESL Gaming – Official Esports Channel',
    },
    {
      id: 'UCzVgCrOcBAWYEHTtVOMPAtw',
      name: 'Valorant Champions Tour',
      sport: 'esports',
      description: 'Valorant Champions Tour – Official Channel',
    },
  ],
};

export const ALL_SPORT_KEYS: SportKey[] = [
  'all',
  'wrestling',
  'football',
  'cricket',
  'basketball',
  'ufc',
  'f1',
  'tennis',
  'esports',
];
