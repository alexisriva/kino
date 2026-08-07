'use client';

import React from 'react';
import { MediaCard } from './MediaCard';
import { Film, ArrowUpDown, Tag } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-[#292a2c]">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
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
              className={`px-4 py-2 rounded-md text-xs font-bold font-headline transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#343537] text-[#e3e2e5] border border-[#4d4635]'
                  : 'bg-transparent text-[#99907c] hover:text-[#e3e2e5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sorting Selection */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto font-label">
          <div className="flex items-center gap-1.5 text-xs text-[#99907c] font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#f2ca50]" />
            <span>Sort by:</span>
          </div>
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-[#1b1c1e] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]/50 font-label"
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 font-label">
          <span className="text-[11px] font-bold text-[#99907c] flex items-center gap-1 shrink-0 uppercase tracking-wider">
            <Tag className="w-3 h-3 text-[#f2ca50]" /> TAGS:
          </span>
          {selectedTag && (
            <button
              onClick={() => onTagChange && onTagChange('')}
              className="px-3 py-1 rounded-sm bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              Clear Filter ({selectedTag}) ×
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange && onTagChange(selectedTag === tag ? '' : tag)}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-[#f2ca50] text-[#121315] font-bold'
                  : 'bg-[#1b1c1e] text-[#c6c6c9] hover:text-white border border-[#292a2c]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid List */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
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
        <div className="w-full p-12 text-center rounded-lg bg-[#1b1c1e] border border-[#292a2c] my-8">
          <Film className="w-12 h-12 text-[#99907c] mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-[#e3e2e5]">No Journal Entries Found</h3>
          <p className="text-xs text-[#99907c] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing tag filters, or selecting a different media category.
          </p>
        </div>
      )}
    </section>
  );
}
