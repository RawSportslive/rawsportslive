'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { 
  signInWithPopup,
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { uploadToCloudinary } from '@/app/actions/cloudinary';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Settings, Award, Bookmark, Play, Star, ShieldCheck, Mail, Lock, User as UserIcon, Loader2, ArrowRight, Camera, BookmarkCheck } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function ProfilePage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<'main' | 'history' | 'saved' | 'achievements' | 'settings'>('main');
  const [history, setHistory] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    if (user && view !== 'main') {
      const fetchData = async () => {
        const histSnap = await getDocs(query(collection(db, `users/${user.uid}/history`), orderBy('timestamp', 'desc'), limit(15)));
        const savedSnap = await getDocs(query(collection(db, `users/${user.uid}/bookmarks`), orderBy('timestamp', 'desc')));
        setHistory(histSnap.docs.map(doc => doc.data()));
        setSaved(savedSnap.docs.map(doc => doc.data()));
      };
      fetchData();
    }
  }, [user, view]);

  // Initial count fetch
  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        const histSnap = await getDocs(collection(db, `users/${user.uid}/history`));
        const savedSnap = await getDocs(collection(db, `users/${user.uid}/bookmarks`));
        setHistory(histSnap.docs.map(doc => doc.data()));
        setSaved(savedSnap.docs.map(doc => doc.data()));
      };
      fetchCounts();
    }
  }, [user]);

  const handleHistoryClick = (item: any) => {
    if (!item.url) return;
    localStorage.setItem('ringzone_resume', JSON.stringify({
      url: item.url,
      title: item.title,
      thumbnail: item.thumbnail || item.image || '',
      lastPosition: item.lastPosition || 0,
    }));
    router.push('/videos');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const photoURL = await uploadToCloudinary(formData) as string;
      await updateProfile(user, { photoURL });
      window.location.reload();
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pb-32 bg-brand-black animate-pulse">
      <header className="relative pt-16 pb-8 flex flex-col items-center justify-center px-6 border-b border-white/5">
        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10" />
        <div className="mt-6 space-y-2 w-1/3">
          <div className="h-5 bg-white/10 rounded-lg w-full" />
          <div className="h-3 bg-white/5 rounded-md w-1/2 mx-auto" />
        </div>
      </header>
    </div>
  );

  if (!user) {
    return <AuthFlow isLogin={isLogin} setIsLogin={setIsLogin} />;
  }

  return (
    <div className="min-h-screen pb-32 bg-brand-black">
      <AnimatePresence mode="wait">
        {view === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <header className="relative pt-16 pb-8 flex flex-col items-center justify-center px-6 border-b border-white/5">
              <div className="absolute inset-0 bg-brand-red/5 blur-[120px] -z-10" />
              
              <div className="relative group">
                <label className="cursor-pointer block">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  <div className="w-24 h-24 rounded-3xl p-1 bg-white/5 border border-white/10 overflow-hidden relative">
                    <div className="w-full h-full rounded-2xl bg-brand-black flex items-center justify-center overflow-hidden border border-white/5">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-brand-red animate-spin" />
                      ) : user.photoURL ? (
                        <Image src={user.photoURL} alt={user.displayName || 'User'} fill className="object-cover" unoptimized={true} />
                      ) : (
                        <UserIcon size={32} className="text-gray-700" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="text-white" size={20} />
                    </div>
                  </div>
                </label>
                
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 bg-brand-red text-white p-1.5 rounded-lg shadow-2xl border-2 border-brand-black">
                    <ShieldCheck size={12} />
                  </div>
                )}
              </div>

              <div className="mt-6 text-center space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {user.displayName || user.email?.split('@')[0] || 'Superstar'}
                </h2>
                <p className="text-gray-500 font-bold text-[9px] uppercase tracking-[0.3em]">
                  PRO COMPETITOR • EST. 2024
                </p>
              </div>

              <div className="absolute top-10 right-6">
                <button 
                  onClick={() => signOut(auth)} 
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-red hover:bg-white/10 transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </header>

            <section className="px-8 grid grid-cols-2 gap-3 -mt-5 relative z-10">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-center space-y-0.5 shadow-2xl">
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">RZ POINTS</p>
                <p className="text-xl font-bold text-white">{history.length * 10 + saved.length * 5}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-center space-y-0.5 shadow-2xl">
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">RANK</p>
                <p className="text-xl font-bold text-brand-red">#{Math.max(1, 100 - history.length)}</p>
              </div>
            </section>

            <section className="mt-16 px-6 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold uppercase text-sm tracking-widest text-white flex items-center gap-2">
                  <Star size={18} className="text-brand-red" />
                  Arena Profile
                </h3>
                <button onClick={() => setView('settings')} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Edit Profile</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <ProfileLink icon={Award} label="My Achievements" onClick={() => setView('achievements')} count={Math.floor(history.length / 2)} />
                <ProfileLink icon={Bookmark} label="Saved Reports" onClick={() => setView('saved')} count={saved.length} />
                <ProfileLink icon={Play} label="Watch History" onClick={() => setView('history')} count={history.length} />
                {isAdmin && (
                   <ProfileLink icon={ShieldCheck} label="Admin Dashboard" href="/admin" highlight />
                )}
                <ProfileLink icon={Settings} label="Global Settings" onClick={() => setView('settings')} />
              </div>
            </section>
          </motion.div>
        )}

        {(view === 'history' || view === 'saved' || view === 'achievements') && (
          <motion.div 
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-6 pt-20 space-y-8"
          >
            <div className="flex items-center gap-4">
               <button onClick={() => setView('main')} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-brand-red transition-all">
                 <ArrowRight className="rotate-180" size={20} />
               </button>
               <h3 className="text-2xl font-bold uppercase tracking-tight">
                 {view === 'history' ? 'Watch History' : view === 'saved' ? 'Saved Reports' : 'Achievements'}
               </h3>
            </div>
            
            <div className="space-y-4">
              {view === 'achievements' ? (
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-brand-red flex items-center justify-center shadow-xl shadow-brand-red/20">
                      <Award size={32} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">Arena Veteran</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Watch 10 matches</p>
                      <div className="mt-3 w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-red" style={{ width: `${Math.min(100, (history.length / 10) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                (view === 'history' ? history : saved).map((item: any, i: number) => (
                   <div key={i} onClick={() => handleHistoryClick(item)} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-brand-red transition-all relative overflow-hidden cursor-pointer active:scale-95">
                    <div className="w-16 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center overflow-hidden border border-white/5 flex-shrink-0">
                      {item.image || item.thumbnail ? (
                        <img src={item.image || item.thumbnail} className="w-full h-full object-cover" />
                      ) : (
                        <Play size={16} className="text-brand-red" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-white">{item.title}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        {item.lastPosition ? `Stopped at ${Math.floor(item.lastPosition / 60)}m ${item.lastPosition % 60}s` : (item.category || 'Replay')}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-gray-600 flex-shrink-0" />
                    {/* Resume progress bar */}
                    {item.lastPosition && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                        <div className="h-full bg-brand-red" style={{ width: '40%' }} />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {(view !== 'achievements' && (view === 'history' ? history : saved).length === 0) && (
                <div className="text-center py-20 text-gray-700 font-bold uppercase text-[10px] tracking-widest">No activity found yet.</div>
              )}
            </div>
          </motion.div>
        )}
        {view === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-6 pt-20 space-y-8"
          >
            <div className="flex items-center gap-4">
               <button onClick={() => setView('main')} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-brand-red transition-all">
                 <ArrowRight className="rotate-180" size={20} />
               </button>
               <h3 className="text-2xl font-bold uppercase tracking-tight">Global Settings</h3>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newName = formData.get('displayName') as string;
                if (!user || !newName) return;
                
                try {
                  setUploading(true);
                  await updateProfile(user, { displayName: newName });
                  alert("Profile updated successfully!");
                  setView('main');
                } catch (error: any) {
                  alert(error.message);
                } finally {
                  setUploading(false);
                }
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Account Name</label>
                <input 
                  name="displayName"
                  defaultValue={user.displayName || ''}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-brand-red transition-all text-white" 
                  placeholder="ENTER NEW NAME..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Connected Email</label>
                <div className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-gray-600 cursor-not-allowed">
                  {user.email}
                </div>
              </div>

              <button 
                disabled={uploading}
                className="w-full bg-brand-red hover:bg-red-700 text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE CHANGES'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ProfileLink({ icon: Icon, label, count, href = "#", highlight = false, onClick }: any) {
  const content = (
    <>
      <div className="flex items-center gap-4">
        <Icon size={20} className={highlight ? 'text-white' : 'text-gray-500 group-hover:text-brand-red transition-colors'} />
        <span className="font-bold uppercase text-xs tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {count !== undefined && <span className="bg-black/20 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-400">{count}</span>}
        <ArrowRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
      </div>
    </>
  );

  const className = `flex items-center justify-between p-5 rounded-2xl transition-all group w-full text-left ${highlight ? 'bg-brand-red text-white' : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <a href={href} className={className}>
      {content}
    </a>
  );
}

function AuthFlow({ isLogin, setIsLogin }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Google Authentication failed. Please try again.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // If it's a username (no @), we append our domain behind the scenes
    const email = username.includes('@') ? username : `${username.toLowerCase().trim()}@ringzone.com`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name to username for new signups
        await updateProfile(userCredential.user, {
          displayName: username.split('@')[0]
        });
      }
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMsg(error.message.includes('auth/user-not-found') ? 'Competitor not found.' : 'Invalid credentials.');
    } finally {
      if (status !== 'error') setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-8 py-12 bg-brand-black">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto w-full space-y-12"
      >
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white">
            {isLogin ? 'SIGN IN' : 'JOIN THE'} <span className="text-brand-red">ZONE</span>
          </h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em]">Premium Wrestling Experience</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="text" 
                placeholder="USERNAME" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-brand-red transition-all text-white placeholder:text-gray-700" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="password" 
                placeholder="PASSWORD" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-brand-red transition-all text-white placeholder:text-gray-700" 
              />
            </div>
          </div>

          {status === 'error' && <p className="text-brand-red text-[10px] font-bold text-center uppercase tracking-widest">{errorMsg}</p>}

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-brand-red hover:bg-red-700 text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              isLogin ? 'ENTER ARENA' : 'START JOURNEY'
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-white/5 flex-1" />
          <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">OR</span>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        <button 
          onClick={handleGoogleAuth}
          className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all text-white"
        >
          <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} height={18} alt="Google" />
          Google Account
        </button>

        <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-4">
          {isLogin ? "NEW COMPETITOR?" : "ALREADY A MEMBER?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-red hover:text-red-400 font-bold ml-1 transition-colors"
          >
            {isLogin ? 'JOIN NOW' : 'SIGN IN'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

