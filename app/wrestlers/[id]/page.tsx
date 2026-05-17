'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'motion/react';
import Image from 'next/image';
import { ChevronLeft, Trophy, Star, Zap, Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface WrestlerData {
  name: string;
  bio: string;
  biography?: string;
  image: string;
  championships?: string[];
  signatureMoves?: string[];
  rating?: number;
  followerCount?: number;
  followers?: string[];
}

export default function WrestlerProfile() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [wrestler, setWrestler] = useState<WrestlerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Track auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsub();
  }, []);

  // Live listener for wrestler data (real-time follower count)
  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, 'wrestlers', id);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as WrestlerData;
        setWrestler(data);
        const followers = data.followers || [];
        setFollowerCount(followers.length);
        if (userId) setIsFollowing(followers.includes(userId));
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [id, userId]);

  const handleFollow = async () => {
    if (!userId) {
      router.push('/profile');
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const docRef = doc(db, 'wrestlers', id);
      if (isFollowing) {
        await updateDoc(docRef, { followers: arrayRemove(userId) });
      } else {
        await updateDoc(docRef, { followers: arrayUnion(userId) });
      }
    } catch (err) {
      console.error('Follow error:', err);
      alert('Could not update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
    </div>
  );

  if (!wrestler) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-black p-6 text-center gap-6">
      <h1 className="text-4xl font-bold uppercase text-white">Competitor Not Found</h1>
      <p className="text-gray-500 text-sm">This wrestler may not have a profile yet or the link is incorrect.</p>
      <Link href="/arena" className="bg-brand-red text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-red-700 transition-colors">
        Back to Arena
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-brand-black">
      {/* Header Image */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={wrestler.image}
          alt={wrestler.name}
          fill
          className="object-cover object-top"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-8 left-6 p-3 rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-brand-red transition-colors z-20"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="absolute bottom-10 left-6 right-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="bg-brand-red text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
              Active Competitor
            </span>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none tracking-tighter">
              {wrestler.name}
            </h1>
            {wrestler.bio && (
              <p className="text-base text-gray-400 mt-2 font-medium">{wrestler.bio}</p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="px-6 space-y-10 -mt-4 relative z-10">

        {/* Stats Row — only show real data */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
            <Star size={20} className="text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-xl font-black text-white">
                {wrestler.rating ?? '—'}
              </p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Rating</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
            <Users size={20} className="text-brand-red flex-shrink-0" />
            <div>
              <p className="text-xl font-black text-white">{formatFollowers(followerCount)}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Fans</p>
            </div>
          </div>
        </section>

        {/* Biography */}
        {(wrestler.biography || wrestler.bio) && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Biography</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed text-sm">
                {wrestler.biography || wrestler.bio}
              </p>
            </div>
          </section>
        )}

        {/* Signature Moves */}
        {wrestler.signatureMoves && wrestler.signatureMoves.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Zap size={13} className="text-brand-red" /> Signature Moves
            </h2>
            <div className="flex flex-wrap gap-2">
              {wrestler.signatureMoves.map((move, i) => (
                <span key={i} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-white">
                  {move}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Championships */}
        {wrestler.championships && wrestler.championships.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Trophy size={13} className="text-brand-red" /> Championships
            </h2>
            <div className="space-y-2">
              {wrestler.championships.map((title, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 border-l-2 border-l-brand-red p-4 rounded-2xl">
                  <Trophy size={15} className="text-brand-red flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">{title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Follow Button */}
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`w-full py-4 rounded-2xl font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${
            isFollowing
              ? 'bg-white/10 border border-white/20 text-white hover:bg-red-900/30 hover:border-brand-red hover:text-brand-red'
              : 'bg-brand-red text-white hover:bg-red-700'
          }`}
        >
          {followLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isFollowing ? (
            <>
              <UserCheck size={18} />
              Following {wrestler.name.split(' ')[0]}
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Follow {wrestler.name.split(' ')[0]}
            </>
          )}
        </button>

        {!userId && (
          <p className="text-center text-xs text-gray-600">
            <Link href="/profile" className="text-brand-red hover:underline">Sign in</Link> to follow this competitor
          </p>
        )}
      </div>
    </div>
  );
}
