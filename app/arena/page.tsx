'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Trophy, Users, Zap, Image as ImageIcon, Star, ChevronRight, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Wrestler {
  id: string;
  name: string;
  title: string;
  rating: number;
  image: string;
}

export default function ArenaPage() {
  const [tab, setTab] = useState<'roster' | 'quiz' | 'wallpapers'>('roster');
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'wrestlers'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wrestlerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Wrestler[];
      setWrestlers(wrestlerData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching wrestlers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen pt-12 pb-32 px-6 space-y-8 bg-brand-black">
      <header className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-white">
            ROSTER <span className="text-brand-red">& STATS</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium max-w-sm leading-relaxed">
            Your hub for superstar profiles, daily battlegrounds, and exclusive fan assets.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setTab('roster')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${tab === 'roster' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Users size={16} /> Roster
          </button>
          <button 
            onClick={() => setTab('quiz')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${tab === 'quiz' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Zap size={16} /> Battleground
          </button>
          <button 
            onClick={() => setTab('wallpapers')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${tab === 'wallpapers' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <ImageIcon size={16} /> Assets
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {tab === 'roster' && (
          <motion.div 
            key="roster"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {wrestlers.length === 0 && loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4.5] bg-white/5 rounded-2xl border border-white/5" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-white/10 rounded-lg w-3/4" />
                      <div className="h-3 bg-white/5 rounded-md w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {wrestlers.map((wrestler) => (
                  <Link key={wrestler.id} href={`/wrestlers/${wrestler.id}`}>
                    <div className="relative aspect-[3/4.5] rounded-2xl overflow-hidden bg-white/5 border border-white/5 group cursor-pointer transition-all hover:border-brand-red/30">
                      <Image 
                        src={wrestler.image} 
                        alt={wrestler.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        unoptimized={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3 bg-brand-red text-white px-2 py-1 rounded-md flex items-center gap-1 font-bold text-[10px] shadow-lg">
                        <Star size={10} fill="currentColor" /> {wrestler.rating}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 space-y-1">
                        <p className="text-base font-bold uppercase text-white leading-none">{wrestler.name}</p>
                        <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest opacity-90">{wrestler.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'quiz' && (
          <motion.div 
            key="quiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold uppercase text-white">Daily Trivia Battle</h3>
                <p className="text-gray-400 text-sm font-medium">Challenge your wrestling knowledge and climb the leaderboard.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Difficulty</p>
                  <p className="text-sm font-bold text-brand-red uppercase tracking-wider">Champion</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reward</p>
                  <p className="text-sm font-bold text-white uppercase tracking-wider">+500 PTS</p>
                </div>
              </div>
              <button className="w-full bg-brand-red hover:bg-red-700 text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-brand-red/10">
                Enter Battleground
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                  <Trophy size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase leading-tight">Global Leaderboard</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rank: #2,450</p>
                </div>
              </div>
              <ChevronRight className="text-gray-700 group-hover:text-white transition-colors" />
            </div>
          </motion.div>
        )}

        {tab === 'wallpapers' && (
          <motion.div 
            key="wallpapers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group cursor-pointer">
                <div className="relative h-56 w-full">
                  <Image 
                    src={`https://picsum.photos/seed/wall${i}/800/600`} 
                    alt="Wallpaper" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold text-white uppercase">Legendary Pack 0{i}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Super HD • Mobile Assets</p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-red transition-all">
                      <Zap size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

