'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Search, RefreshCw, Clock, ShieldCheck, Play, X, Tv } from 'lucide-react';

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
  all: '#FFBF00',
  wrestling: '#FFBF00',
  football: '#10B981',
  cricket: '#3B82F6',
  basketball: '#F59E0B',
  ufc: '#EF4444',
  f1: '#EC4899',
  tennis: '#84CC16',
  esports: '#8B5CF6',
  nepal: '#DC2626',
};

export default function LiveClient({
  initialLiveStreams,
  initialUpcomingStreams,
}: {
  initialLiveStreams: LiveStream[];
  initialUpcomingStreams: LiveStream[];
}) {
  const [activeSport, setActiveSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(initialLiveStreams);
  const [upcomingStreams, setUpcomingStreams] = useState<LiveStream[]>(initialUpcomingStreams);
  const [isRefetching, setIsRefetching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<LiveStream | null>(null);

  const fetchData = async () => {
    setIsRefetching(true);
    try {
      const [liveRes, upcomingRes] = await Promise.all([
        fetch(`/api/live/streams?sport=all`),
        fetch(`/api/live/upcoming?sport=all`),
      ]);
      const liveData = await liveRes.json();
      const upcomingData = await upcomingRes.json();
      setLiveStreams(liveData.streams || []);
      setUpcomingStreams(upcomingData.streams || []);
    } catch (err) {
      console.error('Failed to fetch live hub data:', err);
    } finally {
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredLive = liveStreams.filter((s) => {
    if (activeSport !== 'all' && s.sport !== activeSport) return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredUpcoming = upcomingStreams.filter((s) => {
    if (activeSport !== 'all' && s.sport !== activeSport) return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const allSports = ['all', 'wrestling', 'football', 'cricket', 'basketball', 'ufc', 'f1', 'tennis', 'esports', 'nepal'];

  return (
    <div className="min-h-screen pt-8 pb-24 w-full" style={{ backgroundColor: '#faf9f6', color: '#121212' }}>

      {/* ── Header ── */}
      <div className="w-full px-4 sm:px-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase" style={{ color: '#121212' }}>
            RAWSPORTS <span style={{ color: '#FFBF00' }}>LIVE</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#FFBF00' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#FFBF00' }}></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#888' }}>
              {liveStreams.length} Broadcast{liveStreams.length !== 1 ? 's' : ''} Online
            </span>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold disabled:opacity-50 cursor-pointer transition-all"
          style={{ borderColor: '#e5e5e5', backgroundColor: '#fff', color: '#555' }}
        >
          <RefreshCw size={13} className={isRefetching ? 'animate-spin' : ''} style={{ color: isRefetching ? '#FFBF00' : '#888' }} />
          Sync Hub
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="w-full px-4 sm:px-6 mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b pb-5" style={{ borderColor: '#e5e5e5' }}>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto">
            {allSports.map((sport) => {
              const isActive = activeSport === sport;
              const count = sport === 'all'
                ? liveStreams.length
                : liveStreams.filter((s) => s.sport === sport).length;
              const color = SPORT_COLORS[sport] || '#FFBF00';
              return (
                <button
                  key={sport}
                  onClick={() => setActiveSport(sport)}
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border"
                  style={isActive
                    ? { backgroundColor: '#121212', borderColor: '#121212', color: '#fff' }
                    : { backgroundColor: '#fff', borderColor: '#e5e5e5', color: '#777' }
                  }
                >
                  {sport !== 'all' && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  )}
                  {sport}
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
                      style={isActive
                        ? { backgroundColor: '#FFBF00', color: '#000' }
                        : { backgroundColor: '#f0f0f0', color: '#555' }
                      }
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#aaa' }} />
            <input
              type="text"
              placeholder="Search live events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full pl-9 pr-4 py-2 text-xs font-medium border focus:outline-none transition-all"
              style={{ borderColor: '#e5e5e5', backgroundColor: '#fff', color: '#121212' }}
            />
          </div>
        </div>
      </div>

      {/* ── LIVE NOW ── */}
      <div className="w-full px-4 sm:px-6 mb-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border" style={{ backgroundColor: 'rgba(255,191,0,0.08)', borderColor: 'rgba(255,191,0,0.3)' }}>
            <Radio size={13} className="animate-pulse" style={{ color: '#FFBF00' }} />
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#FFBF00' }}>LIVE NOW</span>
            <span className="text-xs font-black ml-0.5" style={{ color: '#FFBF00' }}>{filteredLive.length}</span>
          </div>
        </div>

        {filteredLive.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border" style={{ backgroundColor: '#fff', borderColor: '#e5e5e5' }}>
            <Tv size={28} className="mx-auto mb-4" style={{ color: '#ccc' }} />
            <h3 className="text-base font-bold mb-1 uppercase tracking-tight" style={{ color: '#333' }}>No Streams Live Right Now</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#999' }}>
              All official channels are currently off-air. Check upcoming events below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filteredLive.map((stream) => (
              <LiveCard key={stream.videoId} stream={stream} onClick={() => setSelectedVideo(stream)} />
            ))}
          </div>
        )}
      </div>

      {/* ── UPCOMING ── */}
      {filteredUpcoming.length > 0 && (
        <div className="w-full px-4 sm:px-6 mb-14">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border" style={{ backgroundColor: '#f5f5f5', borderColor: '#e5e5e5' }}>
              <Clock size={13} style={{ color: '#888' }} />
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#666' }}>UPCOMING STREAMS</span>
              <span className="text-xs font-black" style={{ color: '#666' }}>{filteredUpcoming.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filteredUpcoming.map((stream) => (
              <LiveCard key={stream.videoId} stream={stream} onClick={() => setSelectedVideo(stream)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Footer note ── */}
      <div className="w-full px-4 sm:px-6 mt-16">
        <div className="rounded-2xl p-4 flex items-start gap-3 border" style={{ backgroundColor: '#fff', borderColor: '#e5e5e5' }}>
          <ShieldCheck size={18} className="shrink-0 mt-0.5" style={{ color: '#10B981' }} />
          <p className="text-xs font-semibold leading-relaxed" style={{ color: '#888' }}>
            All streams are embedded directly from official verified YouTube channels. We do not host, download, or restream any content.
          </p>
        </div>
      </div>

      {/* ── Video Modal ── */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)' }}
        >
          <div className="w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col" style={{ backgroundColor: '#fff', maxHeight: '92vh', border: '1px solid #e5e5e5' }}>

            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-5 right-5 z-50 p-2.5 rounded-full transition-all cursor-pointer"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X size={18} color="#fff" />
            </button>

            {/* Player — uses live_stream embed to always show current live, no quota */}
            <div className="relative w-full shrink-0" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/live_stream?channel=${selectedVideo.channelId}&autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* Info */}
            <div className="p-5 overflow-y-auto" style={{ backgroundColor: '#fff' }}>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest"
                  style={{ backgroundColor: '#FFBF00', color: '#000' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#000' }} />
                  LIVE NOW
                </div>
                <div className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest border uppercase"
                  style={{ borderColor: SPORT_COLORS[selectedVideo.sport], color: SPORT_COLORS[selectedVideo.sport], backgroundColor: `${SPORT_COLORS[selectedVideo.sport]}12` }}>
                  {selectedVideo.sport}
                </div>
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight mb-2" style={{ color: '#121212' }}>{selectedVideo.title}</h2>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888' }}>{selectedVideo.channelName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function LiveCard({ stream, onClick }: { stream: LiveStream; onClick: () => void }) {
  const isLive = stream.status === 'live';
  const color = SPORT_COLORS[stream.sport] || '#FFBF00';

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300"
      style={{ backgroundColor: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: '16/9', backgroundColor: '#111' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stream.thumbnail}
          alt={stream.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            // Fallback to hqdefault if maxresdefault fails
            const target = e.target as HTMLImageElement;
            target.src = `https://img.youtube.com/vi/${stream.videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />

        {/* Top color bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black tracking-wider" style={{ backgroundColor: '#FFBF00', color: '#000' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#000' }} />
              LIVE
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border" style={{ backgroundColor: 'rgba(0,0,0,0.85)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              UPCOMING
            </div>
          )}
        </div>

        {/* Play hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <Play size={16} fill="#111" color="#111" className="ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#aaa' }}>{stream.sport}</span>
        </div>
        <h3 className="text-xs font-bold line-clamp-2 mb-3 leading-snug uppercase tracking-tight transition-colors" style={{ color: '#222' }}>
          {stream.title}
        </h3>
        <div className="mt-auto pt-3 border-t flex items-center justify-between" style={{ borderColor: '#f0f0f0' }}>
          <span className="text-[10px] font-black tracking-wider uppercase truncate max-w-[120px]" style={{ color: '#999' }}>
            {stream.channelName}
          </span>
          {stream.status === 'upcoming' && stream.scheduledStartTime && (
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
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft('STARTING'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const p = (n: number) => String(n).padStart(2, '0');
      setTimeLeft(d > 0 ? `${d}d ${p(h)}h` : `${p(h)}:${p(m)}:${p(s)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!timeLeft) return null;
  return (
    <span className="text-[9px] font-black tabular-nums px-2 py-0.5 rounded border" style={{ color: '#FFBF00', backgroundColor: 'rgba(255,191,0,0.08)', borderColor: 'rgba(255,191,0,0.25)' }}>
      {timeLeft}
    </span>
  );
}
