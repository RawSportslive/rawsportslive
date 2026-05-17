'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  href?: string;
}

export default function SectionHeader({ title, icon: Icon, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-red/10 text-brand-red">
          <Icon size={18} />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-tight">
          {title}
        </h2>

      </div>
      {href && (
        <Link 
          href={href} 
          className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-brand-red transition-colors"
        >
          View All
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
