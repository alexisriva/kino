"use client";

import Link from "next/link";
import { StarRating } from "./StarRating";
import { Trash2, ArrowRight } from "lucide-react";

export interface WatchedListItemProps {
  item: {
    id: string;
    title: string;
    mediaType?: string;
    releaseYear?: number | null;
    isWatched: boolean;
    post?: {
      id: string;
      slug: string;
      userRating?: number | null;
    } | null;
  };
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export function WatchedListItem({
  item,
  isAdmin = false,
  onDelete,
}: WatchedListItemProps) {
  const userRating = item.post?.userRating ?? null;
  const reviewSlug = item.post?.slug;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-[#242629]/50 transition-colors">
      {/* Show Title & Metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {reviewSlug ? (
            <Link
              href={`/post/${reviewSlug}?from=watchlist&tab=watched`}
              className="font-headline text-base font-bold text-[#e3e2e5] hover:text-[#f2ca50] transition-colors truncate"
            >
              {item.title}
            </Link>
          ) : (
            <h4 className="font-headline text-base font-bold text-[#e3e2e5] truncate">
              {item.title}
            </h4>
          )}

          {item.releaseYear && (
            <span className="text-xs font-semibold text-[#99907c] font-label">
              ({item.releaseYear})
            </span>
          )}

          {item.mediaType && (
            <span className="px-1.5 py-0.5 rounded-sm bg-[#121315] text-[10px] font-bold text-[#c6c6c9] border border-[#292a2c] uppercase font-label">
              {item.mediaType}
            </span>
          )}
        </div>
      </div>

      {/* Rating, Review Link, and Admin Action */}
      <div className="flex items-center gap-4 shrink-0 font-label justify-between sm:justify-end">
        {/* Rating Given */}
        <div>
          {userRating !== null && userRating !== undefined ? (
            <StarRating rating={userRating} size="sm" />
          ) : (
            <span className="text-xs text-[#99907c] italic font-label">
              Not rated
            </span>
          )}
        </div>

        {/* Link to Review */}
        {reviewSlug && (
          <Link
            href={`/post/${reviewSlug}?from=watchlist&tab=watched`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#121315] hover:bg-[#292a2c] text-[#f2ca50] border border-[#f2ca50]/30 font-headline font-bold text-xs transition-colors cursor-pointer"
          >
            <span>Read Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        {/* Admin Delete Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete && onDelete(item.id)}
            className="p-1.5 rounded bg-[#121315] text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/40 shadow-sm transition-all cursor-pointer"
            title="Delete Watchlist Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
