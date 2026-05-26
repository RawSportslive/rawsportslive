'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import ContentPreloader from '@/components/ContentPreloader';
import { usePathname } from 'next/navigation';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const [showSplash, setShowSplash] = useState(true);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Register service worker + request push notification permission
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(console.error);
    }
    // Request permission after 3s to not be too aggressive
    const t = setTimeout(async () => {
      const token = await requestNotificationPermission();
      if (token && auth.currentUser) {
        await setDoc(
          doc(db, `users/${auth.currentUser.uid}/tokens`, token.slice(-20)),
          { token, createdAt: serverTimestamp() },
          { merge: true }
        );
      }
    }, 3000);
    // Listen for foreground push messages and show toast
    const unsub = onForegroundMessage((payload: any) => {
      setToast({
        title: payload.notification?.title || 'RawSports LIVE',
        body: payload.notification?.body || '',
      });
      setTimeout(() => setToast(null), 5000);
    });
    return () => { clearTimeout(t); if (typeof unsub === 'function') unsub(); };
  }, []);

  useEffect(() => {
    // Bulletproof: Prevent double-tap to zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Bulletproof: Prevent pinch to zoom (multi-touch)
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // iOS Safari specific gesture pinch block
    const preventGestureZoom = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    document.addEventListener('touchstart', preventPinchZoom, { passive: false });
    document.addEventListener('gesturestart', preventGestureZoom);

    return () => {
      document.removeEventListener('touchend', preventDoubleTapZoom);
      document.removeEventListener('touchstart', preventPinchZoom);
      document.removeEventListener('gesturestart', preventGestureZoom);
    };
  }, []);

  return (
    <AuthProvider>
      {showSplash && (
        <div className="fixed inset-0 z-[10000] bg-[#0a0a0a] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter drop-shadow-2xl flex items-center">
              <span style={{ color: '#ffffff' }}>RAW</span><span style={{ color: '#E50914' }}>SPORTS</span>
              <span className="not-italic font-black px-1.5 py-0.5 ml-2 rounded tracking-wider" style={{ backgroundColor: '#E50914', color: '#ffffff', fontSize: '10px' }}>LIVE</span>
            </h1>
          </div>
        </div>
      )}

      {/* Foreground notification toast */}
      {toast && (
        <div
          className="fixed top-4 left-4 right-4 z-[9999] flex items-start gap-3 bg-[#FFBF00] text-black rounded-2xl p-4 shadow-2xl"
          style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
          onClick={() => setToast(null)}
        >
          <img src="/logo.png" alt="logo" className="w-9 h-9 rounded-xl flex-shrink-0 object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm uppercase tracking-wide truncate">{toast.title}</p>
            <p className="text-xs text-black/70 mt-0.5 line-clamp-2">{toast.body}</p>
          </div>
        </div>
      )}

      <ContentPreloader />
      <main className={`${isAdminPage ? '' : 'pb-24'} min-h-screen flex flex-col`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        {children}
      </main>
      <BottomNav />
    </AuthProvider>
  );
}
