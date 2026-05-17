'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import SectionHeader from '@/components/SectionHeader';
import VideoPlayer from '@/components/VideoPlayer';
import { PlayCircle, Trophy, Search, Bell, Menu, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for news updates in real-time
    const qNews = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(6));
    const unsubscribeNews = onSnapshot(qNews, (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("News fetch error:", error);
      setLoading(false);
    });

    // 2. Listen for videos in real-time
    const qVideos = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(4));
    const unsubscribeVideos = onSnapshot(qVideos, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Videos fetch error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeNews();
      unsubscribeVideos();
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-brand-red shadow-lg shadow-brand-red/35 border-b border-red-700/30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Menu className="text-white cursor-pointer hover:text-red-100" />
            <img src="/logo.png" alt="RawSports Live" className="h-10 object-contain" />
          </div>
          <div className="flex items-center gap-5">
            <Search size={20} className="text-white cursor-pointer hover:text-red-100" />
            <div className="relative cursor-pointer group">
              <Bell size={20} className="text-white group-hover:text-red-100" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-brand-red" />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-12">
        <Hero />

        {/* Video Player Modal */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
            >
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-8 right-8 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest z-10"
              >
                Close Player
              </button>
              <div className="w-full max-w-6xl">
                <VideoPlayer 
                  url={activeVideo.url} 
                  title={activeVideo.title} 
                  thumbnail={activeVideo.thumbnail}
                  recommendations={videos.filter(v => v.id !== activeVideo.id)} 
                />
                <div className="mt-8 space-y-2">
                  <h2 className="text-3xl font-bold uppercase tracking-tight">{activeVideo.title}</h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{activeVideo.category} • RawSports Live Original</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trending Section */}
        <section className="px-6 space-y-6">
          <SectionHeader title="Top Headlines" icon={PlayCircle} href="/news" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        {/* Highlights Section */}
        <section className="px-6 space-y-6">
          <SectionHeader title="Video Highlights" icon={Trophy} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} onClick={() => setActiveVideo(video)} className="relative group cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                <div className="relative aspect-video">
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-brand-red/90 text-white flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                      <PlayCircle size={28} />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-white group-hover:text-brand-red transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
                    {video.category} • Watch Now
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter / Join Section */}
        <section className="px-6 pb-12">
          <div className="bg-gradient-to-br from-brand-red to-red-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl font-bold leading-none">Unlock Exclusive <br />Insider Access</h2>
              <p className="text-sm text-white/90 max-w-sm font-medium">Join the RawSports Live community to get early access to match cards, exclusive wallpapers, and member-only rewards.</p>
              <div className="flex gap-4 pt-2">
                <button className="bg-white text-brand-red px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-all shadow-lg">
                  Join Insider
                </button>
              </div>
            </div>
            <Trophy size={180} className="absolute -right-8 -bottom-8 opacity-10 -rotate-12" />
          </div>
        </section>
      </div>
    </div>
  );
}
