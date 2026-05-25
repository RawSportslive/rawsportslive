'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import LegalDoc from '@/components/LegalDoc';

const DEFAULT_TEXT = `RAWSPORTS LIVE - TERMS OF SERVICE
Last Updated: May 2026

1. ACCEPTANCE OF TERMS
By accessing the RawSports Live application, you agree to comply with these terms. If you do not agree, please do not use the application.

2. STREAMING & FAIR USE
We curate public, user-shared, and official sport replays. All trademarked content (including WWE logos, superstars, and wrestling matches) belong to their respective copyright holders. We host this for pure sports entertainment, educational, and commentary purposes.

3. RULES OF CONDUCT
When posting comments or using interaction features:
- You must not post defamatory, abusive, or illegal comments.
- You must not spam the video interaction sections.
- We reserve the right to remove any comments or ban administrative access to violators.

4. LIMITATION OF LIABILITY
RawSports Live provides video feeds "as is". We are not liable for any streaming interruptions, video feed deprecations from third-party networks, or notification delays.`;

export default function TermsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const snap = await getDoc(doc(db, 'legal', 'terms'));
        if (snap.exists()) {
          setContent(snap.data().content || '');
        } else {
          setContent(DEFAULT_TEXT);
        }
      } catch (err) {
        console.error("Error fetching Terms of Service:", err);
        setContent(DEFAULT_TEXT);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, []);

  // Determine if the fetched database content is a custom memo/addendum
  const isCustomAddendum = content && content.trim() !== '' && content.trim() !== DEFAULT_TEXT.trim();

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

      <div className="max-w-4xl mx-auto px-6 py-12 pb-24 space-y-8 animate-fade-in">
        {/* Title */}
        <div className="flex items-center gap-4 border-b border-black/10 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-[#FFBF00] shadow-lg shadow-black/10">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-black">Terms of Service</h1>
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
            <LegalDoc 
              policyKey="terms" 
              dynamicAddendum={isCustomAddendum ? content : undefined} 
            />
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
