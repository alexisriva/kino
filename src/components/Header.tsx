'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Search } from 'lucide-react';

interface HeaderProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
}

export function Header({
  activeCategory = 'ALL',
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
  isAdmin = false,
  onOpenAdminModal,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#121315]/95 backdrop-blur-md border-b border-[#292a2c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* KINO Brand Title */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-[#f2ca50] group-hover:text-[#e9c349] transition-colors">
            KINO
          </span>
        </Link>

        {/* Search & Admin Control */}
        <div className="flex items-center gap-4">
          {onSearchChange && (
            <div className="relative w-48 sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99907c]" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1b1c1e] border border-[#292a2c] text-xs text-[#e3e2e5] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]/60 transition-colors font-label"
              />
            </div>
          )}

          {isAdmin ? (
            <button
              onClick={() => onOpenAdminModal && onOpenAdminModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/40 hover:bg-[#f2ca50]/20 text-xs font-bold font-headline transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Mode</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAdminModal && onOpenAdminModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1b1c1e] hover:bg-[#292a2c] text-[#c6c6c9] border border-[#292a2c] text-xs font-semibold font-headline transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
