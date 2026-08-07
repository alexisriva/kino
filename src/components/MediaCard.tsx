'use client';

import React from 'react';
import Link from 'next/link';
import { StarRating } from './StarRating';
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
    <div className="group relative flex flex-col rounded-2xl glass-panel border border-slate-800/80 overflow-hidden hover:border-slate-700/80 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5">
      {/* Admin Quick Control Badge on Top of Poster */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit && onEdit(post);
            }}
            className="p-1.5 rounded-lg bg-slate-950/90 backdrop-blur-md text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 shadow-lg transition-all hover:scale-110"
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
            className="p-1.5 rounded-lg bg-slate-950/90 backdrop-blur-md text-rose-400 hover:text-rose-300 border border-rose-500/40 hover:bg-rose-500/20 shadow-lg transition-all hover:scale-110"
            title="Delete Entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Poster Aspect Ratio Frame */}
      <Link href={`/post/${post.slug}`} className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        {post.posterUrl ? (
          <img
            src={post.posterUrl}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-600 bg-slate-900">
            <Film className="w-12 h-12 mb-2 stroke-[1.5]" />
            <span className="text-xs font-semibold text-center">{post.title}</span>
          </div>
        )}

        {/* Poster Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-slate-700/60 uppercase tracking-wider">
            {post.mediaType}
          </span>
          {post.userRating && (
            <div className="px-2 py-0.5 rounded-md bg-slate-950/90 backdrop-blur-md text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-md">
              ★ {post.userRating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Hover Overlay Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            Read Entry →
          </span>
        </div>
      </Link>

      {/* Card Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/post/${post.slug}`}
              className="text-base font-bold text-white hover:text-emerald-400 transition-colors line-clamp-1"
            >
              {post.title}
            </Link>
            {post.releaseYear && (
              <span className="text-xs font-semibold text-slate-400">{post.releaseYear}</span>
            )}
          </div>

          {post.director && (
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              by <span className="text-slate-300 font-medium">{post.director}</span>
            </p>
          )}

          {/* Tags */}
          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tagsList.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 border border-slate-700/40"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions & Admin Toolbar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <LikeDislikeButtons
            postId={post.id}
            initialLikes={post.likesCount}
            initialDislikes={post.dislikesCount}
            size="sm"
          />

          <div className="flex items-center gap-1.5">
            <ShareModal title={post.title} slug={post.slug} />

            {isAdmin && (
              <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-1.5">
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(post)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                  title="Edit Entry"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete && onDelete(post.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
