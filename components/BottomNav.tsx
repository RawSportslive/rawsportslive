'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Play, Newspaper, Trophy, User, Search } from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Play, label: 'Videos', href: '/videos' },
  { icon: Newspaper, label: 'News', href: '/news' },
  { icon: Trophy, label: 'Arena', href: '/arena' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080808] border-t border-white/5 px-4 pt-3 pb-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
      <div className="mx-auto max-w-lg flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative group flex flex-col items-center flex-1">
              <div className={`transition-all duration-300 ${isActive ? 'text-brand-red scale-110' : 'text-gray-500 group-hover:text-white'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] uppercase tracking-widest font-black mt-1.5 ${isActive ? 'text-brand-red' : 'text-gray-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -bottom-4 w-12 h-1 bg-brand-red rounded-t-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
