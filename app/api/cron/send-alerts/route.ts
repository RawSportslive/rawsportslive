import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

// Vercel Cron Jobs are completely free and bypass Firebase's Blaze Plan requirement!
// This route should be triggered by Vercel every 5 minutes.
export async function GET(request: Request) {
  try {
    // 1. Fetch upcoming events from our own API
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    const upcomingRes = await fetch(`${baseUrl}/api/live/upcoming?sport=all`);
    const data = await upcomingRes.json();
    const streams = data.streams || [];

    const now = Date.now();
    let sentCount = 0;

    // 2. Look for streams starting in exactly 15-20 minutes
    for (const stream of streams) {
      if (!stream.scheduledStartTime) continue;
      
      const startTime = new Date(stream.scheduledStartTime).getTime();
      const minutesUntilStart = (startTime - now) / (1000 * 60);

      // If event starts between 10 to 15 minutes from now
      if (minutesUntilStart > 0 && minutesUntilStart <= 15) {
        
        // Create a safe topic name (remove spaces, special chars)
        const topicName = stream.title.replace(/[^a-zA-Z0-9-_.~%]+/g, '_').substring(0, 50);

        try {
          // 3. Send Firebase Cloud Messaging push notification to everyone subscribed to this topic
          await adminMessaging.send({
            topic: topicName,
            notification: {
              title: `Live in 15 Mins: ${stream.channelName}!`,
              body: stream.title,
            },
            data: {
              url: `/live`,
              videoId: stream.videoId
            },
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                color: '#FFBF00',
              }
            }
          });
          sentCount++;
          console.log(`Sent FCM alert for topic: ${topicName}`);
        } catch (fcmError) {
          console.error(`FCM send error for ${topicName}:`, fcmError);
        }
      }
    }

    return NextResponse.json({ success: true, alertsSent: sentCount });

  } catch (error: any) {
    console.error('Cron Alert Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
