import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'RawSports Live – WWE Videos & Highlights',
  description: 'Watch the latest WWE matches, highlights, RAW, SmackDown, and WrestleMania videos on RawSports Live.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'RawSports Live',
    description: 'The ultimate WWE video streaming experience.',
    images: ['/logo.png'],
  },
};

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="bg-brand-black text-white selection:bg-brand-red selection:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
