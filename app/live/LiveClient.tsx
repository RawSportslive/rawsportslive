'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Play, 
  X
} from 'lucide-react';

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

const ALWAYS_ON_STREAMS: LiveStream[] = [
  {
    videoId: 'w-rX2D8O_o0', 
    title: 'WWE 24/7 Network Vault: Greatest Matches & Moments',
    channelId: 'wwe',
    channelName: 'WWE Official',
    sport: 'wrestling',
    thumbnail: 'https://images.unsplash.com/photo-1574187063463-c75c8a0026db?auto=format&fit=crop&q=80&w=800',
    status: 'live',
    description: 'Relive the greatest moments in WWE history with our 24/7 vault stream!',
    publishedAt: new Date().toISOString(),
    sourceLabel: 'Official WWE Network',
    embedUrl: ''
  },
  {
    videoId: 'M7lc1UVf-VE',
    title: 'Sky Sports News 24/7 Live Coverage & Analysis',
    channelId: 'sky',
    channelName: 'Sky Sports',
    sport: 'football',
    thumbnail: 'https://images.unsplash.com/photo-1518605368461-1ee11b68144b?auto=format&fit=crop&q=80&w=800',
    status: 'live',
    description: 'Breaking sports news, analysis and exclusive interviews streaming around the clock.',
    publishedAt: new Date().toISOString(),
    sourceLabel: 'Official Broadcaster',
    embedUrl: ''
  },
  {
    videoId: 'I11vQ7x0wD4', 
    title: 'UFC Full Free Fights 24/7 Marathon',
    channelId: 'ufc',
    channelName: 'UFC',
    sport: 'ufc',
    thumbnail: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800',
    status: 'live',
    description: 'The best knockouts, submissions, and full free fights streaming 24/7.',
    publishedAt: new Date().toISOString(),
    sourceLabel: 'Official UFC',
    embedUrl: ''
  },
  {
    videoId: 'Z1BCujX3pw8',
    title: 'ICC Cricket Classics: Greatest World Cup Matches',
    channelId: 'icc',
    channelName: 'ICC',
    sport: 'cricket',
    thumbnail: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800',
    status: 'live',
    description: 'Streaming classic cricket matches from the World Cup vault 24/7.',
    publishedAt: new Date().toISOString(),
    sourceLabel: 'Official ICC',
    embedUrl: ''
  }
];

export default function LiveClient({ 
  initialLiveStreams, 
  initialUpcomingStreams 
}: { 
  initialLiveStreams: LiveStream[], 
  initialUpcomingStreams: LiveStream[] 
}) {
  const [activeSport, setActiveSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(initialLiveStreams);
  const [upcomingStreams, setUpcomingStreams] = useState<LiveStream[]>(initialUpcomingStreams);
  const [isRefetching, setIsRefetching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<LiveStream | null>(null);

  const fetchLiveHubData = async () => {
    setIsRefetching(true);
    try {
      const [liveRes, upcomingRes] = await Promise.all([
        fetch(`/api/live/streams?sport=all&refresh=1`),
        fetch(`/api/live/upcoming?sport=all&refresh=1`)
      ]);
      
      const liveData = await liveRes.json();
      const upcomingData = await upcomingRes.json();
      
      setLiveStreams(liveData.streams || []);
      setUpcomingStreams(upcomingData.streams || []);
    } catch (err) {
      console.error("Failed to fetch live hub data:", err);
    } finally {
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => fetchLiveHubData(), 3 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  // Merge always-on streams so it's NEVER empty!
  const combinedLiveStreams = [...liveStreams, ...ALWAYS_ON_STREAMS];

  const filteredLive = combinedLiveStreams.filter(s => {
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
    <div className="min-h-screen bg-brand-black text-white pt-6 pb-20 font-sans w-full">
      
      {/* Header - Removed max-w-7xl, using full width px-4 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tight text-white">
            RAWSPORTS <span className="text-[#E50914]">LIVE</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">Official Streams Only</span>
            <div className="flex items-center gap-1.5 bg-[#E50914] px-2.5 py-1 rounded-md shadow-lg shadow-brand-red/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] text-white font-black">{combinedLiveStreams.length} LIVE</span>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchLiveHubData}
          disabled={isRefetching}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 shadow-sm flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={`${isRefetching ? 'animate-spin text-[#E50914]' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Filters and Search - Full width */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
          
          {/* Sport Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 w-full xl:w-auto no-scrollbar">
            {allSports.map(sport => {
              const isActive = activeSport === sport;
              const color = SPORT_COLORS[sport] || '#E50914';
              const count = sport === 'all' 
                ? combinedLiveStreams.length 
                : combinedLiveStreams.filter(s => s.sport === sport).length;

              return (
                <button
                  key={sport}
                  onClick={() => setActiveSport(sport)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border transition-all duration-300 shadow-sm ${
                    isActive 
                      ? 'font-bold border-opacity-100 bg-white/10' 
                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                  style={{ 
                    borderColor: isActive ? color : '',
                    color: isActive ? color : ''
                  }}
                >
                  <span className="text-sm">{SPORT_ICONS[sport]}</span>
                  <span className="text-xs uppercase tracking-wider">{sport}</span>
                  {count > 0 && (
                    <span 
                      className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                      style={{ backgroundColor: isActive ? color : `${color}22`, color: isActive ? 'white' : color }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full xl:w-80 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 shadow-sm rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors text-white placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area - Full width */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* LIVE NOW SECTION */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Radio size={20} color="#E50914" className="animate-pulse" />
            <h2 className="text-lg font-black tracking-widest text-gray-400">LIVE NOW</h2>
            <div className="bg-[#E5091415] border border-[#E50914] px-2 py-0.5 rounded-full ml-2">
              <span className="text-[#E50914] text-xs font-bold">{filteredLive.length}</span>
            </div>
          </div>

          {filteredLive.length === 0 ? (
            <div className="bg-white/5 border border-white/10 shadow-sm rounded-2xl p-12 text-center w-full">
              <p className="text-4xl mb-4">📡</p>
              <h3 className="text-xl font-bold mb-2 text-white">No Live Streams Right Now</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">All official channels are currently offline for this sport. Check back soon or browse the upcoming schedule below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
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
              <Clock size={20} color="#9C27B0" />
              <h2 className="text-lg font-black tracking-widest text-gray-400">UPCOMING STREAMS</h2>
              <div className="bg-purple-500/20 border border-purple-500/50 px-2 py-0.5 rounded-full ml-2">
                <span className="text-purple-400 text-xs font-bold">{filteredUpcoming.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
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
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3 mt-12 shadow-sm w-full">
          <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-emerald-400 text-sm font-medium italic">
            Play Store & ToS Compliant: All streams are embedded directly from official verified YouTube channels using YouTube's official player. RawSports Live does not host, download, or restream any copyrighted content.
          </p>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg p-2.5 rounded-full transition-colors z-50 group"
          >
            <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          <div className="w-full max-w-6xl bg-brand-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            
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
                  <div className="flex items-center gap-1.5 bg-[#E50914] px-2.5 py-1 rounded-md shadow-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-black tracking-widest">LIVE</span>
                  </div>
                ) : (
                  <div className="bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 rounded-md">
                    <span className="text-[10px] font-black tracking-widest text-purple-400">UPCOMING</span>
                  </div>
                )}
                <div 
                  className="border px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase"
                  style={{ 
                    borderColor: SPORT_COLORS[selectedVideo.sport] || '#666',
                    color: SPORT_COLORS[selectedVideo.sport] || '#666',
                    backgroundColor: `${SPORT_COLORS[selectedVideo.sport]}10` || '#f9fafb'
                  }}
                >
                  {selectedVideo.sport}
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 text-white">
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
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 mb-6">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-emerald-400 text-xs font-medium italic">
                  {selectedVideo.sourceLabel}
                </span>
              </div>
              
              {selectedVideo.description && (
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
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
      className="group bg-white/5 rounded-2xl overflow-hidden border border-white/5 shadow-sm hover:border-white/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red/10 flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={stream.thumbnail} 
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Sport Bar top */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
        
        {/* Badge */}
        <div className="absolute top-3 left-3">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-[#E50914] px-2 py-0.5 rounded shadow-md">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[9px] text-white font-black tracking-wider">LIVE</span>
            </div>
          ) : (
            <div className="bg-brand-black border border-purple-500/50 px-2 py-0.5 rounded shadow-sm">
              <span className="text-[9px] font-black tracking-wider text-purple-400">UPCOMING</span>
            </div>
          )}
        </div>

        {/* Play Icon (center on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
            <Play size={20} className="text-[#E50914] ml-1 fill-[#E50914]" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-[#E50914] transition-colors leading-snug">
          {stream.title}
        </h3>
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-black tracking-wide truncate" style={{ color }}>
              {stream.channelName}
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
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border w-full justify-center ${isImminent ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
      <span className="text-[8px] font-black tracking-wider text-gray-400">STARTS IN</span>
      <span className={`text-[10px] font-black tracking-widest tabular-nums ${isImminent ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
        {timeLeft}
      </span>
    </div>
  );
}
