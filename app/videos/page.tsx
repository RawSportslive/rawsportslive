'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { PlayCircle, Search, Loader2, RefreshCw } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Decode HTML entities like &quot; &amp; &#39; etc.
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

const categories = ["All", "RAW", "SmackDown", "WrestleMania", "Classic", "Interviews"];

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
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyPositions, setHistoryPositions] = useState<Record<string, number>>({});
  const [startAt, setStartAt] = useState(0);

  // Fetch user's watch history positions
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
          category: data.categories?.[1] || data.categories?.[0] || 'Latest',
          categories: data.categories,
          publishedAt: data.publishedAt,
        } as Video;
      });

      setVideos([...manualVideos, ...ytVideos]);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAllVideos(); }, [fetchAllVideos]);

  // Auto-open video from Watch History (resume feature)
  useEffect(() => {
    if (loading) return;
    const raw = localStorage.getItem('ringzone_resume');
    if (!raw) return;
    try {
      const resumeData = JSON.parse(raw);
      localStorage.removeItem('ringzone_resume');
      // Build a synthetic video object from the stored data
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

  const filteredVideos = activeCategory === "All" 
    ? videos 
    : videos.filter(v => 
        v.category === activeCategory || 
        v.categories?.includes(activeCategory)
      );

  const videoFeedSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": videos.slice(0, 10).map((video, index) => {
      const videoUrl = video.url || `https://www.youtube.com/watch?v=${video.ytId}`;
      const finalThumb = video.thumbnail || `https://img.youtube.com/vi/${video.ytId}/maxresdefault.jpg`;

      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "VideoObject",
          "name": video.title,
          "description": `Watch ${video.title} replays and full match highlights on RawSports Live.`,
          "thumbnailUrl": finalThumb,
          "uploadDate": video.publishedAt || new Date().toISOString(),
          "embedUrl": videoUrl
        }
      };
    })
  };

  return (
    <div className="min-h-screen pt-4 pb-24 px-6 space-y-6 bg-brand-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoFeedSchema) }}
      />
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="RawSports Live" className="h-12 w-12 object-contain rounded-xl" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-[#121212] leading-none">
              RAWSPORTS <span className="text-brand-red">LIVE</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest">
              WWE Video Feed
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchAllVideos(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-black/5 border border-black/5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black hover:bg-black/10 transition-all active:scale-95"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-brand-red' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh'}
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white border border-black/5 flex items-center px-4 py-3 rounded-2xl shadow-sm">
          <Search size={20} className="text-gray-500" />
          <input 
            placeholder="Search matches, interviews..." 
            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full ml-3 placeholder:text-gray-400 text-[#121212]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' 
                  : 'bg-white text-gray-600 border border-black/5 hover:bg-black/5 hover:text-black shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {videos.length === 0 && loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="animate-pulse space-y-4">
              <div className="aspect-video bg-white/5 rounded-2xl border border-white/10" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-white/10 rounded-lg w-5/6" />
                <div className="h-3 bg-white/5 rounded-md w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="group cursor-pointer"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden glass">
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-brand-red text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      {video.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <PlayCircle size={36} fill="currentColor" className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="text-lg font-bold leading-snug text-[#121212] group-hover:text-brand-red transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    Featured Replay
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest z-10"
            >
              Close Player
            </button>
            <div className="w-full max-w-6xl">
              <VideoPlayer 
                url={selectedVideo.url || `https://www.youtube.com/watch?v=${selectedVideo.ytId}`} 
                title={selectedVideo.title}
                thumbnail={selectedVideo.thumbnail}
                recommendations={filteredVideos.filter(v => v.id !== selectedVideo.id)}
                startAt={startAt}
              />
              <div className="mt-8 space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tight">{selectedVideo.title}</h2>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Featured Replay • RingZone Original</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && filteredVideos.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-6 rounded-full bg-white/5">
            <PlayCircle size={48} className="text-gray-700" />
          </div>
          <h3 className="text-xl font-bold uppercase text-white">No Videos Found</h3>
          <p className="text-gray-500 text-sm max-w-xs">Try exploring another category or check back later for new content.</p>
        </div>
      )}
    </div>
  );
}

