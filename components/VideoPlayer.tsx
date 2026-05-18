'use client';

import React, { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Share2, Settings, SkipBack, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { db, auth } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface VideoPlayerProps {
  url: string;
  title: string;
  thumbnail?: string;
  recommendations?: any[];
  startAt?: number;
}

export default function VideoPlayer({ url, title, thumbnail, recommendations = [], startAt = 0 }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isPseudoLandscape, setIsPseudoLandscape] = useState(false);
  const playerRef = useRef<any>(null);
  
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const videoId = isYoutube ? (url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop()) : null;
  const finalThumbnail = thumbnail || (isYoutube ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

  // Record History when video starts playing + save lastPosition every 10s
  useEffect(() => {
    if (isPlaying && auth.currentUser) {
      const historyId = videoId || url.replace(/[^a-zA-Z0-9]/g, '_');
      setDoc(doc(db, `users/${auth.currentUser.uid}/history`, historyId), {
        title,
        url,
        thumbnail: finalThumbnail,
        timestamp: serverTimestamp()
      }, { merge: true });
    }
  }, [isPlaying, url, title, videoId, finalThumbnail]);

  // Save lastPosition every 10 seconds while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (auth.currentUser && playerRef.current) {
        const historyId = videoId || url.replace(/[^a-zA-Z0-9]/g, '_');
        const currentTime = playerRef.current.getCurrentTime?.() || 0;
        setDoc(doc(db, `users/${auth.currentUser.uid}/history`, historyId), {
          lastPosition: Math.floor(currentTime)
        }, { merge: true });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isPlaying, videoId, url]);

  // Custom Controls for YouTube
  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (startAt > 0) {
      event.target.seekTo(startAt, true);
    }
    if (playRequested) {
      event.target.playVideo();
      setIsPlaying(true);
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = Playing, 2 = Paused, 0 = Ended
    if (event.data === 1) {
      setIsPlaying(true);
      setHasStarted(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    }
    
    if (event.data === 0) setIsEnded(true);
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime();
        const d = playerRef.current.getDuration() || 1;
        const val = (currentTime / d) * 100;
        setProgress(isNaN(val) ? 0 : val);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (isYoutube && playerRef.current) {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (isYoutube && playerRef.current) {
      playerRef.current.setVolume(val);
      if (val === 0) setIsMuted(true);
      else if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (isYoutube && playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 100);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isYoutube && playerRef.current) {
      const d = playerRef.current.getDuration() || 1;
      playerRef.current.seekTo((val / 100) * d);
      setProgress(val);
    }
  };

  const skip = (seconds: number) => {
    if (isYoutube && playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + seconds);
    }
  };

  const [showControls, setShowControls] = useState(true);
  const timeoutRef = useRef<any>(null);

  const resetTimer = () => {
    setShowControls(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowControls(false), 2000);
  };

  const [playRequested, setPlayRequested] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [volume, setVolume] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);

  const startPlayback = () => {
    setHasStarted(true);
    setPlayRequested(true);
    if (isYoutube && playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      const doc = document as any;
      const container = containerRef.current as any;
      const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);

      if (isFs || isPseudoLandscape) {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (exit) {
          try { await exit.call(doc); } catch (e) {}
        }
        setIsPseudoLandscape(false);
        if (screen.orientation && screen.orientation.unlock) {
          try { screen.orientation.unlock(); } catch (e) {}
        }
      } else {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        const req = container.requestFullscreen || container.webkitRequestFullscreen || container.mozRequestFullScreen || container.msRequestFullscreen;
        if (req) {
          try { await req.call(container); } catch (e) {}
        }

        // Apply pseudo-landscape if mobile to rotate layout 90deg (bulletproof against system portrait locks)
        if (isMobile) {
          setIsPseudoLandscape(true);
        }

        // Wait for the browser to transition to fullscreen before locking orientation
        setTimeout(async () => {
          const orientation = screen.orientation as any;
          if (orientation && orientation.lock) {
            try {
              await orientation.lock('landscape');
            } catch (e) {
              try {
                await orientation.lock('landscape-primary');
              } catch (err2) {
                console.log("Landscape lock failed:", err2);
              }
            }
          }
        }, 250);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      if (!isFs) {
        setIsPseudoLandscape(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to arena clipboard!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const setVideoQuality = (level: string) => {
    if (isYoutube && playerRef.current) {
      // YouTube levels: highres, hd1080, hd720, large, medium, small, tiny, default
      const ytLevel = level === '1080p' ? 'hd1080' : 
                      level === '720p' ? 'hd720' : 
                      level === '480p' ? 'large' : 
                      level === '360p' ? 'medium' : 
                      level === '240p' ? 'small' : 
                      level === '144p' ? 'tiny' : 'default';
      playerRef.current.setPlaybackQuality(ytLevel);
      setCurrentQuality(level);
      setShowQualityMenu(false);
    }
  };

  useEffect(() => {
    resetTimer();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          !hasStarted ? startPlayback() : togglePlay();
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
      resetTimer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => { 
      if (timeoutRef.current) clearTimeout(timeoutRef.current); 
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, hasStarted, isMuted, volume]);

  return (
    <div 
      ref={containerRef}
      className={`relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 group transition-all duration-300 ${showControls ? 'cursor-default' : 'cursor-none'}`}
      onMouseMove={resetTimer}
      onClick={resetTimer}
      style={isPseudoLandscape ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '100vh',
        height: '100vw',
        transform: 'translate(-50%, -50%) rotate(90deg)',
        zIndex: 99999,
        borderRadius: 0,
        maxWidth: 'none',
        maxHeight: 'none',
      } : {}}
    >
      {isYoutube ? (
        <div className={`absolute inset-0 scale-[1.12] transition-opacity duration-700 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          <YouTube
            videoId={videoId!}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: playRequested ? 1 : 0,
                controls: 0,
                rel: 0,
                playsinline: 1,
                iv_load_policy: 3,
                modestbranding: 1,
                enablejsapi: 1,
                origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                widget_referrer: typeof window !== 'undefined' ? window.location.origin : undefined,
              },
            }}
            onReady={onReady}
            onStateChange={onStateChange}
            className="w-full h-full"
          />
          {/* Transparent blocker — prevents mobile touches from reaching YouTube's native UI */}
          <div className="absolute inset-0 z-10" style={{ pointerEvents: 'auto', background: 'transparent' }} />
        </div>
      ) : (
        <video src={url} className="w-full h-full object-cover" />
      )}

      {/* Central Play/Pause Controller (Only at beginning) */}
      <AnimatePresence>
        {(!hasStarted && showControls) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-0 left-0 right-0 bottom-24 z-[70] flex items-center justify-center cursor-pointer"
            onMouseDown={(e) => { 
              e.stopPropagation(); 
              startPlayback(); 
            }}
          >
            <div 
              className="w-20 h-20 bg-brand-red rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,0,0,0.5)] transform transition-all duration-300 hover:scale-110 active:scale-90"
            >
               <Play size={40} fill="white" className="text-white ml-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible Click Toggle Layer (Active during playback) */}
      {hasStarted && (
        <div 
          className="absolute top-0 left-0 right-0 bottom-24 z-[65] cursor-pointer"
          onMouseDown={(e) => {
            e.stopPropagation();
            togglePlay();
            resetTimer();
          }}
        />
      )}

      {/* Branded Play Cover (Initial State) */}
      {!hasStarted && (
        <div 
          className="absolute inset-0 z-[80] cursor-pointer group/cover"
          onClick={startPlayback}
        >
          <img 
            src={finalThumbnail} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center" />
          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white drop-shadow-2xl">{title}</h2>
          </div>
        </div>
      )}

      {/* Dynamic Action Masks (Auto-hiding) */}
      <AnimatePresence>
        {showControls && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" 
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" 
            />
          </>
        )}
      </AnimatePresence>

      {/* Quality Selection Menu */}
      <AnimatePresence>
        {showQualityMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-16 right-2 w-44 max-h-[60%] overflow-y-auto bg-black/95 backdrop-blur-2xl rounded-2xl border border-white/10 z-[100] shadow-2xl"
          >
             <div className="px-3 pt-3 pb-2 border-b border-white/5 sticky top-0 bg-black/95">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quality</p>
             </div>
             {['Auto', '1080p', '720p', '480p', '360p', '240p', '144p'].map((q) => (
               <button 
                 key={q}
                 onClick={() => setVideoQuality(q)}
                 className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-all"
               >
                 <span className={`text-xs font-bold ${currentQuality === q ? 'text-brand-red' : 'text-gray-400'}`}>
                   {q}{q === '1080p' || q === '720p' ? ' HD' : q === 'Auto' ? ' ✦' : ''}
                 </span>
                 {currentQuality === q && <div className="w-1.5 h-1.5 rounded-full bg-brand-red" />}
               </button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Overlay Controls */}
      <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 z-[60] pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-black/80 backdrop-blur-lg border-t border-white/5 pointer-events-auto">
          {/* Progress Bar - Aligned to top edge */}
          <div className="relative w-full h-1 bg-white/10 cursor-pointer overflow-hidden">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={String(progress)} 
              onChange={seek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="h-full bg-brand-red transition-all duration-200" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button onClick={togglePlay} className="text-white hover:text-brand-red transition-colors">
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              
              <div className="flex items-center gap-3">
                <button onClick={() => skip(-10)} className="text-gray-400 hover:text-white transition-colors">
                  <SkipBack size={20} />
                </button>
                <button onClick={() => skip(10)} className="text-gray-400 hover:text-white transition-colors">
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center gap-3 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-brand-red transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300 flex items-center h-full">
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-red ml-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <button onClick={handleShare} className="text-gray-400 hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
              <button 
                onClick={() => setShowQualityMenu(!showQualityMenu)} 
                className={`flex items-center gap-1 transition-colors group ${currentQuality === '1080p' || currentQuality === '720p' ? 'text-brand-red' : 'text-gray-400 hover:text-white'}`}
              >
                <Settings size={18} className={currentQuality === '1080p' || currentQuality === '720p' ? 'animate-pulse-subtle' : ''} />
                <span className="text-[8px] font-bold uppercase">{currentQuality === '1080p' || currentQuality === '720p' ? 'HD' : 'SD'}</span>
              </button>
              <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white transition-colors">
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Overlay on End */}
      <AnimatePresence>
        {isEnded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-8 text-center"
          >
            <h3 className="text-2xl font-bold uppercase tracking-tight mb-8">What's Next Superstar?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {recommendations.slice(0, 3).map((v, i) => (
                <div key={i} className="space-y-3 cursor-pointer group">
                   <div className="aspect-video bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                      <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-white truncate">{v.title}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => { playerRef.current.seekTo(0); playerRef.current.playVideo(); setIsEnded(false); }}
              className="mt-12 flex items-center gap-2 text-brand-red font-bold uppercase text-[10px] tracking-widest"
            >
              <RotateCcw size={16} /> Replay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
