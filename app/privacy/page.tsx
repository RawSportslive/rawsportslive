'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_TEXT = `RAWSPORTS LIVE - PRIVACY POLICY
Last Updated: May 2026

1. INFORMATION WE COLLECT
RawSports Live ("we", "our", or "us") respects your privacy. We collect the following types of information:
- Device Information: We collect device type, operating system version, and system language to optimize mobile presentation.
- Push Tokens: If you subscribe to mobile push alerts, we securely save your push token to Firestore. We do not sell or trade this data.
- Usage Data: We collect analytics regarding likes, comments, and most-watched video categories.

2. HOW WE USE YOUR INFORMATION
We use the collected data to:
- Provide premium and stable sports streaming highlights.
- Dispatch real-time live score updates and alerts.
- Monitor application performance and PWA standalone stability.

3. DATA RETENTION
We keep push notification tokens only as long as you remain subscribed. If you disable notifications, your token is deleted from our database.

4. THIRD-PARTY CDNS
We leverage public, secure CDNs (Cloudinary, YouTube, Unsplash) to stream fast sports highlights. We do not transmit user personal identifiers to these networks.`;

export default function PrivacyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const snap = await getDoc(doc(db, 'legal', 'privacy'));
        if (snap.exists()) {
          setContent(snap.data().content || DEFAULT_TEXT);
        } else {
          setContent(DEFAULT_TEXT);
        }
      } catch (err) {
        console.error("Error fetching Privacy Policy:", err);
        setContent(DEFAULT_TEXT);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#121212]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 shadow-lg app-top-header" style={{ backgroundColor: '#FFBF00', paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="font-display font-black text-xl md:text-2xl tracking-tighter uppercase italic select-none text-black">
            RAW<span className="text-white">SPORTS</span><span className="text-[10px] align-top ml-0.5 text-[#ff0000] font-black not-italic">LIVE</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black hover:opacity-85 transition-opacity">
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 pb-24 space-y-8">
        {/* Title */}
        <div className="flex items-center gap-4 border-b border-black/10 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-[#FFBF00] shadow-lg shadow-black/10">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-black">Privacy Policy</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">RawSports Live Official Compliance Document</p>
          </div>
        </div>

        {/* Content Box with stark high-contrast text */}
        <div className="bg-white border border-black/10 rounded-3xl p-6 md:p-10 shadow-lg">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-[#FFBF00]" size={36} />
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Loading compliance data...</p>
            </div>
          ) : (
            <div className="text-black text-sm md:text-base leading-relaxed space-y-6 whitespace-pre-wrap font-medium select-text">
              {content}
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="text-center pt-8 border-t border-black/5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RawSports Live v2.4.0 • Compliance Officer Desk</p>
        </div>
      </div>
    </div>
  );
}
