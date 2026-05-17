'use client';

import { AuthProvider } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import ContentPreloader from '@/components/ContentPreloader';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

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
