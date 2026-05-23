'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import SectionHeader from '@/components/SectionHeader';
import VideoPlayer from '@/components/VideoPlayer';
import VideoEngagement from '@/components/VideoEngagement';
import { PlayCircle, Trophy, Search, Bell, Menu, Loader2, X, Shield, Home as HomeIcon, Newspaper, Calendar, Clock, Tv, Check } from 'lucide-react';
import Image from 'next/image';

const DEFAULT_LEGAL_TEXTS = {
  privacy: `RAWSPORTS LIVE - PRIVACY POLICY
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
We leverage public, secure CDNs (Cloudinary, YouTube, Unsplash) to stream fast sports highlights. We do not transmit user personal identifiers to these networks.`,

  terms: `RAWSPORTS LIVE - TERMS OF SERVICE
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
RawSports Live provides video feeds "as is". We are not liable for any streaming interruptions, video feed deprecations from third-party networks, or notification delays.`,

  cookies: `RAWSPORTS LIVE - COOKIES POLICY
Last Updated: May 2026

1. WHAT ARE COOKIES
Cookies are small text files stored on your device to help us deliver a fast, responsive, and personalized viewing experience.

2. COOKIES WE USE
- Essential Authentication: Used to keep your Admin or user profile logged in securely.
- Performance Metrics: Used to cache page renders and load local database queries faster.
- User Preferences: Keeps your theme settings, notification status, and sound preferences active.

3. MANAGING COOKIES
You can completely manage, block, or delete cookies via your web browser or PWA system settings. Note that disabling essential cookies may impact certain streaming features.`,

  deletion: `RAWSPORTS LIVE - DATA DELETION INSTRUCTIONS
Last Updated: May 2026

If you wish to delete your RawSports Live account, push notification data, or interaction history, you have complete control over your personal records:

1. HOW TO SUBMIT A DELETION REQUEST:
- Method 1 (Direct Profile Tab): Go to your Profile page inside the app, tap the "Delete Account & History" option, and confirm. All records will be wiped instantly from our servers.
- Method 2 (Support Mail): Send an email to support@rawsportslive.com with your system email address. Our team will manually scrub all data in 24 hours.

2. WHAT DATA IS ERASED:
- Registered email and account credentials.
- Saved push notification tokens.
- Likes, bookmarks, and video interaction history.
- Dynamic layout cache.`
};

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Schedule Modal & Alert Toast states
  const [activeSchedulePost, setActiveSchedulePost] = useState<any | null>(null);
  const [scheduledAlerts, setScheduledAlerts] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleAlert = (showName: string) => {
    if (scheduledAlerts.includes(showName)) {
      setScheduledAlerts(prev => prev.filter(item => item !== showName));
      setToastMessage(`🔔 Alert removed for ${showName}`);
    } else {
      setScheduledAlerts(prev => [...prev, showName]);
      setToastMessage(`🔔 Ring Alert enabled! We will notify you 15 minutes before ${showName} launches!`);
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ news: any[]; videos: any[] }>({ news: [], videos: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Menu Sidebar Drawer and Legal Content Modal states
  const [showMenu, setShowMenu] = useState(false);
  const [selectedLegalKey, setSelectedLegalKey] = useState<'privacy' | 'terms' | 'cookies' | 'deletion' | null>(null);
  const [legalDocContent, setLegalDocContent] = useState('');
  const [loadingLegalDoc, setLoadingLegalDoc] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when search, video modal, legal modal, or schedule modal is open
  useEffect(() => {
    if (activeVideo || showSearch || selectedLegalKey || showMenu || activeSchedulePost) {
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
  }, [activeVideo, showSearch, selectedLegalKey, showMenu, activeSchedulePost]);

  // Highlights horizontal auto-scrolling
  useEffect(() => {
    if (videos.length <= 3) return;
    const container = scrollRef.current;
    if (!container) return;

    let intervalId: any;
    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (!container) return;
        const cardWidth = container.clientWidth / 3;
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }, 4000); // Smooth scroll every 4 seconds
    };

    startAutoScroll();
    return () => clearInterval(intervalId);
  }, [videos]);

  // Fetch News and Videos from Firestore + Auto Sync RSS News + Initialize Legal Docs
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

    // 2. Listen for videos in real-time (limit updated to 8 for auto-scroll highlights)
    const qVideos = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(8));
    const unsubscribeVideos = onSnapshot(qVideos, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Videos fetch error:", error);
      setLoading(false);
    });

    // 3. (Removed frontend auto-sync to allow backend scraper to fetch full content)

    // 4. Initialize dynamic legal policies if they do not exist
    const initializeLegal = async () => {
      try {
        const { doc, getDoc, setDoc } = await import('firebase/firestore');
        const docs = ['privacy', 'terms', 'cookies', 'deletion'];
        const titles = {
          privacy: 'Privacy Policy',
          terms: 'Terms of Service',
          cookies: 'Cookies Policy',
          deletion: 'Data Deletion Instructions',
        };
        for (const id of docs) {
          const snap = await getDoc(doc(db, 'legal', id));
          if (!snap.exists()) {
            await setDoc(doc(db, 'legal', id), {
              title: titles[id as keyof typeof titles],
              content: DEFAULT_LEGAL_TEXTS[id as keyof typeof DEFAULT_LEGAL_TEXTS],
              createdAt: new Date()
            });
          }
        }
      } catch (err) {
        console.error("Legal auto initialize failed:", err);
      }
    };

    initializeLegal();

    return () => {
      unsubscribeNews();
      unsubscribeVideos();
    };
  }, []);

  // Fetch dynamic legal doc when key changes
  useEffect(() => {
    if (!selectedLegalKey) return;
    const fetchDoc = async () => {
      setLoadingLegalDoc(true);
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, 'legal', selectedLegalKey));
        if (snap.exists()) {
          setLegalDocContent(snap.data().content || '');
        } else {
          setLegalDocContent(DEFAULT_LEGAL_TEXTS[selectedLegalKey]);
        }
      } catch (err) {
        console.error("Error fetching legal document:", err);
        setLegalDocContent(DEFAULT_LEGAL_TEXTS[selectedLegalKey]);
      } finally {
        setLoadingLegalDoc(false);
      }
    };
    fetchDoc();
  }, [selectedLegalKey]);

  // Firestore Query-based Hybrid Real Search logic
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
            <Menu className="cursor-pointer" color="#000" onClick={() => setShowMenu(!showMenu)} />
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
        <Hero 
          onWatchNow={(video) => setActiveVideo(video)}
          onSchedule={(post) => setActiveSchedulePost(post)}
        />

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
                  <h2 className="text-3xl font-bold uppercase tracking-tight text-white">{activeVideo.title}</h2>
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

        {/* Highlights Section (3 columns desktop, snap horizontal auto-scrolling) */}
        <section className="px-6 space-y-6">
          <SectionHeader title="Video Highlights" icon={Trophy} />
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-6 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {videos.map((video) => (
              <div 
                key={video.id} 
                onClick={() => setActiveVideo(video)} 
                className="w-[85%] md:w-[calc(33.333%-16px)] flex-shrink-0 snap-start relative group cursor-pointer rounded-2xl overflow-hidden glass transition-all duration-300"
              >
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
                    <div className="w-10 h-10 rounded-full bg-brand-red/90 text-white flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                      <PlayCircle size={22} />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border-t border-white/5 rounded-b-2xl">
                  <h3 className="font-bold text-sm text-[#121212] group-hover:text-brand-red transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
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
              <h2 className="text-3xl font-bold leading-none text-white">Unlock Exclusive <br />Insider Access</h2>
              <p className="text-sm text-white/90 max-w-sm font-medium">Join the RawSports Live community to get early access to match cards, exclusive wallpapers, and member-only rewards.</p>
              <div className="flex gap-4 pt-2">
                <button className="bg-white text-brand-red px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-all shadow-lg">
                  Join Insider
                </button>
              </div>
            </div>
            <Trophy size={180} className="absolute -right-8 -bottom-8 opacity-10 -rotate-12 text-white" />
          </div>
        </section>
      </div>

      {/* Dynamic Slide-out Sidebar Drawer for Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[140]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-brand-black border-r border-white/10 z-[150] p-6 flex flex-col justify-between"
              style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
            >
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="font-display font-black text-lg tracking-tighter uppercase italic select-none text-white">
                    RAW<span className="text-[#FFBF00]">SPORTS</span><span className="text-[9px] align-top ml-0.5 text-[#ff0000] font-black not-italic">LIVE</span>
                  </div>
                  <button onClick={() => setShowMenu(false)} className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Explore</p>
                  <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FFBF00] text-black font-bold uppercase text-xs tracking-wider shadow-lg">
                    <HomeIcon size={16} /> Home
                  </a>
                  <a href="/sports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold uppercase text-xs tracking-wider">
                    <Trophy size={16} /> Sports Hub
                  </a>
                  <a href="/videos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold uppercase text-xs tracking-wider">
                    <PlayCircle size={16} /> Videos & Replays
                  </a>
                  <a href="/news" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold uppercase text-xs tracking-wider">
                    <Newspaper size={16} /> Latest News
                  </a>
                </nav>

                {/* Policies Section */}
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Legal & Compliance</p>
                  <a href="/privacy" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold uppercase text-xs tracking-wider text-left">
                    <Shield size={16} className="text-[#FFBF00]" /> Privacy Policy
                  </a>
                  <a href="/terms" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold uppercase text-xs tracking-wider text-left">
                    <Shield size={16} className="text-[#FFBF00]" /> Terms of Service
                  </a>
                  <a href="/cookies" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold uppercase text-xs tracking-wider text-left">
                    <Shield size={16} className="text-[#FFBF00]" /> Cookies Policy
                  </a>
                  <a href="/deletion" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ff4444] hover:text-[#ff2222] hover:bg-red-950/20 transition-all font-bold uppercase text-xs tracking-wider text-left">
                    <Shield size={16} className="text-[#ff4444]" /> Data Deletions
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-center">
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">RawSports Live v2.4.0</p>
                <p className="text-[7px] text-gray-700 font-bold uppercase tracking-wider mt-0.5">© 2026 All Rights Reserved</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Legal Sub-Modal */}
      <AnimatePresence>
        {selectedLegalKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto no-scrollbar"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-3xl bg-[#121212] rounded-3xl overflow-hidden border border-white/10 shadow-2xl my-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-[#FFBF00]" />
                  <h3 className="font-bold text-base uppercase tracking-tight" style={{ color: '#ffffff' }}>
                    {selectedLegalKey === 'privacy' && 'Privacy Policy'}
                    {selectedLegalKey === 'terms' && 'Terms of Service'}
                    {selectedLegalKey === 'cookies' && 'Cookies Policy'}
                    {selectedLegalKey === 'deletion' && 'Data Deletion Instructions'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLegalKey(null)}
                  className="p-2.5 rounded-xl bg-white/5 text-white hover:bg-brand-red transition-all"
                  style={{ color: '#ffffff' }}
                >
                  <X size={18} style={{ color: '#ffffff' }} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {loadingLegalDoc ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="animate-spin text-[#FFBF00]" size={36} />
                    <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse" style={{ color: '#888888' }}>Loading compliance data...</p>
                  </div>
                ) : (
                  <div className="text-xs md:text-sm leading-relaxed space-y-4 font-medium whitespace-pre-wrap" style={{ color: '#e5e7eb' }}>
                    {legalDocContent}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setSelectedLegalKey(null)}
                  className="px-6 py-3 rounded-xl bg-[#FFBF00] hover:bg-amber-500 text-black font-bold uppercase text-[10px] tracking-wider transition-all"
                >
                  Understood & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast Alert Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] bg-black/90 backdrop-blur-md border border-[#FFBF00]/30 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm text-center"
          >
            <span className="text-white text-xs font-black uppercase tracking-wider leading-relaxed" style={{ color: '#ffffff' }}>
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WWE Broadcast & PLE Schedule Modal */}
      <AnimatePresence>
        {activeSchedulePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto no-scrollbar"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl bg-[#121212] rounded-3xl overflow-hidden border border-white/10 shadow-2xl my-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-[#FFBF00]" />
                  <h3 className="font-bold text-base uppercase tracking-tight" style={{ color: '#ffffff' }}>
                    WWE Arena Broadcast Schedule
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSchedulePost(null)}
                  className="p-2.5 rounded-xl bg-white/5 text-white hover:bg-brand-red transition-all"
                  style={{ color: '#ffffff' }}
                >
                  <X size={18} style={{ color: '#ffffff' }} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-8">
                
                {/* Spotlight Tag */}
                <div className="bg-[#FFBF00]/10 border border-[#FFBF00]/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase text-[#FFBF00] tracking-widest bg-[#FFBF00]/10 px-2.5 py-1 rounded-md">Spotlight Event</span>
                    <h4 className="text-sm md:text-base font-black text-white uppercase mt-1" style={{ color: '#ffffff' }}>
                      {activeSchedulePost.title}
                    </h4>
                    <p className="text-gray-400 text-xs mt-0.5" style={{ color: '#888888' }}>
                      Featured slide segment alert is active. Click remind to get alerted!
                    </p>
                  </div>
                  <button
                    onClick={() => toggleAlert(activeSchedulePost.title)}
                    className={`px-4 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                      scheduledAlerts.includes(activeSchedulePost.title)
                        ? 'bg-[#4ade80] text-black hover:bg-[#22c55e]'
                        : 'bg-[#FFBF00] text-black hover:bg-amber-500'
                    }`}
                  >
                    {scheduledAlerts.includes(activeSchedulePost.title) ? (
                      <>
                        <Check size={12} />
                        <span>Scheduled</span>
                      </>
                    ) : (
                      <>
                        <Bell size={12} />
                        <span>Remind Me</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Weekly Broadcasts */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Tv size={16} className="text-[#FFBF00]" />
                    <h5 className="text-xs font-black uppercase tracking-widest text-[#FFBF00]">Weekly Live Broadcasts</h5>
                  </div>
                  <div className="space-y-3">
                    {[
                      { day: 'Mondays', show: 'WWE Monday Night RAW', time: '8:00 PM ET', network: 'USA Network' },
                      { day: 'Tuesdays', show: 'WWE NXT', time: '8:00 PM ET', network: 'CW Network' },
                      { day: 'Fridays', show: 'WWE Friday Night SmackDown', time: '8:00 PM ET', network: 'USA Network' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#FFBF00] bg-[#FFBF00]/10 px-2 py-0.5 rounded">
                              {item.day}
                            </span>
                            <span className="text-xs font-bold text-white uppercase" style={{ color: '#ffffff' }}>
                              {item.network}
                            </span>
                          </div>
                          <h6 className="text-sm font-black text-white uppercase tracking-tight" style={{ color: '#ffffff' }}>
                            {item.show}
                          </h6>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs" style={{ color: '#888888' }}>
                            <Clock size={12} />
                            <span>{item.time}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAlert(item.show)}
                          className={`sm:self-center px-4 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            scheduledAlerts.includes(item.show)
                              ? 'bg-[#4ade80] text-black hover:bg-[#22c55e]'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                          style={{ color: scheduledAlerts.includes(item.show) ? '#000000' : '#ffffff' }}
                        >
                          {scheduledAlerts.includes(item.show) ? (
                            <>
                              <Check size={12} style={{ color: '#000000' }} />
                              <span>Scheduled</span>
                            </>
                          ) : (
                            <>
                              <Bell size={12} style={{ color: '#ffffff' }} />
                              <span>Remind Me</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Live Events */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Trophy size={16} className="text-[#FFBF00]" />
                    <h5 className="text-xs font-black uppercase tracking-widest text-[#FFBF00]">Upcoming Premium Live Events</h5>
                  </div>
                  <div className="space-y-3">
                    {[
                      { date: 'Saturday, Aug 1', event: 'WWE SummerSlam 2026', location: 'Cleveland, OH' },
                      { date: 'Saturday, Nov 28', event: 'WWE Survivor Series 2026', location: 'Boston, MA' },
                      { date: 'Saturday, Jan 24', event: 'WWE Royal Rumble 2027', location: 'San Antonio, TX' },
                      { date: 'Sat & Sun, Apr 3-4', event: 'WWE WrestleMania 43', location: 'Las Vegas, NV' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                              {item.date}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight" style={{ color: '#888888' }}>
                              {item.location}
                            </span>
                          </div>
                          <h6 className="text-sm font-black text-white uppercase tracking-tight" style={{ color: '#ffffff' }}>
                            {item.event}
                          </h6>
                        </div>
                        <button
                          onClick={() => toggleAlert(item.event)}
                          className={`sm:self-center px-4 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            scheduledAlerts.includes(item.event)
                              ? 'bg-[#4ade80] text-black hover:bg-[#22c55e]'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                          style={{ color: scheduledAlerts.includes(item.event) ? '#000000' : '#ffffff' }}
                        >
                          {scheduledAlerts.includes(item.event) ? (
                            <>
                              <Check size={12} style={{ color: '#000000' }} />
                              <span>Scheduled</span>
                            </>
                          ) : (
                            <>
                              <Bell size={12} style={{ color: '#ffffff' }} />
                              <span>Remind Me</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setActiveSchedulePost(null)}
                  className="px-6 py-3 rounded-xl bg-[#FFBF00] hover:bg-amber-500 text-black font-bold uppercase text-[10px] tracking-wider transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
