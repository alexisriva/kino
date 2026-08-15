"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { MediaGrid } from "@/components/MediaGrid";
import { WatchlistGrid } from "@/components/WatchlistGrid";
import { AdminModal } from "@/components/AdminModal";
import { getPostsAction, deletePostAction } from "@/actions/postActions";
import { Plus, Sparkles, RefreshCw } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive currentView from URL search parameter (single source of truth)
  const viewParam = searchParams.get("view");
  const currentView: "journal" | "watchlist" = viewParam === "watchlist" ? "watchlist" : "journal";

  const handleViewChange = (newView: "journal" | "watchlist") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newView === "journal") {
      params.delete("view");
      params.delete("tab");
      router.replace("/");
    } else {
      params.set("view", "watchlist");
      if (!params.get("tab")) {
        params.set("tab", "queued");
      }
      router.replace(`/?${params.toString()}`);
    }
  };

  // Filters
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [activeSort, setActiveSort] = useState("latest");

  // Admin & Modals
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [loggingWatchlistItem, setLoggingWatchlistItem] = useState<any>(null);

  // Fetch posts from database Server Action
  const loadPosts = async () => {
    setLoading(true);
    const res = await getPostsAction({
      category: activeCategory,
      search: searchQuery,
      tag: selectedTag,
      sort: activeSort,
    });
    if (res.success) {
      setPosts(res.posts || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, [activeCategory, searchQuery, selectedTag, activeSort]);

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

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setLoggingWatchlistItem(null);
    setShowAdminModal(true);
  };

  const handleLogWatchlistItem = (item: any) => {
    setLoggingWatchlistItem(item);
    setEditingPost(null);
    setShowAdminModal(true);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    const res = await deletePostAction(id);
    if (res.success) {
      loadPosts();
    } else {
      alert(res.error || "Failed to delete post");
    }
  };

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];

  return (
    <div className="min-h-screen bg-[#121315] text-[#e3e2e5] flex flex-col selection:bg-[#f2ca50] selection:text-[#121315]">
      {/* Top Header */}
      <Header
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        isAdmin={isAdmin}
        onOpenAdminModal={() => {
          setEditingPost(null);
          setLoggingWatchlistItem(null);
          setShowAdminModal(true);
        }}
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pb-16">
        {/* Admin Quick Action Floating Bar (only shown on Journal Feed view) */}
        {isAdmin && currentView === "journal" && (
          <div className="mt-6 p-4 rounded-md bg-[#1b1c1e] border border-[#292a2c] flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f2ca50] font-label">
              <Sparkles className="w-4 h-4 text-[#f2ca50]" />
              <span>
                Admin Mode Active — You can now add, edit (✏️), and delete (🗑️) entries directly on each card
              </span>
            </div>
            <button
              onClick={() => {
                setEditingPost(null);
                setLoggingWatchlistItem(null);
                setShowAdminModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-bold font-headline text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Entry
            </button>
          </div>
        )}

        {/* View Switch: Watchlist Grid vs Journal Feed */}
        {currentView === "watchlist" ? (
          <WatchlistGrid
            isAdmin={isAdmin}
            onLogReviewFromWatchlist={handleLogWatchlistItem}
          />
        ) : (
          <>
            {/* Hero Spotlight (Featured Entry) */}
            {!loading &&
              featuredPost &&
              !searchQuery &&
              !selectedTag &&
              activeCategory === "ALL" && <HeroBanner post={featuredPost} />}

            {/* Loading Indicator */}
            {loading ? (
              <div className="w-full py-24 flex flex-col items-center justify-center space-y-3 text-[#99907c]">
                <RefreshCw className="w-8 h-8 animate-spin text-[#f2ca50]" />
                <p className="text-xs font-semibold font-label">
                  Loading KINO Journal Entries...
                </p>
              </div>
            ) : (
              /* Media Grid List */
              <MediaGrid
                posts={posts}
                isAdmin={isAdmin}
                activeCategory={activeCategory}
                onCategoryChange={(cat) => setActiveCategory(cat)}
                activeSort={activeSort}
                onSortChange={(sort) => setActiveSort(sort)}
                selectedTag={selectedTag}
                onTagChange={(tag) => setSelectedTag(tag)}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
              />
            )}
          </>
        )}
      </main>

      {/* Admin Creator / Login / Watchlist Review Modal */}
      {showAdminModal && (
        <AdminModal
          isAdmin={isAdmin}
          editingPost={editingPost}
          watchlistItem={loggingWatchlistItem}
          onClose={() => {
            setShowAdminModal(false);
            setEditingPost(null);
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
              src="/kino-logo.png"
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

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121315] flex items-center justify-center text-[#99907c]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#f2ca50]" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
