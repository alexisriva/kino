'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WatchlistCard } from './WatchlistCard';
import { AddWatchlistModal } from './AddWatchlistModal';
import {
  getWatchlistAction,
  deleteWatchlistItemAction,
} from '@/actions/watchlistActions';
import { BookmarkPlus, Film, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface WatchlistGridProps {
  isAdmin?: boolean;
  searchQuery?: string;
  onLogReviewFromWatchlist?: (item: any) => void;
}

export function WatchlistGrid({
  isAdmin = false,
  searchQuery = '',
  onLogReviewFromWatchlist,
}: WatchlistGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab state derived directly from URL search parameter (single source of truth)
  const tabParam = searchParams.get('tab');
  const isWatchedTab = tabParam === 'watched';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Counts
  const [unwatchedCount, setUnwatchedCount] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);

  const handleTabChange = (watched: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (watched) {
      params.set('tab', 'watched');
    } else {
      params.delete('tab');
    }
    const query = params.toString();
    router.replace(query ? `/watchlist?${query}` : '/watchlist');
  };

  const loadWatchlist = async () => {
    setLoading(true);
    const res = await getWatchlistAction({
      isWatched: isWatchedTab,
      category: activeCategory,
      search: searchQuery,
    });

    if (res.success) {
      setItems(res.items || []);
      setUnwatchedCount(res.unwatchedCount || 0);
      setWatchedCount(res.watchedCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWatchlist();
  }, [isWatchedTab, activeCategory, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this watchlist item?')) return;
    const res = await deleteWatchlistItemAction(id);
    if (res.success) {
      loadWatchlist();
    } else {
      alert(res.error || 'Failed to delete item');
    }
  };

  return (
    <section className="w-full my-8 space-y-6">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#1b1c1e] border border-[#292a2c]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30">
            <BookmarkPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-[#e3e2e5]">Personal Media Watchlist</h3>
            <p className="text-xs text-[#99907c] font-label">
              Queue upcoming films and series to watch, review, and mark as completed.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-headline font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <BookmarkPlus className="w-4 h-4" /> Add to Watchlist
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-[#292a2c] font-label">
        {/* Watched vs Unwatched Status Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold font-headline transition-all cursor-pointer ${
              !isWatchedTab
                ? 'bg-[#f2ca50] text-[#121315] shadow-sm'
                : 'bg-[#1b1c1e] text-[#99907c] hover:text-white border border-[#292a2c]'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>Queued ({unwatchedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold font-headline transition-all cursor-pointer ${
              isWatchedTab
                ? 'bg-[#f2ca50] text-[#121315] shadow-sm'
                : 'bg-[#1b1c1e] text-[#99907c] hover:text-white border border-[#292a2c]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Watched & Logged ({watchedCount})</span>
          </button>
        </div>

        {/* Media Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'MOVIE', label: 'Movies' },
            { id: 'TV', label: 'TV Series' },
            { id: 'DOCUMENTARY', label: 'Docs' },
            { id: 'ANIME', label: 'Anime' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold font-headline transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#343537] text-[#e3e2e5] border border-[#4d4635]'
                  : 'bg-transparent text-[#99907c] hover:text-[#e3e2e5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="w-full py-24 flex flex-col items-center justify-center space-y-3 text-[#99907c] font-label">
          <RefreshCw className="w-8 h-8 animate-spin text-[#f2ca50]" />
          <p className="text-xs font-semibold">Loading Watchlist Items...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onLogReview={onLogReviewFromWatchlist}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="w-full p-12 text-center rounded-lg bg-[#1b1c1e] border border-[#292a2c] my-8 font-label">
          <Film className="w-12 h-12 text-[#99907c] mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-[#e3e2e5]">
            No {isWatchedTab ? 'Watched' : 'Queued'} Items Found
          </h3>
          <p className="text-xs text-[#99907c] mt-1 max-w-sm mx-auto">
            {isWatchedTab
              ? 'Items marked as watched or reviewed will appear here.'
              : 'Add upcoming movies, series, or docs to your watchlist using the Add button above.'}
          </p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddWatchlistModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => loadWatchlist()}
        />
      )}
    </section>
  );
}
