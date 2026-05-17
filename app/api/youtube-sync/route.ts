import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCJ5v_MCY6GNUBTO8-D3XoAg';
const SYNC_TOKEN = "ringzone-cron-secret-2026";

export const maxDuration = 30; // Allow up to 30s on Vercel Hobby

export async function GET(request: Request) {
  try {
    // Auth check
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SYNC_TOKEN}` && searchParams.get('token') !== SYNC_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YOUTUBE_API_KEY not configured' }, { status: 500 });
    }

    // 1. Fetch latest 15 videos from YouTube
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=15&type=video`;
    const ytRes = await fetch(ytUrl);
    const ytData = await ytRes.json();

    if (!ytRes.ok) {
      return NextResponse.json({ error: ytData.error?.message || 'YouTube API error' }, { status: 500 });
    }

    const videos = (ytData.items || []).filter((item: any) => item.id?.videoId);
    if (videos.length === 0) {
      return NextResponse.json({ success: true, message: 'No videos found from YouTube.', syncedVideos: [] });
    }

    const videoIds = videos.map((v: any) => v.id.videoId);

    // 2. Bulk check which video IDs already exist using Admin SDK (fast, no timeout)
    const existingSnap = await adminDb
      .collection('youtube_videos')
      .where('videoId', 'in', videoIds)
      .select('videoId')
      .get();

    const existingIds = new Set(existingSnap.docs.map(d => d.data().videoId));

    // 3. Write new videos using a batch (fast atomic write)
    const batch = adminDb.batch();
    const syncedVideos: string[] = [];

    for (const video of videos) {
      const videoId = video.id.videoId;
      if (existingIds.has(videoId)) continue;

      const snippet = video.snippet;
      const titleLower = snippet.title.toLowerCase();
      const categories = ['Latest'];

      if (titleLower.includes('raw')) categories.push('RAW');
      if (titleLower.includes('smackdown') || titleLower.includes('smack down')) categories.push('SmackDown');
      if (titleLower.includes('wrestlemania')) categories.push('WrestleMania');
      if (titleLower.includes('highlight') || titleLower.includes('top 10') || titleLower.includes('moments') || titleLower.includes('full match')) categories.push('Highlights');
      if (categories.length === 1) categories.push('Highlights');

      const ref = adminDb.collection('youtube_videos').doc();
      batch.set(ref, {
        videoId,
        title: snippet.title,
        description: snippet.description || '',
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
        publishedAt: snippet.publishedAt,
        channelTitle: snippet.channelTitle,
        categories,
        syncedAt: FieldValue.serverTimestamp(),
      });

      syncedVideos.push(videoId);
    }

    if (syncedVideos.length > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: syncedVideos.length > 0
        ? `✅ Synced ${syncedVideos.length} new WWE video(s)!`
        : '✅ Database is already up to date!',
      syncedVideos,
    });

  } catch (error: any) {
    console.error('YouTube Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
