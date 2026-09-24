"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WatchlistCard } from "./WatchlistCard";
import { WatchedListItem } from "./WatchedListItem";
import { RequestCard } from "./RequestCard";
import { AddWatchlistModal } from "./AddWatchlistModal";
import { RequestMediaModal } from "./RequestMediaModal";
import {
  getWatchlistAction,
  deleteWatchlistItemAction,
} from "@/actions/watchlistActions";
import {
  getWatchRequestsAction,
  acceptWatchRequestAction,
  rejectWatchRequestAction,
} from "@/actions/requestActions";
import {
  BookmarkPlus,
  Film,
  RefreshCw,
  Eye,
  EyeOff,
  Send,
  Inbox,
} from "lucide-react";

interface WatchlistGridProps {
  isAdmin?: boolean;
  onLogReviewFromWatchlist?: (item: any) => void;
}

export function WatchlistGrid({
  isAdmin = false,
  onLogReviewFromWatchlist,
}: WatchlistGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab state derived directly from URL search parameter (single source of truth)
  const tabParam = searchParams.get("tab");
  const isRequestsTab = isAdmin && tabParam === "requests";
  const isWatchedTab = !isRequestsTab && tabParam === "watched";

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState("ALL");

  // Counts
  const [unwatchedCount, setUnwatchedCount] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleTabChange = (tab: "queued" | "watched" | "requests") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "watched") {
      params.set("tab", "watched");
    } else if (tab === "requests") {
      params.set("tab", "requests");
    } else {
      params.delete("tab");
    }
    const query = params.toString();
    router.replace(query ? `/watchlist?${query}` : "/watchlist");
  };

  const loadData = async () => {
    setLoading(true);

    if (isRequestsTab) {
      // Load watch requests for admin
      const reqRes = await getWatchRequestsAction({
        category: activeCategory,
      });

      // Also get watchlist counts to keep tab headers accurate
      const countRes = await getWatchlistAction();

      if (reqRes.success) {
        setItems(reqRes.items || []);
        setRequestsCount(reqRes.totalCount ?? reqRes.items?.length ?? 0);
      }
      if (countRes.success) {
        setUnwatchedCount(countRes.unwatchedCount || 0);
        setWatchedCount(countRes.watchedCount || 0);
        if (countRes.requestsCount !== undefined) {
          setRequestsCount(countRes.requestsCount);
        }
      }
    } else {
      // Load queued or watched watchlist items
      const res = await getWatchlistAction({
        isWatched: isWatchedTab,
        category: activeCategory,
      });

      if (res.success) {
        setItems(res.items || []);
        setUnwatchedCount(res.unwatchedCount || 0);
        setWatchedCount(res.watchedCount || 0);
        if (res.requestsCount !== undefined) {
          setRequestsCount(res.requestsCount);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [isRequestsTab, isWatchedTab, activeCategory, isAdmin]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this watchlist item?"))
      return;
    const res = await deleteWatchlistItemAction(id);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || "Failed to delete item");
    }
  };

  const handleAcceptRequest = async (id: string) => {
    const res = await acceptWatchRequestAction(id);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (id: string) => {
    const res = await rejectWatchRequestAction(id);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || "Failed to reject request");
    }
  };

  return (
    <section className="w-full my-6 sm:my-8 space-y-4 sm:space-y-6">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#1b1c1e] border border-[#292a2c]">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-md bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30 shrink-0">
            <BookmarkPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline text-base sm:text-lg font-bold text-[#e3e2e5]">
              Personal Watchlist
            </h3>
            <p className="text-xs text-[#99907c] font-label">
              Queue upcoming movies and series to watch and review.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Request a Title Button (Available to all visitors and admin) */}
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-[#121315] hover:bg-[#292a2c] text-[#f2ca50] border border-[#f2ca50]/40 font-headline font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" /> Request a Title
          </button>

          {/* Add to Watchlist Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-headline font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <BookmarkPlus className="w-4 h-4" /> Add to Watchlist
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 py-2 border-b border-[#292a2c] font-label">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => handleTabChange("queued")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs font-bold font-headline transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              !isWatchedTab && !isRequestsTab
                ? "bg-[#f2ca50] text-[#121315] shadow-sm"
                : "bg-[#1b1c1e] text-[#99907c] hover:text-white border border-[#292a2c]"
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Queued ({unwatchedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("watched")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs font-bold font-headline transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              isWatchedTab
                ? "bg-[#f2ca50] text-[#121315] shadow-sm"
                : "bg-[#1b1c1e] text-[#99907c] hover:text-white border border-[#292a2c]"
            }`}
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Watched & Logged ({watchedCount})</span>
          </button>

          {/* Requests Tab (Visible only to Admins) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleTabChange("requests")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs font-bold font-headline transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                isRequestsTab
                  ? "bg-[#f2ca50] text-[#121315] shadow-sm"
                  : "bg-[#1b1c1e] text-[#99907c] hover:text-white border border-[#292a2c]"
              }`}
            >
              <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Requests</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isRequestsTab
                    ? "bg-[#121315] text-[#f2ca50]"
                    : requestsCount > 0
                      ? "bg-[#f2ca50] text-[#121315]"
                      : "bg-[#292a2c] text-[#99907c]"
                }`}
              >
                {requestsCount}
              </span>
            </button>
          )}
        </div>

        {/* Media Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All" },
            { id: "MOVIE", label: "Movies" },
            { id: "TV", label: "TV Series" },
            { id: "DOCUMENTARY", label: "Docs" },
            { id: "ANIME", label: "Anime" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold font-headline transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-[#343537] text-[#e3e2e5] border border-[#4d4635]"
                  : "bg-transparent text-[#99907c] hover:text-[#e3e2e5]"
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
          <p className="text-xs font-semibold">
            {isRequestsTab
              ? "Loading Watch Requests..."
              : "Loading Watchlist Items..."}
          </p>
        </div>
      ) : items.length > 0 ? (
        isRequestsTab ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
            {items.map((item) => (
              <RequestCard
                key={item.id}
                item={item}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            ))}
          </div>
        ) : isWatchedTab ? (
          <div className="divide-y divide-[#292a2c] rounded-lg bg-[#1b1c1e] border border-[#292a2c] overflow-hidden">
            {items.map((item) => (
              <WatchedListItem
                key={item.id}
                item={item}
                isAdmin={isAdmin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
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
        )
      ) : (
        <div className="w-full p-8 sm:p-12 text-center rounded-lg bg-[#1b1c1e] border border-[#292a2c] my-6 sm:my-8 font-label">
          {isRequestsTab ? (
            <Inbox className="w-12 h-12 text-[#99907c] mx-auto mb-3 stroke-[1.5]" />
          ) : (
            <Film className="w-12 h-12 text-[#99907c] mx-auto mb-3 stroke-[1.5]" />
          )}
          <h3 className="text-lg font-bold text-[#e3e2e5]">
            {isRequestsTab
              ? "No Pending Watch Requests"
              : isWatchedTab
                ? "No Watched Items Found"
                : "No Queued Items Found"}
          </h3>
          <p className="text-xs text-[#99907c] mt-1 max-w-sm mx-auto">
            {isRequestsTab
              ? "Viewer requests will appear here for you to accept into your watchlist queue or reject."
              : isWatchedTab
                ? "Items marked as watched or reviewed will appear here."
                : "Add upcoming movies, series, or docs to your watchlist using the Add button above."}
          </p>
        </div>
      )}

      {/* Add to Watchlist Modal (Admin Only) */}
      {showAddModal && (
        <AddWatchlistModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => loadData()}
        />
      )}

      {/* Request Media Modal (Available to all) */}
      {showRequestModal && (
        <RequestMediaModal
          onClose={() => setShowRequestModal(false)}
          onRequestSubmitted={() => loadData()}
        />
      )}
    </section>
  );
}
