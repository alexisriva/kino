"use client";

import { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/Header";
import { WatchlistGrid } from "@/components/WatchlistGrid";
import { AdminModal } from "@/components/AdminModal";
import { RefreshCw } from "lucide-react";

function WatchlistContent() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loggingWatchlistItem, setLoggingWatchlistItem] = useState<any>(null);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/check");
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
    <div className="flex-1 flex flex-col bg-[#121315] text-[#e3e2e5] selection:bg-[#f2ca50] selection:text-[#121315]">
      {/* Top Header */}
      <Header
        isAdmin={isAdmin}
        onAdminStatusChange={(status) => setIsAdmin(status)}
        onOpenAdminModal={() => {
          if (!isAdmin) {
            setLoggingWatchlistItem(null);
            setShowAdminModal(true);
          }
        }}
        currentView="watchlist"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pb-16">
        <WatchlistGrid
          isAdmin={isAdmin}
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
