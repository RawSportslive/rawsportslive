import { NextResponse } from 'next/server';
import { OFFICIAL_CHANNELS } from '../streams/route';

// Returns the full official channel registry to the mobile app
// Used by the admin panel and channel browser feature
export async function GET() {
  const channelList = Object.entries(OFFICIAL_CHANNELS).map(([sport, channels]) => ({
    sport,
    channels: channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      sport: ch.sport,
      youtubeUrl: `https://www.youtube.com/channel/${ch.id}`,
    })),
  }));

  return NextResponse.json({
    sports: channelList,
    totalChannels: Object.values(OFFICIAL_CHANNELS).flat().length,
    disclaimer:
      'All channels are official, verified sports organizations. Content is embedded via YouTube official player only. RawSports Live does not host, download, or restream any copyrighted content.',
  });
}
