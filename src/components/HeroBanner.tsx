'use client';

import React from 'react';
import Link from 'next/link';
import { StarRating } from './StarRating';
import { LikeDislikeButtons } from './LikeDislikeButtons';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  post: {
    id: string;
    slug: string;
    title: string;
    mediaType: string;
    releaseYear?: number | null;
    director?: string | null;
    cast?: string | null;
    posterUrl?: string | null;
    userRating?: number | null;
    review: string;
    likesCount: number;
    dislikesCount: number;
  };
}

export function HeroBanner({ post }: HeroBannerProps) {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden glass-panel border border-slate-800/80 my-6 shadow-2xl">
      {/* Background Poster Blur Backdrop */}
      {post.posterUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-3xl scale-125 transform transition-transform duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${post.posterUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/70 to-transparent pointer-events-none" />

      {/* Hero Content Grid */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center gap-8">
        {/* Poster Image Container */}
        {post.posterUrl && (
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
            <img
              src={post.posterUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="relative w-44 sm:w-52 h-64 sm:h-76 object-cover rounded-xl shadow-2xl border border-white/10 transform group-hover:scale-105 transition duration-300"
            />
          </div>
        )}

        {/* Info & Excerpt */}
        <div className="flex flex-col flex-1 items-start text-left space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Featured Spotlight
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 text-xs font-semibold uppercase">
              {post.mediaType}
            </span>
            {post.releaseYear && (
              <span className="text-xs font-medium text-slate-400">({post.releaseYear})</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {/* Director & Cast */}
          {(post.director || post.cast) && (
            <div className="text-xs text-slate-400 space-y-0.5">
              {post.director && (
                <p>
                  <strong className="text-slate-300 font-semibold">Director:</strong> {post.director}
                </p>
              )}
              {post.cast && (
                <p className="line-clamp-1">
                  <strong className="text-slate-300 font-semibold">Cast:</strong> {post.cast}
                </p>
              )}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={post.userRating || 5.0} size="lg" />
          </div>

          {/* Review Excerpt */}
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 max-w-2xl font-light italic">
            "{post.review.replace(/[#*`_]/g, '')}"
          </p>

          {/* Actions & Likes */}
          <div className="pt-2 flex flex-wrap items-center justify-between w-full gap-4 border-t border-slate-800/80">
            <LikeDislikeButtons
              postId={post.id}
              initialLikes={post.likesCount}
              initialDislikes={post.dislikesCount}
              size="md"
            />

            <Link
              href={`/post/${post.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <span>Read Full Journal Entry</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
