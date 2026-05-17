import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCJ5v_MCY6GNUBTO8-D3XoAg';
const SYNC_TOKEN = "ringzone-cron-secret-2026"; // Must match firestore.rules

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SYNC_TOKEN}` && searchParams.get('token') !== SYNC_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
    }

    // Fetch latest videos from YouTube (limit to 15 to keep it fast)
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=15`;
    const ytResponse = await fetch(ytUrl);
    const ytData = await ytResponse.json();

    if (!ytResponse.ok) {
      return NextResponse.json({ error: ytData.error?.message || 'Failed to fetch YouTube API' }, { status: 500 });
    }

    const videos = ytData.items.filter((item: any) => item.id.kind === 'youtube#video');
    if (videos.length === 0) {
      return NextResponse.json({ success: true, message: 'No new videos found on YouTube.' });
    }

    const videoIds = videos.map((video: any) => video.id.videoId);

    // BULK QUERY: Find which of these video IDs already exist in Firestore in a single query
    const q = query(collection(db, 'youtube_videos'), where('videoId', 'in', videoIds));
    const querySnapshot = await getDocs(q);
    const existingVideoIds = new Set(querySnapshot.docs.map(doc => doc.data().videoId));

    const syncedVideos = [];

    // Filter out the ones that already exist
    for (const video of videos) {
      const videoId = video.id.videoId;
      const snippet = video.snippet;

      if (!existingVideoIds.has(videoId)) {
        // Auto-categorize based on title
        const titleLower = snippet.title.toLowerCase();
        let categories = ['Latest'];
        
        if (titleLower.includes('raw')) {
          categories.push('RAW');
        }
        if (titleLower.includes('smackdown') || titleLower.includes('smack down')) {
          categories.push('SmackDown');
        }
        if (titleLower.includes('wrestlemania') || titleLower.includes('wrestle mania')) {
          categories.push('WrestleMania');
        }
        if (titleLower.includes('highlight') || titleLower.includes('top 10') || titleLower.includes('moments') || titleLower.includes('full match')) {
          categories.push('Highlights');
        }
        
        if (categories.length === 1) {
          categories.push('Highlights');
        }

        // Add to database
        await addDoc(collection(db, 'youtube_videos'), {
          videoId: videoId,
          title: snippet.title,
          description: snippet.description,
          thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          publishedAt: snippet.publishedAt,
          channelTitle: snippet.channelTitle,
          categories: categories,
          syncedAt: serverTimestamp(),
          syncToken: SYNC_TOKEN
        });

        syncedVideos.push(videoId);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: syncedVideos.length > 0 
        ? `Synced ${syncedVideos.length} new videos successfully.` 
        : 'Database is already up to date!',
      syncedVideos 
    });

  } catch (error: any) {
    console.error('YouTube Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
