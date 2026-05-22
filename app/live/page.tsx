import React from 'react';
import LiveClient from './LiveClient';

// Enable ISR (Incremental Static Regeneration) for this page.
// The page will be cached at the edge and revalidated in the background every 3 minutes.
export const revalidate = 180;

export default async function LivePage() {
  // Fetch data directly on the server to ensure 0-second delay on the client
  // No loading spinners, the HTML is sent to the browser fully populated!
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rawsportslive.vercel.app';
  
  let liveStreams = [];
  let upcomingStreams = [];
  
  try {
    const [liveRes, upcomingRes] = await Promise.all([
      fetch(`${baseUrl}/api/live/streams?sport=all`, { next: { revalidate: 180 } }),
      fetch(`${baseUrl}/api/live/upcoming?sport=all`, { next: { revalidate: 180 } })
    ]);
    
    if (liveRes.ok) {
      const liveData = await liveRes.json();
      liveStreams = liveData.streams || [];
    }
    
    if (upcomingRes.ok) {
      const upcomingData = await upcomingRes.json();
      upcomingStreams = upcomingData.streams || [];
    }
  } catch (error) {
    console.error("Server Component failed to fetch live data:", error);
  }

  return (
    <LiveClient 
      initialLiveStreams={liveStreams} 
      initialUpcomingStreams={upcomingStreams} 
    />
  );
}
