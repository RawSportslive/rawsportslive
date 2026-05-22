// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL CHANNEL REGISTRY  (Play Store safe – only verified, official channels)
// ─────────────────────────────────────────────────────────────────────────────
export const OFFICIAL_CHANNELS: Record<string, { id: string; name: string; sport: string }[]> = {
  wrestling: [
    { id: 'UCJ5v_MCY6GNUBTO8-D3XoAg', name: 'WWE', sport: 'wrestling' },
    { id: 'UCIr4vkCsn0tdTW2xZ1jRG1g', name: 'AEW', sport: 'wrestling' },
  ],
  basketball: [
    { id: 'UCWJ2lWNubArHWmf3FIHbfcQ', name: 'NBA', sport: 'basketball' },
  ],
  football: [
    { id: 'UCpcTrCXblq78GZrTUTLWeBw', name: 'UEFA', sport: 'football' },
    { id: 'UCG5qGWdu8nIRZqJ_GgDwQ-w', name: 'Premier League', sport: 'football' },
    { id: 'UCVGOWXDMhXmkjR0D-X0K1NQ', name: 'ESPN FC', sport: 'football' },
  ],
  cricket: [
    { id: 'UCt2JXOLNxqry7B_4rRZME3Q', name: 'ICC', sport: 'cricket' },
  ],
  ufc: [
    { id: 'UCvgfXK4nTYKudb0rFR6noLA', name: 'UFC', sport: 'ufc' },
  ],
  f1: [
    { id: 'UCB_qr75-ydFVKSF9Dmo6izg', name: 'Formula 1', sport: 'f1' },
  ],
  tennis: [
    { id: 'UCzAYW60ZZ-rB8f-VqIsuPWg', name: 'ATP Tour', sport: 'tennis' },
  ],
  esports: [
    { id: 'UCey_c7U86mJGz1VJWH5CYPA', name: 'ESL', sport: 'esports' },
    { id: 'UCzVgCrOcBAWYEHTtVOMPAtw', name: 'Valorant Champions Tour', sport: 'esports' },
  ],
};

export const ALL_CHANNELS = Object.values(OFFICIAL_CHANNELS).flat();

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
  sourceLabel: string;
  embedUrl: string;
}
