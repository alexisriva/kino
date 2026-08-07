'use client';

import React from 'react';
import Link from 'next/link';
import { LikeDislikeButtons } from './LikeDislikeButtons';
import { ShareModal } from './ShareModal';
import { Film, Edit3, Trash2 } from 'lucide-react';

interface MediaCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    mediaType: string;
    releaseYear?: number | null;
    genre?: string | null;
    director?: string | null;
    posterUrl?: string | null;
    userRating?: number | null;
    review: string;
    tags?: string | null;
    likesCount: number;
    dislikesCount: number;
    createdAt: string | Date;
  };
  isAdmin?: boolean;
  onEdit?: (post: any) => void;
  onDelete?: (id: string) => void;
}

export function MediaCard({ post, isAdmin = false, onEdit, onDelete }: MediaCardProps) {
  const tagsList = post.tags ? post.tags.split(',').filter(Boolean) : [];

  return (
    <div className="group relative flex flex-col rounded-md bg-[#1b1c1e] border border-[#292a2c] overflow-hidden hover:border-[#4d4635] transition-all duration-300">
      {/* Admin Quick Control Overlay */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit && onEdit(post);
            }}
            className="p-1.5 rounded bg-[#0d0e10]/90 backdrop-blur-md text-[#f2ca50] hover:bg-[#f2ca50] hover:text-[#121315] border border-[#f2ca50]/40 shadow-lg transition-all"
            title="Edit Entry"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete && onDelete(post.id);
            }}
            className="p-1.5 rounded bg-[#0d0e10]/90 backdrop-blur-md text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/40 shadow-lg transition-all"
            title="Delete Entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Poster Aspect Ratio Frame */}
      <Link href={`/post/${post.slug}`} className="relative aspect-[2/3] w-full overflow-hidden bg-[#0d0e10]">
        {post.posterUrl ? (
          <img
            src={post.posterUrl}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#99907c] bg-[#0d0e10]">
            <Film className="w-12 h-12 mb-2 stroke-[1.5]" />
            <span className="text-xs font-semibold text-center">{post.title}</span>
          </div>
        )}

        {/* Poster Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none z-10 font-label">
          <span className="px-2 py-0.5 rounded-sm bg-[#0d0e10]/90 text-[10px] font-bold text-[#e3e2e5] border border-[#292a2c] uppercase tracking-wider">
            {post.mediaType}
          </span>
          {post.userRating && (
            <div className="px-2 py-0.5 rounded-sm bg-[#0d0e10]/90 text-xs font-bold text-[#f2ca50] border border-[#f2ca50]/30 flex items-center gap-1">
              ★ {post.userRating.toFixed(1)}
            </div>
          )}
        </div>
      </Link>

      {/* Card Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/post/${post.slug}`}
              className="font-headline text-base font-bold text-[#e3e2e5] hover:text-[#f2ca50] transition-colors line-clamp-1"
            >
              {post.title}
            </Link>
            {post.releaseYear && (
              <span className="text-xs font-semibold text-[#99907c] font-label">{post.releaseYear}</span>
            )}
          </div>

          {post.director && (
            <p className="text-[11px] text-[#99907c] mt-0.5 line-clamp-1 font-label">
              by <span className="text-[#e3e2e5] font-medium">{post.director}</span>
            </p>
          )}

          {/* Tags */}
          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 font-label">
              {tagsList.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-sm bg-[#292a2c] text-[#c6c6c9]"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions & Admin Toolbar */}
        <div className="pt-3 border-t border-[#292a2c] flex items-center justify-between gap-2">
          <LikeDislikeButtons
            postId={post.id}
            initialLikes={post.likesCount}
            initialDislikes={post.dislikesCount}
            size="sm"
          />

          <ShareModal title={post.title} slug={post.slug} />
        </div>
      </div>
    </div>
  );
}
