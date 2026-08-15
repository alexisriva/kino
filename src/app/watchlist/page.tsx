'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/Header';
import { WatchlistGrid } from '@/components/WatchlistGrid';
import { AdminModal } from '@/components/AdminModal';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';

function WatchlistContent() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loggingWatchlistItem, setLoggingWatchlistItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        setIsAdmin(data.authenticated);
      } catch (err) {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  const handleLogWatchlistItem = (item: any) => {
    setLoggingWatchlistItem(item);
    setShowAdminModal(true);
  };

  return (
    <div className="min-h-screen bg-[#121315] text-[#e3e2e5] flex flex-col selection:bg-[#f2ca50] selection:text-[#121315]">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        isAdmin={isAdmin}
        onOpenAdminModal={() => {
          setLoggingWatchlistItem(null);
          setShowAdminModal(true);
        }}
        currentView="watchlist"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pb-16">
        <WatchlistGrid
          isAdmin={isAdmin}
          searchQuery={searchQuery}
          onLogReviewFromWatchlist={handleLogWatchlistItem}
        />
      </main>

      {/* Admin Creator / Login / Watchlist Review Modal */}
      {showAdminModal && (
        <AdminModal
          isAdmin={isAdmin}
          watchlistItem={loggingWatchlistItem}
          onClose={() => {
            setShowAdminModal(false);
            setLoggingWatchlistItem(null);
          }}
          onAdminStatusChange={(status) => setIsAdmin(status)}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-[#292a2c] bg-[#0d0e10] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#99907c] font-label">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="KINO Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="font-headline font-extrabold text-[#f2ca50] text-lg tracking-tight">
              KINO
            </span>
            <span>— Personal Cinema & Media Journal</span>
          </div>
          <p className="text-center sm:text-right">
            Curated cinema reviews, docs, & series with anonymous voting and
            social sharing.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121315] flex items-center justify-center text-[#99907c]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#f2ca50]" />
        </div>
      }
    >
      <WatchlistContent />
    </Suspense>
  );
}
