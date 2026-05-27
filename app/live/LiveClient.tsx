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

// Curated high-end sports brand palette using theme gold (#FFBF00) as primary accent
const SPORT_COLORS: Record<string, string> = {
  all: '#FFBF00',
  wrestling: '#FFBF00',
  football: '#10B981',
  cricket: '#3B82F6',
  basketball: '#F59E0B',
  ufc: '#EF4444',
  f1: '#EC4899',
  tennis: '#84CC16',
  esports: '#8B5CF6',
};

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
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchLiveHubData = async () => {
    setIsRefetching(true);
    setApiError(null);
    try {
      const [liveRes, upcomingRes] = await Promise.all([
        fetch(`/api/live/streams?sport=all`),
        fetch(`/api/live/upcoming?sport=all`)
      ]);
      
      const liveData = await liveRes.json();
      const upcomingData = await upcomingRes.json();
      
      if (liveRes.status === 429 || upcomingRes.status === 429) {
        setApiError('YouTube API Quota Exceeded. Please update your API key in .env.local');
      }

      setLiveStreams(liveData.streams || []);
      setUpcomingStreams(upcomingData.streams || []);
    } catch (err) {
      console.error("Failed to fetch live hub data:", err);
    } finally {
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchLiveHubData();
    const interval = setInterval(() => fetchLiveHubData(), 15 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  const combinedLiveStreams = liveStreams;

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
    <div className="min-h-screen bg-brand-black pt-6 pb-20 font-sans w-full text-neutral-900" style={{ backgroundColor: '#faf9f6' }}>
      
      {/* Premium Minimalist Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 uppercase">
            RAWSPORTS <span className="text-[#FFBF00] font-black">LIVE</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFBF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFBF00]"></span>
            </span>
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">
              {combinedLiveStreams.length} Channel{combinedLiveStreams.length !== 1 ? 's' : ''} Online
            </span>
          </div>
        </div>

        <button 
          onClick={fetchLiveHubData}
          disabled={isRefetching}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 transition-all text-xs font-semibold text-neutral-600 disabled:opacity-50"
        >
          <RefreshCw size={12} className={`${isRefetching ? 'animate-spin text-[#FFBF00]' : 'text-neutral-500'}`} />
          <span>Sync Streams</span>
        </button>
      </div>

      {apiError && (
        <div className="w-full px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between text-sm font-semibold shadow-sm">
            <span>⚠️ {apiError}</span>
            <button onClick={() => setApiError(null)} className="opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modern Filter Toolbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-neutral-200/60 pb-6">
          
          {/* Curated Sport Tabs - Clean Sans Serif Typography, No Cheap Emojis */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
            {allSports.map(sport => {
              const isActive = activeSport === sport;
              const count = sport === 'all' 
                ? combinedLiveStreams.length 
                : combinedLiveStreams.filter(s => s.sport === sport).length;

              return (
                <button
                  key={sport}
                  onClick={() => setActiveSport(sport)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                    isActive 
                      ? 'bg-neutral-900 border-neutral-900 shadow-sm' 
                      : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                  style={isActive ? { color: '#ffffff' } : {}}
                >
                  <span>{sport}</span>
                  {count > 0 && (
                    <span 
                      className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-[#FFBF00] text-black font-extrabold' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Minimalist Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search streams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200 shadow-sm rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all text-neutral-800 placeholder-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* LIVE NOW SECTION */}
        <div className="mb-14">
          <div className="flex items-center gap-2.5 mb-6">
            <Radio size={16} className="text-[#FFBF00] animate-pulse" />
            <h2 className="text-sm font-extrabold tracking-widest text-neutral-400 uppercase">LIVE NOW</h2>
            <span className="bg-[#FFBF00]/10 border border-[#FFBF00]/30 px-2 py-0.5 rounded-full ml-1 text-[#FFBF00] text-xs font-bold">
              {filteredLive.length}
            </span>
          </div>

          {filteredLive.length === 0 ? (
            <div className="bg-white border border-neutral-200/60 shadow-sm rounded-2xl p-12 text-center w-full">
              <p className="text-3xl mb-3">📡</p>
              <h3 className="text-base font-bold mb-1.5 text-neutral-800">No Streams Live Right Now</h3>
              <p className="text-neutral-500 text-xs max-w-sm mx-auto leading-relaxed">
                All network channels are currently off-air. Explore upcoming events scheduled below or check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
            <div className="flex items-center gap-2.5 mb-6">
              <Clock size={16} className="text-neutral-400" />
              <h2 className="text-sm font-extrabold tracking-widest text-neutral-400 uppercase">UPCOMING STREAMS</h2>
              <span className="bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full ml-1 text-neutral-600 text-xs font-bold">
                {filteredUpcoming.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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

        {/* Premium Compliance Footnote */}
        <div className="bg-neutral-50 border border-neutral-200/50 rounded-xl p-4 flex items-start gap-3 mt-16 max-w-4xl mx-auto shadow-sm">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-neutral-500 text-xs font-semibold leading-relaxed">
            Legal & Terms Compliant: All broadcasts are strictly embedded directly from official verified YouTube platforms using YouTube's official HTML5 iframe component. We do not distribute, download, or restream raw content.
          </p>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 md:p-8">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 md:top-8 md:right-8 bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 shadow-lg p-2.5 rounded-full transition-all z-50 group"
          >
            <X size={20} className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-2xl flex flex-col max-h-[90vh]">
            
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
                  <div className="flex items-center gap-1.5 bg-[#FFBF00] px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest text-black">
                    <span className="w-1 h-1 bg-black rounded-full animate-ping" />
                    <span>LIVE</span>
                  </div>
                ) : (
                  <div className="bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest text-neutral-500">
                    <span>UPCOMING</span>
                  </div>
                )}
                <div 
                  className="border px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase"
                  style={{ 
                    borderColor: SPORT_COLORS[selectedVideo.sport] || '#666',
                    color: SPORT_COLORS[selectedVideo.sport] || '#666',
                    backgroundColor: `${SPORT_COLORS[selectedVideo.sport]}10` || '#f9fafb'
                  }}
                >
                  {selectedVideo.sport}
                </div>
              </div>
              
              <h2 className="text-xl md:text-2xl font-extrabold leading-tight mb-4 text-neutral-900">
                {selectedVideo.title}
              </h2>
              
              <div className="flex items-center gap-2 mb-6">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: SPORT_COLORS[selectedVideo.sport] || '#FFBF00' }} 
                />
                <span className="font-extrabold text-xs tracking-wider uppercase text-neutral-700">
                  {selectedVideo.channelName}
                </span>
              </div>
              
              {selectedVideo.description && (
                <p className="text-neutral-500 text-xs leading-relaxed whitespace-pre-wrap border-t border-neutral-100 pt-4">
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
  const color = SPORT_COLORS[stream.sport] || '#FFBF00';

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:border-neutral-300 transition-all duration-300 cursor-pointer flex flex-col h-full hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-neutral-900 overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={stream.thumbnail} 
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Sport Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
        
        {/* Badge */}
        <div className="absolute top-3 left-3">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-[#FFBF00] px-2 py-0.5 rounded shadow-sm text-black font-extrabold text-[9px] tracking-wider">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
              <span>LIVE</span>
            </div>
          ) : (
            <div className="bg-neutral-900/90 border border-neutral-700 px-2 py-0.5 rounded shadow-sm text-white font-bold text-[9px] tracking-wider">
              <span>UPCOMING</span>
            </div>
          )}
        </div>

        {/* Play Icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play size={16} className="text-neutral-900 ml-0.5 fill-neutral-900" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xs font-bold text-neutral-800 line-clamp-2 mb-3 leading-snug group-hover:text-[#FFBF00] transition-colors">
          {stream.title}
        </h3>
        
        <div className="mt-auto pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-neutral-500 truncate max-w-[120px]">
              {stream.channelName}
            </span>
            {isUpcoming && stream.scheduledStartTime && (
              <WebCountdown targetIso={stream.scheduledStartTime} />
            )}
          </div>
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
        setTimeLeft('STARTING');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => String(n).padStart(2, '0');

      if (days > 0) {
        setTimeLeft(`${days}d ${pad(hours)}h`);
      } else {
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  if (!timeLeft) return null;
  const isImminent = timeLeft === 'STARTING';

  return (
    <div className="inline-flex items-center gap-1">
      <span className="text-[9px] font-extrabold tracking-widest text-[#FFBF00] tabular-nums">
        {timeLeft}
      </span>
    </div>
  );
}
