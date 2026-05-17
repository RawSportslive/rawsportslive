'use client';

import React from 'react';
import Image from 'next/image';
import { Newspaper, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface NewsCardProps {
  title: string;
  category: string;
  image: string;
  time: string;
}
export default function NewsCard({ title, category, image, time }: NewsCardProps) {
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    if (auth.currentUser) {
      const checkSaved = async () => {
        const docRef = doc(db, `users/${auth.currentUser?.uid}/bookmarks`, title.replace(/[^a-zA-Z0-9]/g, '_'));
        const docSnap = await getDoc(docRef);
        setIsSaved(docSnap.exists());
      };
      checkSaved();
    }
  }, [title]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    
    const bookmarkId = title.replace(/[^a-zA-Z0-9]/g, '_');
    const docRef = doc(db, `users/${auth.currentUser.uid}/bookmarks`, bookmarkId);

    if (isSaved) {
      await deleteDoc(docRef);
      setIsSaved(false);
    } else {
      await setDoc(docRef, { title, category, image, time, timestamp: serverTimestamp() });
      setIsSaved(true);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass overflow-hidden rounded-2xl group cursor-pointer relative"
    >
      <div className="relative h-48 w-full">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized={true}
        />
        <div className="absolute top-4 left-4">
          <span className="bg-brand-red text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
            {category}
          </span>
        </div>
        <button 
          onClick={handleSave}
          className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-brand-red transition-all"
        >
          {isSaved ? <BookmarkCheck size={16} fill="currentColor" /> : <Bookmark size={16} />}
        </button>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-base font-bold leading-tight group-hover:text-brand-red transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between pt-2">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-tight">
            {time}
          </span>

          <div className="p-1 rounded-full bg-white/5 group-hover:bg-brand-red/20 transition-colors">
            <ChevronRight size={14} className="text-brand-red" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
