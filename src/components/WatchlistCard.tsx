"use client";

import Link from "next/link";
import { Film, Edit3, Trash2, ArrowRight } from "lucide-react";

interface WatchlistCardProps {
  item: {
    id: string;
    title: string;
    mediaType: string;
    releaseYear?: number | null;
    genre?: string | null;
    director?: string | null;
    cast?: string | null;
    plot?: string | null;
    posterUrl?: string | null;
    imdbRating?: string | null;
    isWatched: boolean;
    post?: {
      id: string;
      slug: string;
      userRating?: number | null;
    } | null;
  };
  isAdmin?: boolean;
  onLogReview?: (item: any) => void;
  onDelete?: (id: string) => void;
}

export function WatchlistCard({
  item,
  isAdmin = false,
  onLogReview,
  onDelete,
}: WatchlistCardProps) {
  return (
    <div className="group relative flex flex-col rounded-md bg-[#1b1c1e] border border-[#292a2c] overflow-hidden hover:border-[#4d4635] transition-all duration-300">
      {/* Admin Trash Control */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDelete && onDelete(item.id)}
            className="p-1.5 rounded bg-[#0d0e10]/90 backdrop-blur-md text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/40 shadow-lg transition-all cursor-pointer"
            title="Delete Watchlist Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Poster Aspect Ratio Frame */}
      <div className="relative aspect-2/3 w-full overflow-hidden bg-[#0d0e10]">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#99907c] bg-[#0d0e10]">
            <Film className="w-12 h-12 mb-2 stroke-[1.5]" />
            <span className="text-xs font-semibold text-center">
              {item.title}
            </span>
          </div>
        )}

        {/* Poster Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 pointer-events-none z-10 font-label">
          <span className="px-2 py-0.5 rounded-sm bg-[#0d0e10]/90 text-[10px] font-bold text-[#e3e2e5] border border-[#292a2c] uppercase tracking-wider">
            {item.mediaType}
          </span>
          <span
            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-wider ${
              item.isWatched
                ? "bg-[#f2ca50]/20 text-[#f2ca50] border-[#f2ca50]/40"
                : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
            }`}
          >
            {item.isWatched ? "Watched" : "Queued"}
          </span>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3 font-label">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-headline text-base font-bold text-[#e3e2e5] line-clamp-1">
              {item.title}
            </h4>
            {item.releaseYear && (
              <span className="text-xs font-semibold text-[#99907c]">
                {item.releaseYear}
              </span>
            )}
          </div>

          {item.director && (
            <p className="text-[11px] text-[#99907c] mt-0.5 line-clamp-1">
              by{" "}
              <span className="text-[#e3e2e5] font-medium">
                {item.director}
              </span>
            </p>
          )}

          {item.plot && (
            <p className="text-[11px] text-[#99907c] mt-1.5 line-clamp-2 italic font-journal">
              "{item.plot}"
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-[#292a2c] flex items-center justify-between gap-2">
          {item.isWatched && item.post ? (
            <Link
              href={`/post/${item.post.slug}?from=watchlist&tab=watched`}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#121315] hover:bg-[#292a2c] text-[#f2ca50] border border-[#f2ca50]/30 font-headline font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Read Review</span>
              {item.post.userRating && (
                <span className="text-amber-400 font-bold ml-1">
                  ★ {item.post.userRating.toFixed(1)}
                </span>
              )}
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onLogReview && onLogReview(item)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-headline font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Log & Review Entry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
