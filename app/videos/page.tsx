'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { PlayCircle, Search, RefreshCw, X } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoEngagement from '@/components/VideoEngagement';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Decode HTML entities
function decodeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'");
}

const categories = ["All", "RAW", "SmackDown", "Football", "Cricket", "Basketball", "UFC", "F1", "Tennis", "Esports", "Wrestling"];

interface Video {
  id: string;
  ytId: string;
  url?: string;
  title: string;
  category: string;
  categories?: string[];
  thumbnail: string;
  createdAt?: any;
  publishedAt?: string;
}

export default function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyPositions, setHistoryPositions] = useState<Record<string, number>>({});
  const [startAt, setStartAt] = useState(0);

  // Fetch watch history
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDocs(collection(db, `users/${user.uid}/history`));
      const positions: Record<string, number> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.lastPosition) positions[d.id] = data.lastPosition;
      });
      setHistoryPositions(positions);
    });
    return () => unsub();
  }, []);

  // Lock body scroll when video player modal is open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedVideo]);

  const fetchAllVideos = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const manualSnap = await getDocs(query(collection(db, 'videos'), orderBy('createdAt', 'desc')));
      const manualVideos = manualSnap.docs.map(doc => ({
        id: doc.id, ...doc.data()
      })) as Video[];

      const ytSnap = await getDocs(query(collection(db, 'youtube_videos'), orderBy('publishedAt', 'desc')));
      const ytVideos = ytSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ytId: data.videoId,
          title: decodeHtml(data.title),
          thumbnail: data.thumbnail,
          category: data.categories?.[0] || 'Latest',
          categories: data.categories,
          publishedAt: data.publishedAt,
        } as Video;
      });

      // Show real, live fetched multi-sport and WWE videos directly from your Firestore DB!
      setVideos([...manualVideos, ...ytVideos]);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAllVideos(); }, [fetchAllVideos]);

  // Auto resume
  useEffect(() => {
    if (loading) return;
    const raw = localStorage.getItem('ringzone_resume');
    if (!raw) return;
    try {
      const resumeData = JSON.parse(raw);
      localStorage.removeItem('ringzone_resume');
      const syntheticVideo: Video = {
        id: '__resume__',
        ytId: resumeData.url?.includes('v=') ? resumeData.url.split('v=')[1]?.split('&')[0] : '',
        url: resumeData.url,
        title: resumeData.title || 'Resuming...',
        category: '',
        thumbnail: resumeData.thumbnail || '',
      };
      setStartAt(resumeData.lastPosition || 0);
      setSelectedVideo(syntheticVideo);
    } catch (e) {
      localStorage.removeItem('ringzone_resume');
    }
  }, [loading]);

  const filteredVideos = videos.filter(v => {
    const matchesCategory = activeCategory === "All" || v.category === activeCategory || v.categories?.includes(activeCategory);
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-4 pb-24 px-6 space-y-6 bg-[#FAF9F6]">
      <header className="flex items-center justify-between py-2 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-[#121212] leading-none">
              RAWSPORTS <span className="text-brand-red">LIVE</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              Official Multi-Sports Video Arena
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchAllVideos(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black hover:bg-gray-50 shadow-sm transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-brand-red' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh'}
        </button>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex-1 bg-white border border-gray-200 flex items-center px-4 py-3.5 rounded-2xl shadow-sm">
          <Search size={20} className="text-gray-400" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all videos, highlights..." 
            className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full ml-3 placeholder:text-gray-400 text-[#121212]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat 
                  ? 'bg-brand-red text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {videos.length === 0 && loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="animate-pulse space-y-4">
              <div className="aspect-video bg-gray-200 rounded-2xl" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 rounded-lg w-5/6" />
                <div className="h-3 bg-gray-100 rounded-md w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={video.id}
                onClick={() => {
                  const vidId = video.ytId || video.url?.split('v=')[1]?.split('&')[0];
                  setStartAt(vidId && historyPositions[vidId] ? historyPositions[vidId] : 0);
                  setSelectedVideo(video);
                }}
                className="group cursor-pointer transition-all"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-[#FFBF00] text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                      {video.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white scale-95 group-hover:scale-100 transition-transform">
                      <PlayCircle size={30} fill="currentColor" className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-3.5 space-y-1">
                  <h3 className="text-sm font-bold leading-snug text-[#121212] group-hover:text-brand-red transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-400 text-[9px] font-extrabold uppercase tracking-widest">
                    Featured Replay
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 overflow-y-auto no-scrollbar flex flex-col items-center justify-start py-10 md:py-16 px-4 md:px-12"
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute right-4 md:right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all z-[110] shadow-[0_4px_20px_rgba(255,0,0,0.4)]"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
            >
              <X size={16} />
              <span>Close Player</span>
            </button>
            <div className="w-full max-w-6xl my-auto space-y-6">
              <VideoPlayer 
                url={selectedVideo.url || `https://www.youtube.com/watch?v=${selectedVideo.ytId}`} 
                title={selectedVideo.title}
                thumbnail={selectedVideo.thumbnail}
                recommendations={filteredVideos.filter(v => v.id !== selectedVideo.id)}
                startAt={startAt}
              />
              <div className="space-y-4 text-white">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">{selectedVideo.title}</h2>
                  <p className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mt-1">Featured Replay • RawSports Original</p>
                </div>
                
                {/* Embedded Likes, Dislikes, and Real Firestore Comments */}
                <div className="border-t border-white/10 pt-4">
                  <VideoEngagement videoId={selectedVideo.id} videoTitle={selectedVideo.title} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && filteredVideos.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <PlayCircle size={40} className="text-gray-300" />
          <h3 className="text-base font-bold uppercase text-[#121212]">No Videos Found</h3>
          <p className="text-gray-500 text-xs max-w-xs">Try exploring another category or check back later for new content.</p>
        </div>
      )}
    </div>
  );
}
