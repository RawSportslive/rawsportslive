// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL CHANNEL REGISTRY
// embedBlocked: true = channel restricts third-party iframe embedding
//   (these channels still appear as cards but open YouTube directly)
// ─────────────────────────────────────────────────────────────────────────────
export const OFFICIAL_CHANNELS: Record<
  string,
  { id: string; name: string; sport: string; embedBlocked?: boolean }[]
> = {
  wrestling: [
    { id: 'UCJ5v_MCY6GNUBTO8-D3XoAg', name: 'WWE', sport: 'wrestling' },
    { id: 'UCIr4vkCsn0tdTW2xZ1jRG1g', name: 'AEW', sport: 'wrestling' },
  ],
  football: [
    { id: 'UCpcTrCXblq78GZrTUTLWeBw', name: 'UEFA', sport: 'football' },
    { id: 'UCG5qGWdu8nIRZqJ_GgDwQ-g', name: 'Premier League', sport: 'football', embedBlocked: true },
    { id: 'UCVGOWXDMhXmkjR0D-X0K1NQ', name: 'ESPN FC', sport: 'football' },
    { id: 'UCQZLqSyOLRa-7M0zEAp-IMA', name: 'FIFA', sport: 'football' },
  ],
  cricket: [
    { id: 'UCt2JXOLNxqry7B_4rRZME3Q', name: 'ICC', sport: 'cricket' },
    { id: 'UCiWrjBhlICf_L_RK5y6Vrxw', name: 'BCCI', sport: 'cricket' },
  ],
  basketball: [
    { id: 'UCWJ2lWNubArHWmf3FIHbfcQ', name: 'NBA', sport: 'basketball', embedBlocked: true },
    { id: 'UCsT5MlSLLBvXjlxsQAOFnfA', name: 'NBA G League', sport: 'basketball' },
  ],
  ufc: [
    // UFC and ONE block embedding — using alternative combat sports that allow embeds
    { id: 'UCvgfXK4nTYKudb0rFR6noLA', name: 'UFC', sport: 'ufc', embedBlocked: true },
    { id: 'UCmfsfKgxFPSgCNoqRDAbcUQ', name: 'ONE Championship', sport: 'ufc' },
    { id: 'UCIndMGLuegSbMhZFUSDO_uQ', name: 'Bellator MMA', sport: 'ufc' },
    { id: 'UCYq5PJO-4dI42YMK8AKhfZA', name: 'PFL MMA', sport: 'ufc' },
  ],
  f1: [
    // Formula 1 blocks embedding via Formula One Management copyright
    { id: 'UCB_qr75-ydFVKSF9Dmo6izg', name: 'Formula 1', sport: 'f1', embedBlocked: true },
    { id: 'UCqQAFG5tJU3FHmj-HYvmEIA', name: 'MotoGP', sport: 'f1' },
    { id: 'UCGgKaTMhzEO3VPxmJ9JFx1g', name: 'NASCAR', sport: 'f1' },
  ],
  tennis: [
    { id: 'UCzAYW60ZZ-rB8f-VqIsuPWg', name: 'ATP Tour', sport: 'tennis' },
    { id: 'UCbHX_8tEbMoNrFJLwLUDKbw', name: 'WTA', sport: 'tennis' },
  ],
  esports: [
    { id: 'UCey_c7U86mJGz1VJWH5CYPA', name: 'ESL', sport: 'esports' },
    { id: 'UC8Wh-RX_xqzXuFdwqt3VOMA', name: 'ELEAGUE', sport: 'esports' },
  ],
  nepal: [
    { id: 'UC4yQ_w1wgFpMhZJhGCwxfGA', name: 'Kantipur TV HD', sport: 'nepal' },
    { id: 'UCHlMnGNQExmNHCtEBbdbTng', name: 'Image Channel', sport: 'nepal' },
    { id: 'UCW4JQdAkjI2_wCiSoCZxq0A', name: 'Himalaya TV', sport: 'nepal' },
    { id: 'UCm4O4pjBpAg3lRDCdEtZqCQ', name: 'AP1 HD Nepal', sport: 'nepal' },
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
  embedBlocked?: boolean;
}
