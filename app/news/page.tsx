'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Search, Loader2, X, Calendar, User, Clock, Newspaper, Share2, Bookmark, Eye } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';

const newsCategories = ["All", "Saved", "RAW", "SmackDown", "Rumors", "NXT", "Events", "WWE News", "Nepal"];

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  link?: string;
  createdAt?: any;
  views?: number;
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rawsports_saved_articles');
    if (saved) {
      try { setBookmarkedIds(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newBookmarks = bookmarkedIds.includes(id) 
      ? bookmarkedIds.filter(b => b !== id) 
      : [...bookmarkedIds, id];
    setBookmarkedIds(newBookmarks);
    localStorage.setItem('rawsports_saved_articles', JSON.stringify(newBookmarks));
  };

  const calculateReadingTime = (text: string) => {
    const words = text ? text.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  useEffect(() => {
    if (selectedArticle) {
      const viewedKey = `rawsports_viewed_${selectedArticle.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, 'true');
        const articleRef = doc(db, 'news', selectedArticle.id);
        updateDoc(articleRef, { views: increment(1) }).catch(err => console.error("Error updating views:", err));
      }
    }
  }, [selectedArticle]);

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

  const filteredArticles = articles.filter(a => {
    const matchesCategory = activeCategory === "All" || (activeCategory === "Saved" ? bookmarkedIds.includes(a.id) : a.category === activeCategory);
    const matchesSearch = searchQuery === "" || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": articles.slice(0, 10).map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.excerpt,
        "image": article.image,
        "author": {
          "@type": "Person",
          "name": article.author
        },
        "publisher": {
          "@type": "SportsOrganization",
          "name": "RawSports Live",
          "logo": {
            "@type": "ImageObject",
            "url": "https://rawsportslive.vercel.app/logo.png"
          }
        }
      }
    }))
  };

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 space-y-8 bg-brand-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
      />
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full ml-3 placeholder:text-gray-600 text-white outline-none"
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((n) => (
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                <div className="relative aspect-[16/10] overflow-hidden bg-white/5 flex items-center justify-center">
                  <img 
                    src={article.image || '/logo.png'} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                      e.currentTarget.onerror = null;
                      e.currentTarget.className = "w-32 h-32 object-contain opacity-20";
                    }}
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
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-red/20 flex items-center justify-center">
                        <User size={12} className="text-brand-red" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[80px]">{article.author}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {calculateReadingTime(article.content || article.excerpt)} Min
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 mr-2">
                        <Eye size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {article.views || 0}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const shareUrl = article.link || window.location.href;
                          if (navigator.share) {
                            navigator.share({ title: article.title, text: article.excerpt, url: shareUrl }).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(shareUrl);
                            alert("Link copied!");
                          }
                        }}
                        className="text-gray-500 hover:text-white transition-colors p-1"
                        aria-label="Share"
                      >
                        <Share2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => toggleBookmark(article.id, e)}
                        className={`transition-colors p-1 ${bookmarkedIds.includes(article.id) ? 'text-brand-red' : 'text-gray-500 hover:text-brand-red'}`}
                        aria-label="Save"
                      >
                        <Bookmark size={14} fill={bookmarkedIds.includes(article.id) ? "currentColor" : "none"} />
                      </button>
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
                className="absolute right-6 z-10 p-3 rounded-full bg-black/60 hover:bg-brand-red transition-all backdrop-blur-md border border-white/10"
                style={{ top: 'calc(env(safe-area-inset-top, 0px) + 24px)', color: '#ffffff' }}
              >
                <X size={24} style={{ color: '#ffffff' }} />
              </button>

              <div className="relative w-full h-[300px] md:h-[450px] bg-white/5 flex items-center justify-center">
                <img 
                  src={selectedArticle.image || '/logo.png'} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.png';
                    e.currentTarget.onerror = null;
                    e.currentTarget.className = "w-48 h-48 object-contain opacity-20";
                  }}
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
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-brand-red" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {calculateReadingTime(selectedArticle.content || selectedArticle.excerpt)} MIN READ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-brand-red" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {selectedArticle.views || 0} VIEWS
                    </span>
                  </div>
                  
                  <div className="flex-1 flex justify-end gap-3 mt-4 md:mt-0">
                    <button 
                      onClick={() => {
                        const shareUrl = selectedArticle.link || window.location.href;
                        if (navigator.share) {
                          navigator.share({
                            title: selectedArticle.title,
                            text: selectedArticle.excerpt,
                            url: shareUrl,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(shareUrl);
                          alert("Link copied to clipboard!");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                      <Share2 size={16} className="text-gray-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Share</span>
                    </button>
                    <button 
                      onClick={(e) => toggleBookmark(selectedArticle.id, e)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                      <Bookmark size={16} className={bookmarkedIds.includes(selectedArticle.id) ? "text-brand-red" : "text-gray-400"} fill={bookmarkedIds.includes(selectedArticle.id) ? "currentColor" : "none"} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${bookmarkedIds.includes(selectedArticle.id) ? "text-brand-red" : "text-gray-400"}`}>
                        {bookmarkedIds.includes(selectedArticle.id) ? 'Saved' : 'Save'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none w-full">
                  <div className="text-gray-300 text-base md:text-lg leading-relaxed space-y-6 font-medium">
                    {selectedArticle.content?.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    )) || selectedArticle.excerpt}
                  </div>
                  
                  {selectedArticle.link && (
                    <div className="mt-12 flex justify-center border-t border-white/5 pt-8">
                      <a 
                        href={selectedArticle.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-brand-red text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-lg flex items-center gap-2"
                      >
                        Read Full Story on Original Site
                      </a>
                    </div>
                  )}
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

