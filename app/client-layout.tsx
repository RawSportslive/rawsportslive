'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import ContentPreloader from '@/components/ContentPreloader';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
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
        <div className="fixed inset-0 z-[10000] bg-[#FFBF00] flex items-center justify-center">
          <h1 className="text-black text-4xl md:text-6xl font-black italic tracking-tighter">
            RAW<span className="text-white">SPORTS</span> <span className="text-white text-xl md:text-3xl align-top ml-1 not-italic">LIVE</span>
          </h1>
        </div>
      )}
      <ContentPreloader />
      <main className={`${isAdminPage ? '' : 'pb-24'} min-h-screen flex flex-col`}>
        {children}
      </main>
      <BottomNav />
    </AuthProvider>
  );
}
