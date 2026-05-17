'use client';

import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, limit, getDocs, onSnapshot } from 'firebase/firestore';

export default function ContentPreloader() {
  useEffect(() => {
    // Warm up the cache for main collections
    const collections = ['news', 'videos', 'wrestlers'];
    
    collections.forEach(colName => {
      const q = query(collection(db, colName), limit(20));
      
      // We use onSnapshot to keep the local cache hot and updated in the background
      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Just listening is enough to fill the persistentLocalCache
        console.log(`Preloaded ${snapshot.size} items from ${colName}`);
      }, (error) => {
        console.error(`Preload error for ${colName}:`, error);
      });

      return () => unsubscribe();
    });
  }, []);

  return null; // This component doesn't render anything
}
