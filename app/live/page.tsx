'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Play, 
  X,
  Eye,
  Calendar,
  XCircle
} from 'lucide-react';
import Image from 'next/image';

interface LiveStream {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  sport: string;
  thumbnail: string;
  status: 'live' | 'upcoming' | 'completed';
  scheduledStartTime?: string;
  actualStartTime?: string;
  viewerCount?: number;
  description: string;
  publishedAt: string;
  sourceLabel: string;
  embedUrl: string;
}

const SPORT_COLORS: Record<string, string> = {
  all: '#E50914',
  wrestling: '#FF6B00',
  football: '#00A651',
  cricket: '#1E88E5',
  basketball: '#F57C00',
  ufc: '#D32F2F',
  f1: '#E91E63',
  tennis: '#8BC34A',
  esports: '#7B1FA2',
};

const SPORT_ICONS: Record<string, string> = {
  all: '🔥',
  wrestling: '🤼',
  football: '⚽',
  cricket: '🏏',
  basketball: '🏀',
  ufc: '🥊',
  f1: '🏎️',
  tennis: '🎾',
  esports: '🎮',
};

export default function WebLiveHub() {
  const [activeSport, setActiveSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [upcomingStreams, setUpcomingStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<LiveStream | null>(null);

  const fetchLiveHubData = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefetching(true);
    else if (liveStreams.length === 0) setIsLoading(true);

    try {
      const urlSuffix = forceRefresh ? `?sport=all&refresh=1` : `?sport=all`;
      const [liveRes, upcomingRes] = await Promise.all([
        fetch(`/api/live/streams${urlSuffix}`),
        fetch(`/api/live/upcoming${urlSuffix}`)
      ]);
      
      const liveData = await liveRes.json();
      const upcomingData = await upcomingRes.json();
      
      setLiveStreams(liveData.streams || []);
      setUpcomingStreams(upcomingData.streams || []);
    } catch (err) {
      console.error("Failed to fetch live hub data:", err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchLiveHubData();
    const interval = setInterval(() => fetchLiveHubData(), 3 * 60 * 1000); // 3 min polling
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchLiveHubData(true);
  };

  // Filter based on activeSport and searchQuery
  const filteredLive = liveStreams.filter(s => {
    if (activeSport !== 'all' && s.sport !== activeSport) return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredUpcoming = upcomingStreams.filter(s => {
    if (activeSport !== 'all' && s.sport !== activeSport) return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const allSports = ['all', 'wrestling', 'football', 'cricket', 'basketball', 'ufc', 'f1', 'tennis', 'esports'];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-sans">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tight">
            RAWSPORTS <span className="text-[#E50914]">LIVE</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[#555] text-xs font-bold tracking-widest uppercase">Official Streams Only</span>
            {liveStreams.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#E50914] px-2.5 py-1 rounded-md animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span className="text-[10px] font-black">{liveStreams.length} LIVE</span>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefetching}
          className="w-10 h-10 rounded-full bg-[#151515] border border-[#222] flex items-center justify-center hover:bg-[#222] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={`${isRefetching ? 'animate-spin text-[#E50914]' : 'text-white'}`} />
        </button>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Sport Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            {allSports.map(sport => {
              const isActive = activeSport === sport;
              const color = SPORT_COLORS[sport] || '#E50914';
              const count = sport === 'all' 
                ? liveStreams.length 
                : liveStreams.filter(s => s.sport === sport).length;

              return (
                <button
                  key={sport}
                  onClick={() => setActiveSport(sport)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border transition-all duration-300 ${
                    isActive 
                      ? 'bg-opacity-20 font-bold border-opacity-100' 
                      : 'bg-[#111] text-[#888] border-[#222] hover:bg-[#1a1a1a]'
                  }`}
                  style={{ 
                    backgroundColor: isActive ? `${color}20` : '',
                    borderColor: isActive ? color : '',
                    color: isActive ? 'white' : ''
                  }}
                >
                  <span className="text-sm">{SPORT_ICONS[sport]}</span>
                  <span className="text-xs uppercase tracking-wider">{sport}</span>
                  {count > 0 && (
                    <span 
                      className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                      style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${color}22`, color: isActive ? 'white' : color }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
            <input 
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#444] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E50914]"></div>
          </div>
        ) : (
          <>
            {/* LIVE NOW SECTION */}
            <div className="mb-14">
              <div className="flex items-center gap-2 mb-6">
                <Radio size={20} color="#E50914" className="animate-pulse" />
                <h2 className="text-lg font-black tracking-widest text-[#aaa]">LIVE NOW</h2>
                <div className="bg-[#E5091420] border border-[#E50914] px-2 py-0.5 rounded-full ml-2">
                  <span className="text-[#E50914] text-xs font-bold">{filteredLive.length}</span>
                </div>
              </div>

              {filteredLive.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-[#151515] rounded-2xl p-12 text-center">
                  <p className="text-4xl mb-4">📡</p>
                  <h3 className="text-xl font-bold mb-2">No Live Streams Right Now</h3>
                  <p className="text-[#666] text-sm max-w-md mx-auto">All official channels are currently offline for this sport. Check back soon or browse the upcoming schedule below.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredLive.map(stream => (
                    <LiveCard 
                      key={stream.videoId} 
                      stream={stream} 
                      onClick={() => setSelectedVideo(stream)} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* UPCOMING SECTION */}
            {filteredUpcoming.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={20} color="#C77DFF" />
                  <h2 className="text-lg font-black tracking-widest text-[#aaa]">UPCOMING STREAMS</h2>
                  <div className="bg-[#C77DFF20] border border-[#C77DFF] px-2 py-0.5 rounded-full ml-2">
                    <span className="text-[#C77DFF] text-xs font-bold">{filteredUpcoming.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUpcoming.map(stream => (
                    <LiveCard 
                      key={stream.videoId} 
                      stream={stream} 
                      onClick={() => setSelectedVideo(stream)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Banner */}
            <div className="bg-[#00C85308] border border-[#00C85320] rounded-xl p-4 flex items-start gap-3 mt-12">
              <ShieldCheck size={20} color="#00C853" className="shrink-0 mt-0.5" />
              <p className="text-[#00C853] text-sm font-medium italic opacity-90">
                Play Store & ToS Compliant: All streams are embedded directly from official verified YouTube channels using YouTube's official player. RawSports Live does not host, download, or restream any copyrighted content.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 md:top-8 md:right-8 bg-[#1a1a1a] hover:bg-[#333] border border-[#333] p-2.5 rounded-full transition-colors z-50 group"
          >
            <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          <div className="w-full max-w-5xl bg-[#0a0a0a] rounded-2xl overflow-hidden border border-[#222] shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Player Area (16:9) */}
            <div className="relative w-full aspect-video bg-black shrink-0">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
            
            {/* Info Area */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 mb-4">
                {selectedVideo.status === 'live' ? (
                  <div className="flex items-center gap-1.5 bg-[#E50914] px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(229,9,20,0.5)]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest">LIVE</span>
                  </div>
                ) : (
                  <div className="bg-[#1a1a2e] border border-[#7B2FBE] px-2.5 py-1 rounded-md">
                    <span className="text-[10px] font-black tracking-widest text-[#C77DFF]">UPCOMING</span>
                  </div>
                )}
                <div 
                  className="border px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase"
                  style={{ 
                    borderColor: SPORT_COLORS[selectedVideo.sport] || '#fff',
                    color: SPORT_COLORS[selectedVideo.sport] || '#fff'
                  }}
                >
                  {selectedVideo.sport}
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                {selectedVideo.title}
              </h2>
              
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: SPORT_COLORS[selectedVideo.sport] || '#E50914' }} 
                />
                <span className="font-black text-sm tracking-wide" style={{ color: SPORT_COLORS[selectedVideo.sport] || '#E50914' }}>
                  {selectedVideo.channelName}
                </span>
              </div>
              
              <div className="bg-[#00C85308] border border-[#00C85320] rounded-lg p-3 flex items-center gap-2 mb-6">
                <ShieldCheck size={16} color="#00C853" />
                <span className="text-[#00C853] text-xs font-medium italic">
                  {selectedVideo.sourceLabel}
                </span>
              </div>
              
              {selectedVideo.description && (
                <p className="text-[#888] text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LiveCard({ stream, onClick }: { stream: LiveStream, onClick: () => void }) {
  const isLive = stream.status === 'live';
  const isUpcoming = stream.status === 'upcoming';
  const color = SPORT_COLORS[stream.sport] || '#E50914';

  return (
    <div 
      onClick={onClick}
      className="group bg-[#0f0f0f] rounded-2xl overflow-hidden border border-[#1a1a1a] hover:border-[#333] transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#111] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={stream.thumbnail} 
          alt={stream.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        
        {/* Sport Bar top */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
        
        {/* Badge */}
        <div className="absolute top-3 left-3">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-[#E50914] px-2 py-0.5 rounded shadow-lg">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[9px] text-white font-black tracking-wider">LIVE</span>
            </div>
          ) : (
            <div className="bg-[#1a1a2e] border border-[#7B2FBE] px-2 py-0.5 rounded shadow-lg">
              <span className="text-[9px] font-black tracking-wider text-[#C77DFF]">UPCOMING</span>
            </div>
          )}
        </div>

        {/* Play Icon (center on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-[#E50914]/90 flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.6)] backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
            <Play size={20} className="text-white ml-1 fill-white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-1 rounded-full shrink-0 h-10 mt-1" style={{ backgroundColor: color }} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-gray-200 transition-colors leading-snug">
            {stream.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black tracking-wide truncate" style={{ color }}>
              {stream.channelName}
            </span>
            <span className="text-[#333] text-[10px]">•</span>
            <span className="text-[#555] text-[9px] font-bold tracking-widest uppercase">
              {stream.sport}
            </span>
          </div>
          
          {isUpcoming && stream.scheduledStartTime && (
            <WebCountdown targetIso={stream.scheduledStartTime} />
          )}
        </div>
      </div>
    </div>
  );
}

function WebCountdown({ targetIso }: { targetIso: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const target = new Date(targetIso).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('STARTING NOW');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => String(n).padStart(2, '0');

      if (days > 0) {
        setTimeLeft(`${days}d ${pad(hours)}h ${pad(minutes)}m`);
      } else {
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  if (!timeLeft) return null;
  const isImminent = timeLeft === 'STARTING NOW';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${isImminent ? 'bg-[#E5091415] border-[#E50914]' : 'bg-[#1a1a2e] border-[#2d2d50]'}`}>
      <span className="text-[8px] font-black tracking-wider text-[#666]">STARTS IN</span>
      <span className={`text-[10px] font-black tracking-widest tabular-nums ${isImminent ? 'text-[#E50914] animate-pulse' : 'text-[#C77DFF]'}`}>
        {timeLeft}
      </span>
    </div>
  );
}
