import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import ClientLayout from './client-layout';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'RawSports Live – WWE Videos, Highlights & Roster',
  description: 'Watch the latest WWE matches, replays, highlights, RAW, SmackDown, NXT, and WrestleMania videos. View dynamic rosters, wrestling news, statistics, and trivia.',
  keywords: ['WWE', 'RawSports Live', 'WWE Highlights', 'WWE Replays', 'WrestleMania', 'RAW Matches', 'SmackDown Live', 'NXT', 'Cody Rhodes', 'Roman Reigns', 'Wrestling Trivia', 'WWE Stats'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://rawsportslive.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rawsportslive.vercel.app',
    siteName: 'RawSports Live',
    title: 'RawSports Live – WWE Videos, Highlights & Roster',
    description: 'Watch the latest WWE matches, highlights, RAW, SmackDown, NXT, and WrestleMania videos. View superstar profiles, stats, and climb the trivia leaderboard.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'RawSports Live Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RawSports Live – WWE Videos & Highlights',
    description: 'Watch the latest WWE matches, highlights, RAW, SmackDown, NXT, and WrestleMania videos on RawSports Live.',
    images: ['/logo.png'],
  },
};

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Preconnect to speed up external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* Bulletproof status bar filled red color */}
        <meta name="theme-color" content="#FFBF00" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body suppressHydrationWarning className="bg-brand-black text-[#121212] selection:bg-brand-red selection:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
