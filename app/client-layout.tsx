'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import ContentPreloader from '@/components/ContentPreloader';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

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
      <ContentPreloader />
      <main className={`${isAdminPage ? '' : 'pb-24'} min-h-screen flex flex-col`}>
        {children}
      </main>
      <BottomNav />
    </AuthProvider>
  );
}
