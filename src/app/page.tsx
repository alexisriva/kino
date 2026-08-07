'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { MediaGrid } from '@/components/MediaGrid';
import { AdminModal } from '@/components/AdminModal';
import { getPostsAction, deletePostAction } from '@/actions/postActions';
import { Film, Plus, Sparkles, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeSort, setActiveSort] = useState('latest');

  // Admin & Modals
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

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
        const res = await fetch('/api/admin/check');
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
    setShowAdminModal(true);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    const res = await deletePostAction(id);
    if (res.success) {
      loadPosts();
    } else {
      alert(res.error || 'Failed to delete post');
    }
  };

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        isAdmin={isAdmin}
        onOpenAdminModal={() => {
          setEditingPost(null);
          setShowAdminModal(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pb-16">
        {/* Admin Quick Action Floating Bar when logged in */}
        {isAdmin && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/50 flex items-center justify-between shadow-xl shadow-emerald-950/30">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Admin Mode Active — You can now add, edit (✏️), and delete (🗑️) entries directly on each card</span>
            </div>
            <button
              onClick={() => {
                setEditingPost(null);
                setShowAdminModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Entry
            </button>
          </div>
        )}

        {/* Hero Spotlight (Featured Entry) */}
        {!loading && featuredPost && !searchQuery && !selectedTag && activeCategory === 'ALL' && (
          <HeroBanner post={featuredPost} />
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-xs font-semibold">Loading Kino Journal Entries...</p>
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
      </main>

      {/* Admin Creator / Login Modal */}
      {showAdminModal && (
        <AdminModal
          isAdmin={isAdmin}
          editingPost={editingPost}
          onClose={() => {
            setShowAdminModal(false);
            setEditingPost(null);
          }}
          onAdminStatusChange={(status) => setIsAdmin(status)}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">KINO</span> — Personal Cinema & Media Journal
          </div>
          <p className="text-center sm:text-right">
            Curated cinema reviews, docs, & series with anonymous voting and social sharing.
          </p>
        </div>
      </footer>
    </div>
  );
}
