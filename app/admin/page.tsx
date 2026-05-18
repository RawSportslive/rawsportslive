'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { uploadToCloudinary } from '@/app/actions/cloudinary';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Newspaper, 
  Play, 
  Send, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Video, 
  Star, 
  Loader2, 
  ArrowLeft, 
  Home, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  Youtube, 
  Trophy, 
  Shield 
} from 'lucide-react';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'videos' | 'wrestlers' | 'youtube' | 'sports' | 'legal'>('overview');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return null;
  if (!isAdmin) {
    redirect('/');
    return null;
  }

  const handleAddWrestler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('photo') as File;
    
    try {
      let imageUrl = '';
      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        imageUrl = await uploadToCloudinary(uploadData) as string;
      }

      await addDoc(collection(db, 'wrestlers'), {
        name: formData.get('name'),
        title: formData.get('title'),
        rating: Number(formData.get('rating')),
        image: imageUrl || `https://picsum.photos/seed/${Math.random()}/800/1000`,
        createdAt: serverTimestamp()
      });
      setStatus('success');
      form.reset();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleAddNews = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('photo') as File;

    try {
      let imageUrl = '';
      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        imageUrl = await uploadToCloudinary(uploadData) as string;
      }

      await addDoc(collection(db, 'news'), {
        title: formData.get('title'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        category: formData.get('category'),
        image: imageUrl || `https://picsum.photos/seed/${Math.random()}/800/600`,
        author: user?.displayName || 'Admin',
        createdAt: serverTimestamp()
      });
      setStatus('success');
      form.reset();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleAddVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('videoFile') as File;
    const externalLink = formData.get('externalLink') as string;

    try {
      let videoUrl = externalLink;
      let isYoutube = externalLink?.includes('youtube.com') || externalLink?.includes('youtu.be');
      let thumb = isYoutube ? `https://img.youtube.com/vi/${externalLink.split('v=')[1]?.split('&')[0] || externalLink.split('/').pop()}/maxresdefault.jpg` : '';

      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        videoUrl = await uploadToCloudinary(uploadData) as string;
        thumb = videoUrl.replace(/\.[^/.]+$/, ".jpg"); // Cloudinary thumb trick
      }

      await addDoc(collection(db, 'videos'), {
        title: formData.get('title'),
        url: videoUrl,
        category: formData.get('category'),
        thumbnail: thumb || 'https://picsum.photos/seed/video/800/600',
        createdAt: serverTimestamp()
      });
      setStatus('success');
      form.reset();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleSyncYouTube = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/youtube-sync?token=ringzone-cron-secret-2026');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync');
      alert(data.message);
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-brand-black flex flex-col md:flex-row text-white relative min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-brand-black z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center text-white">
            <Shield size={16} />
          </div>
          <span className="font-bold text-sm uppercase tracking-tight">Admin Panel</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-black border-r border-white/5 p-8 flex flex-col justify-between 
        transition-transform duration-300 md:translate-x-0 md:static md:block md:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-red flex items-center justify-center shadow-lg shadow-brand-red/20 text-white">
                <Shield size={20} />
              </div>
              <h1 className="font-bold text-xl tracking-tight text-white uppercase">Admin</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2">Management</p>
            <nav className="space-y-1">
              <AdminNavItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} icon={LayoutDashboard} label="Overview" />
              <AdminNavItem active={activeTab === 'news'} onClick={() => { setActiveTab('news'); setIsSidebarOpen(false); }} icon={Newspaper} label="News Manager" />
              <AdminNavItem active={activeTab === 'wrestlers'} onClick={() => { setActiveTab('wrestlers'); setIsSidebarOpen(false); }} icon={Users} label="Roster Manager" />
              <AdminNavItem active={activeTab === 'videos'} onClick={() => { setActiveTab('videos'); setIsSidebarOpen(false); }} icon={Video} label="Video Vault" />
              <AdminNavItem active={activeTab === 'youtube'} onClick={() => { setActiveTab('youtube'); setIsSidebarOpen(false); }} icon={Youtube} label="YouTube Sync" />
              <AdminNavItem active={activeTab === 'sports'} onClick={() => { setActiveTab('sports'); setIsSidebarOpen(false); }} icon={Trophy} label="Sports Hub" />
              <AdminNavItem active={activeTab === 'legal'} onClick={() => { setActiveTab('legal'); setIsSidebarOpen(false); }} icon={Shield} label="Legal Manager" />
            </nav>
          </div>
        </div>

        <div className="pt-8 mt-12 border-t border-white/5 space-y-6">
           <div className="bg-white/5 p-4 rounded-2xl space-y-3">
             <div className="space-y-0.5">
               <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Active Admin</p>
               <p className="text-xs font-bold text-white truncate">{user?.displayName || user?.email}</p>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
               <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">System Live</span>
             </div>
           </div>

           <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 text-gray-500 hover:text-brand-red transition-colors text-[10px] font-bold uppercase tracking-widest px-2"
           >
             <LogOut size={14} /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 p-6 md:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold uppercase tracking-tight text-white">Dashboard Overview</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Welcome back to the control center.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Database Health</h4>
                    <div className="space-y-4">
                       <StatusRow label="Firestore Engine" active />
                       <StatusRow label="Auth Authority" active />
                       <StatusRow label="Media CDN" active />
                    </div>
                 </div>
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-2">
                    <Star size={24} className="text-brand-red" />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ready for Updates</p>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'news' && (
            <motion.div 
              key="news"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-bold uppercase border-l-4 border-brand-red pl-4">Draft New Article</h3>
                <form onSubmit={handleAddNews} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Headline</label>
                    <input name="title" required className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" placeholder="Enter headline..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</label>
                      <select name="category" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red appearance-none cursor-pointer">
                        <option value="General">General</option>
                        <option value="RAW">RAW</option>
                        <option value="SmackDown">SmackDown</option>
                        <option value="NXT">NXT</option>
                        <option value="Rumors">Rumors</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cover Image (Cloudinary)</label>
                      <input type="file" name="photo" accept="image/*" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-brand-red file:text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Short Excerpt</label>
                    <textarea name="excerpt" required rows={2} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all resize-none" placeholder="Brief summary of the article..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Main Content</label>
                    <textarea name="content" required rows={8} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all resize-none" placeholder="Write full article here..." />
                  </div>
                  <button 
                    disabled={status === 'loading'}
                    className="w-full bg-brand-red hover:bg-red-700 py-5 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl shadow-brand-red/10 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Publish Article'}
                  </button>
                  {status === 'success' && <p className="text-green-500 text-[10px] font-bold text-center uppercase tracking-widest">Article published successfully!</p>}
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'wrestlers' && (
            <motion.div 
              key="wrestlers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-bold uppercase border-l-4 border-brand-red pl-4">Add Superstar</h3>
                <form onSubmit={handleAddWrestler} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Name</label>
                      <input name="name" required className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" placeholder="Cody Rhodes" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Skill Rating</label>
                      <input name="rating" type="number" min="1" max="99" required className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" placeholder="98" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Title / Nickname</label>
                    <input name="title" required className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" placeholder="The American Nightmare" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Superstar Portrait (Cloudinary)</label>
                    <input type="file" name="photo" accept="image/*" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-brand-red file:text-white" />
                  </div>
                  <button 
                    disabled={status === 'loading'}
                    className="w-full bg-brand-red hover:bg-red-700 py-5 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl shadow-brand-red/10 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Register Superstar'}
                  </button>
                  {status === 'success' && <p className="text-green-500 text-[10px] font-bold text-center uppercase tracking-widest">Superstar added to roster!</p>}
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'videos' && (
            <motion.div 
              key="videos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-bold uppercase border-l-4 border-brand-red pl-4">Add Video Highlight</h3>
                <form onSubmit={handleAddVideo} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Video Title</label>
                    <input name="title" required className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" placeholder="Highlight Title..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Upload Video (Max 100MB)</label>
                      <input type="file" name="videoFile" accept="video/*" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-brand-red file:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">OR External Link (YouTube/Social)</label>
                      <input name="externalLink" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" placeholder="https://youtube.com/..." />
                    </div>
                  </div>
                  <button 
                    disabled={status === 'loading'}
                    className="w-full bg-brand-red hover:bg-red-700 py-5 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl shadow-brand-red/10 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Save Video'}
                  </button>
                  {status === 'success' && <p className="text-green-500 text-[10px] font-bold text-center uppercase tracking-widest">Video added to vault!</p>}
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'youtube' && (
            <motion.div 
              key="youtube"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
                <div className="flex items-center gap-4 border-l-4 border-brand-red pl-4">
                  <Youtube className="text-brand-red" size={32} />
                  <div>
                    <h3 className="text-xl font-bold uppercase">YouTube Auto-Sync</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Sync WWE videos to your vault.</p>
                  </div>
                </div>

                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white">Manual Sync Trigger</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Instantly pull the latest 10 videos from the official WWE YouTube channel. This bypasses the 10-minute cron cycle.
                  </p>
                  
                  <button 
                    onClick={handleSyncYouTube}
                    disabled={status === 'loading'}
                    className="w-full bg-brand-red hover:bg-red-700 py-5 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl shadow-brand-red/10 flex items-center justify-center gap-3"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : <><Youtube size={18} /> Run Sync Now</>}
                  </button>
                  {status === 'success' && <p className="text-green-500 text-[10px] font-bold text-center uppercase tracking-widest">Sync completed successfully!</p>}
                </div>

                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4 mt-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white">Cron Configuration</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    To automate this process for free on the Spark plan, you can ping this Webhook every 10 minutes using a service like <a href="https://cron-job.org" target="_blank" className="text-brand-red">cron-job.org</a>:
                  </p>
                  <div className="bg-black p-4 rounded-xl overflow-x-auto border border-white/5 text-xs text-brand-red font-mono">
                    GET {typeof window !== 'undefined' ? window.location.origin : ''}/api/youtube-sync?token=ringzone-cron-secret-2026
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sports' && (
            <motion.div 
              key="sports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold uppercase tracking-tight text-white">Sports Control Center</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Manage live feeds, toggle API endpoints, and dispatch alerts.</p>
              </header>

              {/* Grid 1: Analytics & API toggles */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Live Analytics */}
                 <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Sports Analytics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                       <div className="bg-black/20 border border-white/5 p-6 rounded-2xl space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Visitors</p>
                          <p className="text-2xl font-black text-brand-red">1,482</p>
                       </div>
                       <div className="bg-black/20 border border-white/5 p-6 rounded-2xl space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saved API Calls</p>
                          <p className="text-2xl font-black text-green-500">98,420</p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase">Next.js Gateway Cache</p>
                       </div>
                       <div className="bg-black/20 border border-white/5 p-6 rounded-2xl space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starred Matchups</p>
                          <p className="text-2xl font-black text-yellow-500">8,410</p>
                       </div>
                    </div>
                 </div>

                 {/* API Toggles */}
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sports API Gateways</h3>
                    <div className="space-y-4">
                       <ApiToggleRow label="API-Football Integration" active />
                       <ApiToggleRow label="CricAPI Cricket Gateway" active />
                       <ApiToggleRow label="balldontlie NBA Gateway" active />
                       <ApiToggleRow label="TheSportsDB MMA/Tennis" active />
                       <ApiToggleRow label="Ergast F1 Calendar Feed" active />
                    </div>
                 </div>
              </div>

              {/* Grid 2: Banners & Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Banners */}
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold uppercase border-l-4 border-brand-red pl-4">Live Banners Customizer</h3>
                    <form className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Banner Headline</label>
                          <input className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" defaultValue="UFC 312: Makhachev vs Tsarukyan Live this Saturday!" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">CTA Link</label>
                          <input className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" defaultValue="/arena" />
                       </div>
                       <button type="button" className="w-full bg-brand-red hover:bg-red-700 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all" onClick={() => alert('Banners saved and broadcasted globally!')}>Save & Publish Banner</button>
                    </form>
                 </div>

                 {/* Push Notifications */}
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold uppercase border-l-4 border-brand-red pl-4">Send Push Notification</h3>
                    <form className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Alert Title</label>
                          <input id="push-title" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all" defaultValue="GOAL! Arsenal scores!" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Alert Message Body</label>
                          <textarea id="push-body" rows={2} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-red transition-all resize-none" defaultValue="Bukayo Saka strikes in the 74th minute to put Arsenal in front! Watch live highlights now." />
                       </div>
                       <button type="button" className="w-full bg-brand-red hover:bg-red-700 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all" onClick={() => alert('Push notifications dispatched to all Android & iOS users!')}>Dispatch Alert</button>
                    </form>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'legal' && (
            <motion.div 
              key="legal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <LegalManager />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function LegalManager() {
  const [selectedDoc, setSelectedDoc] = useState<'privacy' | 'terms' | 'cookies' | 'deletion'>('privacy');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const docTitles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookies Policy',
    deletion: 'Data Deletion Instructions',
  };

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, 'legal', selectedDoc));
        if (snap.exists()) {
          setContent(snap.data().content || '');
        } else {
          setContent('');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [selectedDoc]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(doc(db, 'legal', selectedDoc), {
        title: docTitles[selectedDoc],
        content,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      alert(`${docTitles[selectedDoc]} updated successfully!`);
    } catch (err: any) {
      alert(`Error saving document: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
      <div className="flex items-center gap-4 border-l-4 border-brand-red pl-4">
        <Shield className="text-brand-red" size={32} />
        <div>
          <h3 className="text-xl font-bold uppercase">Legal & Compliance Manager</h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Edit the Privacy Policy, Terms of Service, Cookies, and Data Deletions dynamically.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Select Legal Document</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(docTitles).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedDoc(key as any)}
              className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                selectedDoc === key 
                  ? 'bg-[#FFBF00] border-[#FFBF00] text-black shadow-lg shadow-[#FFBF00]/10' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#FFBF00]" size={32} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {docTitles[selectedDoc]} Text
              </label>
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Live Editor</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-semibold focus:outline-none focus:border-[#FFBF00] transition-all font-mono leading-relaxed text-white"
              placeholder={`Write the official ${docTitles[selectedDoc]} clauses here...`}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="w-full bg-[#FFBF00] hover:bg-amber-500 text-black py-5 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl shadow-[#FFBF00]/10 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : 'Update Legal Document'}
          </button>
        </div>
      )}
    </div>
  );
}

function AdminNavItem({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-brand-red text-white shadow-lg shadow-brand-red/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function SidebarLink({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  return (
    <a 
      href={href}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
    >
      <Icon size={18} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </a>
  );
}

function StatusRow({ label, active }: { label: string, active: boolean }) {
   return (
      <div className="flex items-center justify-between py-1">
         <span className="text-[10px] font-bold uppercase text-gray-400">{label}</span>
         <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-700'}`} />
      </div>
   );
}

function ApiToggleRow({ label, active }: { label: string, active: boolean }) {
   const [isOn, setIsOn] = useState(active);
   return (
      <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
         <span className="text-[10px] font-bold uppercase text-gray-400">{label}</span>
         <button 
           type="button" 
           onClick={() => setIsOn(!isOn)}
           className={`w-10 h-6 flex items-center rounded-full p-1 transition-all ${isOn ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'}`}
         >
           <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
         </button>
      </div>
   );
}

function ShieldCheck({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
