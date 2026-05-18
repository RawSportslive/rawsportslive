import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SYNC_TOKEN = "ringzone-cron-secret-2026";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const OFFICIAL_CHANNELS = [
  // WRESTLING
  { channelId: 'UCJ5v_MCY6GNUBTO8-D3XoAg', name: 'WWE', category: 'Wrestling' },
  { channelId: 'UCIr4vkCsn0tdTW2xZ1jRG1g', name: 'AEW', category: 'Wrestling' },
  { channelId: 'UCaXkIU1QidjPwiAYu6GcHjg', name: 'TNA Wrestling', category: 'Wrestling' },

  // BASKETBALL
  { channelId: 'UCWJ2lWNubArHWmf3FIHbfcQ', name: 'NBA', category: 'Basketball' },
  { channelId: 'UCiWLfSweyRNmLpgEHekhoAg', name: 'ESPN NBA', category: 'Basketball' },

  // FOOTBALL / SOCCER
  { channelId: 'UCpcTrCXblq78GZrTUTLWeBw', name: 'UEFA', category: 'Football' },
  { channelId: 'UCG5qGWdu8nIRZqJ_GgDwQ-w', name: 'Premier League', category: 'Football' },
  { channelId: 'UCbt6MySP7zdv1jO1qXwQx-g', name: 'LaLiga', category: 'Football' },
  { channelId: 'UCVGOWXDMhXmkjR0D-X0K1NQ', name: 'ESPN FC', category: 'Football' },

  // CRICKET
  { channelId: 'UCt2JXOLNxqry7B_4rRZME3Q', name: 'ICC', category: 'Cricket' },
  { channelId: 'UCtw7q4OD7U66R6aJkH93M_g', name: 'Sony Sports Network', category: 'Cricket' },

  // UFC / MMA
  { channelId: 'UCvgfXK4nTYKudb0rFR6noLA', name: 'UFC', category: 'UFC' },
  { channelId: 'UCn8zNIfYAQNdrFRrr8oibKw', name: 'ESPN MMA', category: 'UFC' },

  // FORMULA 1
  { channelId: 'UCB_qr75-ydFVKSF9Dmo6izg', name: 'Formula 1', category: 'F1' },

  // TENNIS
  { channelId: 'UCzAYW60ZZ-rB8f-VqIsuPWg', name: 'ATP Tour', category: 'Tennis' },
  { channelId: 'UCEgdi0XIXXZ-qJOFPf4JSKw', name: 'Wimbledon', category: 'Tennis' },
  { channelId: 'UCiBr0bK06imaMbLc8sAEz0A', name: 'US Open Tennis', category: 'Tennis' },

  // ESPORTS
  { channelId: 'UCey_c7U86mJGz1VJWH5CYPA', name: 'ESL', category: 'Esports' },
  { channelId: 'UCzVgCrOcBAWYEHTtVOMPAtw', name: 'Valorant Champions Tour', category: 'Esports' },
  { channelId: 'UCVG8DaVIR1XQJrJWSf5Lzcg', name: 'PUBG Mobile Esports', category: 'Esports' },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SYNC_TOKEN}` && searchParams.get('token') !== SYNC_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YOUTUBE_API_KEY not configured' }, { status: 500 });
    }

    const newlySynced: string[] = [];
    const batch = adminDb.batch();

    // Query all channels concurrently in parallel to avoid Vercel gateway timeout
    await Promise.all(
      OFFICIAL_CHANNELS.map(async (channel) => {
        try {
          const uploadsPlaylistId = 'UU' + channel.channelId.substring(2);
          const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${YOUTUBE_API_KEY}`;
          
          const ytRes = await fetch(ytUrl, { cache: 'no-store' });
          if (!ytRes.ok) return;

          const ytData = await ytRes.json();
          const items = ytData.items || [];

          for (const item of items) {
            const snippet = item.snippet;
            const videoId = snippet.resourceId?.videoId;
            if (!videoId) continue;

            // Check existence
            const docSnap = await adminDb
              .collection('youtube_videos')
              .where('videoId', '==', videoId)
              .limit(1)
              .get();

            if (!docSnap.empty) continue;

            const title = snippet.title || 'Untitled Highlight';
            // Fallback to official YouTube high-quality thumbnail if not present
            const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            const description = snippet.description || '';
            const publishedAt = snippet.publishedAt || new Date().toISOString();

            const ref = adminDb.collection('youtube_videos').doc();
            batch.set(ref, {
              videoId,
              title,
              description,
              thumbnail,
              publishedAt,
              channelTitle: channel.name,
              categories: [channel.category, 'Highlights'],
              syncedAt: FieldValue.serverTimestamp(),
            });

            newlySynced.push(`${channel.category}: ${title}`);
          }
        } catch (err) {
          console.error(`Error processing channel ${channel.name}:`, err);
        }
      })
    );

    if (newlySynced.length > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: newlySynced.length > 0
        ? `✅ Synced ${newlySynced.length} new sports video(s) concurrently!`
        : '✅ Database is already fully updated!',
      syncedCount: newlySynced.length,
      syncedVideos: newlySynced,
    });

  } catch (error: any) {
    console.error('Parallel Multi-Sports Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
