'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import SectionHeader from '@/components/SectionHeader';
import VideoPlayer from '@/components/VideoPlayer';
import VideoEngagement from '@/components/VideoEngagement';
import { PlayCircle, Trophy, Search, Bell, Menu, Loader2, X } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ news: any[]; videos: any[] }>({ news: [], videos: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Lock body scroll when search or video modal is open
  useEffect(() => {
    if (activeVideo || showSearch) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [activeVideo, showSearch]);

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

    // 3. Auto sync daily news from premium public Sky Sports RSS WWE feed
    const autoSyncNews = async () => {
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.skysports.com/rss/12040');
        const data = await response.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          for (const item of data.items.slice(0, 6)) {
            const newsId = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const img = item.thumbnail || item.enclosure?.link || `https://picsum.photos/seed/${newsId}/800/600`;
            await setDoc(doc(db, 'news', newsId), {
              title: item.title,
              excerpt: item.description || 'Catch the latest updates, highlights and roster standings on RawSports Live.',
              content: item.content || item.description || '',
              category: 'WWE News',
              image: img,
              author: item.author || 'Sky Sports WWE',
              createdAt: serverTimestamp()
            }, { merge: true });
          }
        }
      } catch (err) {
        console.error("Daily news auto sync failed:", err);
      }
    };

    autoSyncNews();

    return () => {
      unsubscribeNews();
      unsubscribeVideos();
    };
  }, []);

  // 4. Firestore Query-based Hybrid Real Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ news: [], videos: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = searchQuery.toLowerCase();
        const { getDocs } = await import('firebase/firestore');

        const newsSnap = await getDocs(collection(db, 'news'));
        const filteredNews = newsSnap.docs
          .map(d => ({ id: d.id, ...d.data() as any }))
          .filter(item => 
            item.title?.toLowerCase().includes(q) || 
            item.category?.toLowerCase().includes(q) ||
            item.excerpt?.toLowerCase().includes(q)
          );

        const videosSnap = await getDocs(collection(db, 'videos'));
        const filteredVideos = videosSnap.docs
          .map(d => ({ id: d.id, ...d.data() as any }))
          .filter(item => 
            item.title?.toLowerCase().includes(q) || 
            item.category?.toLowerCase().includes(q)
          );

        setSearchResults({ news: filteredNews, videos: filteredVideos });
      } catch (err) {
        console.error("Firestore search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RawSports Live",
    "url": "https://rawsportslive.vercel.app",
    "description": "Watch the latest WWE matches, replays, highlights, RAW, SmackDown, NXT, and WrestleMania videos.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rawsportslive.vercel.app/videos?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "RawSports Live",
    "url": "https://rawsportslive.vercel.app",
    "logo": "https://rawsportslive.vercel.app/logo.png"
  };

  return (
    <div className="min-h-screen bg-brand-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* Top Bar */}
      <header className="sticky top-0 z-50 shadow-lg app-top-header" style={{ backgroundColor: '#FFBF00', paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Menu className="cursor-pointer" color="#000" />
            <div className="font-display font-black text-xl md:text-2xl tracking-tighter uppercase italic select-none text-black">
              RAW<span className="text-white">SPORTS</span><span className="text-[10px] align-top ml-0.5 text-[#ff0000] font-black not-italic">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Search size={20} className="cursor-pointer" color="#000" onClick={() => setShowSearch(true)} />
            <div className="relative cursor-pointer group">
              <Bell size={20} color="#000" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full border-2 border-white" />
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
              className="absolute right-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFBF00] hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all z-[110] shadow-lg active:scale-95"
                style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
                aria-label="Close Player"
              >
                <X size={16} />
                <span>Close Player</span>
              </button>
              <div className="w-full max-w-6xl">
                <VideoPlayer 
                  url={activeVideo.url} 
                  title={activeVideo.title} 
                  thumbnail={activeVideo.thumbnail}
                  recommendations={videos.filter(v => v.id !== activeVideo.id)} 
                />
                <div className="mt-6 space-y-2">
                  <h2 className="text-3xl font-bold uppercase tracking-tight">{activeVideo.title}</h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{activeVideo.category} • RawSports Live Original</p>
                </div>
                <VideoEngagement videoId={activeVideo.id} videoTitle={activeVideo.title} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Premium Search Modal */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col p-6 md:p-12 overflow-y-auto"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2rem)' }}
            >
              <div className="w-full max-w-4xl mx-auto space-y-8">
                {/* Search Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search matches, videos, daily news..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-base md:text-lg font-bold placeholder-gray-500 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                    />
                  </div>
                  <button
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    className="p-3 rounded-2xl bg-[#FFBF00] text-black font-bold uppercase hover:bg-amber-500 transition-all flex items-center justify-center"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search Results */}
                <div className="space-y-8">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 className="animate-spin text-[#FFBF00]" size={36} />
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Searching Arena...</p>
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Videos Section */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">
                          Matches & Videos ({searchResults.videos.length})
                        </h4>
                        {searchResults.videos.length > 0 ? (
                          <div className="space-y-3">
                            {searchResults.videos.map((video) => (
                              <div
                                key={video.id}
                                onClick={() => {
                                  setActiveVideo(video);
                                  setShowSearch(false);
                                  setSearchQuery('');
                                }}
                                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3 rounded-2xl cursor-pointer border border-white/5 transition-all group"
                              >
                                <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white font-bold text-sm truncate group-hover:text-[#FFBF00] transition-colors">
                                    {video.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                                    {video.category}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 font-bold uppercase">No videos found</p>
                        )}
                      </div>

                      {/* News Section */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">
                          Daily News Articles ({searchResults.news.length})
                        </h4>
                        {searchResults.news.length > 0 ? (
                          <div className="space-y-3">
                            {searchResults.news.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 transition-all group"
                              >
                                <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white font-bold text-sm line-clamp-2">
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] text-[#FFBF00] font-bold uppercase tracking-wider mt-0.5">
                                    {item.category}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 font-bold uppercase">No articles found</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Search className="mx-auto text-white/10 mb-4 animate-pulse" size={48} />
                      <p className="text-gray-500 text-xs font-black uppercase tracking-widest">
                        Type to search matches, superstar rumors, & headlines
                      </p>
                    </div>
                  )}
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
              <div key={video.id} onClick={() => setActiveVideo(video)} className="relative group cursor-pointer rounded-2xl overflow-hidden glass">
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
                  <h3 className="font-bold text-lg text-[#121212] group-hover:text-brand-red transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
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
