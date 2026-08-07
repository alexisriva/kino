'use client';

import React from 'react';
import { MediaCard } from './MediaCard';
import { SlidersHorizontal, Film, ArrowUpDown, Tag } from 'lucide-react';

interface MediaGridProps {
  posts: any[];
  isAdmin?: boolean;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
  selectedTag?: string;
  onTagChange?: (tag: string) => void;
  onEditPost?: (post: any) => void;
  onDeletePost?: (id: string) => void;
}

export function MediaGrid({
  posts,
  isAdmin = false,
  activeCategory,
  onCategoryChange,
  activeSort,
  onSortChange,
  selectedTag,
  onTagChange,
  onEditPost,
  onDeletePost,
}: MediaGridProps) {
  // Collect unique tags across posts
  const allTags = Array.from(
    new Set(
      posts
        .flatMap((p) => (p.tags ? p.tags.split(',') : []))
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

  return (
    <section className="w-full my-8 space-y-6">
      {/* Filtering & Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800/80">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Media' },
            { id: 'MOVIE', label: 'Movies' },
            { id: 'TV', label: 'TV Series' },
            { id: 'DOCUMENTARY', label: 'Documentaries' },
            { id: 'ANIME', label: 'Anime' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sorting Selection */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sort by:</span>
          </div>
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="latest">Latest Published</option>
            <option value="rating">Highest Rating</option>
            <option value="likes">Most Liked</option>
            <option value="oldest">Oldest Entries</option>
          </select>
        </div>
      </div>

      {/* Tag Cloud Filter Bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0 uppercase tracking-wider">
            <Tag className="w-3 h-3" /> Tags:
          </span>
          {selectedTag && (
            <button
              onClick={() => onTagChange && onTagChange('')}
              className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition-colors"
            >
              Clear Filter ({selectedTag}) ×
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange && onTagChange(selectedTag === tag ? '' : tag)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid List */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {posts.map((post) => (
            <MediaCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onEdit={onEditPost}
              onDelete={onDeletePost}
            />
          ))}
        </div>
      ) : (
        <div className="w-full p-12 text-center rounded-3xl glass-panel border border-slate-800/80 my-8">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-slate-300">No Journal Entries Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing tag filters, or selecting a different media category.
          </p>
        </div>
      )}
    </section>
  );
}
