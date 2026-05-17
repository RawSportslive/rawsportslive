'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Search, Loader2, X, Calendar, User, Clock, Newspaper } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const newsCategories = ["All", "RAW", "SmackDown", "Rumors", "NXT", "Events"];

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  createdAt?: any;
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsArticle[];
      setArticles(newsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching news:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredArticles = activeCategory === "All" 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 space-y-8 bg-brand-black">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-white">
          LATEST <span className="text-brand-red">NEWS</span>
        </h1>
        <p className="text-gray-400 text-sm font-medium max-w-sm">
          Stay updated with the most reliable wrestling news and intel.
        </p>
      </header>

      {/* Search and Categories */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white/5 border border-white/10 flex items-center px-4 py-3 rounded-2xl">
          <Search size={20} className="text-gray-500" />
          <input 
            placeholder="Search news, rumors..." 
            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full ml-3 placeholder:text-gray-600 text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {newsCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' 
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {articles.length === 0 && loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse space-y-4 bg-white/5 rounded-2xl p-5 border border-white/5">
              <div className="aspect-[16/10] bg-white/10 rounded-xl" />
              <div className="space-y-3 mt-4">
                <div className="h-5 bg-white/10 rounded-lg w-5/6" />
                <div className="h-4 bg-white/5 rounded-md w-full" />
                <div className="h-4 bg-white/5 rounded-md w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article) => (
              <motion.div 
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedArticle(article)}
                className="group cursor-pointer bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-brand-red/30 transition-all"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image 
                    src={article.image} 
                    alt={article.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-brand-red text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold leading-snug text-white group-hover:text-brand-red transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed font-medium">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-red/20 flex items-center justify-center">
                        <User size={12} className="text-brand-red" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={10} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {article.createdAt?.toDate().toLocaleDateString() || 'Today'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md overflow-y-auto no-scrollbar"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-4xl bg-brand-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl my-auto"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/60 hover:bg-brand-red text-white transition-all backdrop-blur-md border border-white/10"
              >
                <X size={24} />
              </button>

              <div className="relative w-full h-[300px] md:h-[450px]">
                <Image 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title} 
                  fill 
                  className="object-cover"
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="bg-brand-red text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest mb-4 inline-block shadow-lg">
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-2xl md:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              <div className="p-8 md:p-12 space-y-8">
                <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-white/5 text-gray-400">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-brand-red" />
                    <span className="text-xs font-bold uppercase tracking-widest">{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-brand-red" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {selectedArticle.createdAt?.toDate().toLocaleDateString() || 'Recently Published'}
                    </span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 text-base md:text-lg leading-relaxed space-y-6 font-medium">
                    {selectedArticle.content?.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    )) || selectedArticle.excerpt}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && filteredArticles.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-6 rounded-full bg-white/5">
            <Newspaper size={48} className="text-gray-700" />
          </div>
          <h3 className="text-xl font-bold uppercase text-white">No Stories Found</h3>
          <p className="text-gray-400 text-sm max-w-xs">Try exploring another category or check back later for breaking news.</p>
        </div>
      )}
    </div>
  );
}

