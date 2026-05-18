'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
  addDoc, serverTimestamp, query, orderBy, getCountFromServer
} from 'firebase/firestore';
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Comment {
  id: string;
  text: string;
  userId: string;
  displayName: string;
  createdAt: any;
}

interface VideoEngagementProps {
  videoId: string;
  videoTitle: string;
}

export default function VideoEngagement({ videoId, videoTitle }: VideoEngagementProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = auth.currentUser?.uid;

  // Subscribe to likes/dislikes
  useEffect(() => {
    if (!videoId) return;
    const likesRef = collection(db, `videos/${videoId}/likes`);
    const dislikesRef = collection(db, `videos/${videoId}/dislikes`);

    const unsubLikes = onSnapshot(likesRef, (snap) => {
      setLikeCount(snap.size);
      setUserLiked(!!snap.docs.find(d => d.id === uid));
    });

    const unsubDislikes = onSnapshot(dislikesRef, (snap) => {
      setDislikeCount(snap.size);
      setUserDisliked(!!snap.docs.find(d => d.id === uid));
    });

    return () => { unsubLikes(); unsubDislikes(); };
  }, [videoId, uid]);

  // Subscribe to comments
  useEffect(() => {
    if (!videoId || !showComments) return;
    const q = query(collection(db, `videos/${videoId}/comments`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    });
    return () => unsub();
  }, [videoId, showComments]);

  const handleLike = async () => {
    if (!uid) return alert('Sign in to like videos');
    const likeDoc = doc(db, `videos/${videoId}/likes`, uid);
    const dislikeDoc = doc(db, `videos/${videoId}/dislikes`, uid);
    if (userLiked) {
      await deleteDoc(likeDoc);
    } else {
      await setDoc(likeDoc, { uid, createdAt: serverTimestamp() });
      if (userDisliked) await deleteDoc(dislikeDoc);
    }
  };

  const handleDislike = async () => {
    if (!uid) return alert('Sign in to rate videos');
    const dislikeDoc = doc(db, `videos/${videoId}/dislikes`, uid);
    const likeDoc = doc(db, `videos/${videoId}/likes`, uid);
    if (userDisliked) {
      await deleteDoc(dislikeDoc);
    } else {
      await setDoc(dislikeDoc, { uid, createdAt: serverTimestamp() });
      if (userLiked) await deleteDoc(likeDoc);
    }
  };

  const postComment = async () => {
    if (!uid) return alert('Sign in to comment');
    const text = commentText.trim();
    if (!text) return;
    setPosting(true);
    try {
      await addDoc(collection(db, `videos/${videoId}/comments`), {
        text,
        userId: uid,
        displayName: auth.currentUser?.displayName || 'Arena Fan',
        createdAt: serverTimestamp(),
      });
      setCommentText('');
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (ts: any) => {
    if (!ts?.toDate) return 'just now';
    const d = ts.toDate();
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Like / Dislike Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            userLiked
              ? 'bg-[#FFBF00] text-black shadow-[0_0_20px_rgba(255,191,0,0.4)]'
              : 'bg-white/80 text-[#121212] border border-black/10 hover:bg-[#FFBF00]/20'
          }`}
        >
          <ThumbsUp size={16} fill={userLiked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={handleDislike}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            userDisliked
              ? 'bg-gray-800 text-white'
              : 'bg-white/80 text-[#121212] border border-black/10 hover:bg-gray-100'
          }`}
        >
          <ThumbsDown size={16} fill={userDisliked ? 'currentColor' : 'none'} />
          <span>{dislikeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white/80 text-[#121212] border border-black/10 hover:bg-gray-100 transition-all active:scale-95 ml-auto"
        >
          <MessageCircle size={16} />
          <span>Comments</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Comment Input */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && postComment()}
                placeholder="Drop your take..."
                maxLength={300}
                className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-medium text-[#121212] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFBF00]"
              />
              <button
                onClick={postComment}
                disabled={posting || !commentText.trim()}
                className="px-4 py-3 bg-[#FFBF00] hover:bg-amber-400 text-black rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {posting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>

            {/* Comment List */}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {comments.length === 0 && (
                <p className="text-center text-gray-400 text-xs uppercase tracking-widest py-6 font-bold">
                  Be first to drop a comment
                </p>
              )}
              {comments.map(c => (
                <div key={c.id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#FFBF00]/20 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-[#FFBF00]" />
                  </div>
                  <div className="flex-1 bg-white/80 border border-black/5 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-[#121212] uppercase tracking-wide">{c.displayName}</span>
                      <span className="text-[10px] text-gray-400">{formatTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#121212]">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
