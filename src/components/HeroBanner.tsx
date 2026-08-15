"use client";

import Link from "next/link";
import { StarRating } from "./StarRating";
import { LikeDislikeButtons } from "./LikeDislikeButtons";
import { ArrowRight, Star } from "lucide-react";

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
    <section className="relative w-full rounded-lg bg-[#1b1c1e] border border-[#292a2c] my-8 p-6 sm:p-8 lg:p-10 overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Poster Image Container */}
        {post.posterUrl && (
          <div className="relative shrink-0 w-full sm:w-72 md:w-80 aspect-2/3 overflow-hidden rounded-md bg-[#121315] border border-[#292a2c]">
            <img
              src={post.posterUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Info & Excerpt */}
        <div className="flex flex-col flex-1 items-start text-left space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30 text-[11px] font-bold uppercase tracking-wider font-label">
              <Star className="w-3.5 h-3.5 fill-[#f2ca50]" /> Featured Spotlight
            </span>
            <span className="px-2.5 py-0.5 rounded-sm bg-[#292a2c] text-[#c6c6c9] text-xs font-bold uppercase tracking-wider font-label">
              {post.mediaType}
            </span>
            {post.releaseYear && (
              <span className="text-xs font-semibold text-[#99907c] font-label">
                ({post.releaseYear})
              </span>
            )}
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#e3e2e5] leading-tight">
            {post.title}
          </h1>

          {/* Director & Cast */}
          {(post.director || post.cast) && (
            <div className="text-xs text-[#99907c] space-y-1 font-label">
              {post.director && (
                <p>
                  <strong className="text-[#e3e2e5] font-semibold">
                    Director:
                  </strong>{" "}
                  {post.director}
                </p>
              )}
              {post.cast && (
                <p className="line-clamp-1">
                  <strong className="text-[#e3e2e5] font-semibold">
                    Cast:
                  </strong>{" "}
                  {post.cast}
                </p>
              )}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={post.userRating || 5.0} size="lg" />
          </div>

          {/* Review Excerpt in Newsreader Serif */}
          <p className="font-journal text-lg text-[#d0c5af] leading-relaxed line-clamp-3 italic">
            "{post.review.replace(/[#*`_]/g, "")}"
          </p>

          {/* Actions & Likes */}
          <div className="pt-4 flex flex-wrap items-center justify-between w-full gap-4 border-t border-[#292a2c]">
            <LikeDislikeButtons
              postId={post.id}
              initialLikes={post.likesCount}
              initialDislikes={post.dislikesCount}
              size="md"
            />

            <Link
              href={`/post/${post.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-headline font-bold text-xs shadow-md transition-all cursor-pointer"
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
