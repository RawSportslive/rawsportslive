import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token, topic, action } = await request.json();

    if (!token || !topic || !action) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Subscribe or unsubscribe the token from the topic
    if (action === 'subscribe') {
      await adminMessaging.subscribeToTopic(token, topic);
      console.log(`Subscribed ${token.substring(0, 10)}... to topic: ${topic}`);
    } else if (action === 'unsubscribe') {
      await adminMessaging.unsubscribeFromTopic(token, topic);
      console.log(`Unsubscribed ${token.substring(0, 10)}... from topic: ${topic}`);
    }

    return NextResponse.json({ success: true, action, topic });
  } catch (error: any) {
    console.error('Topic subscription error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
