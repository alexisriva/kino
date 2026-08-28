"use client";

import { useState } from "react";
import { Film, Check, Trash2, User, MessageSquare, Flame, RefreshCw } from "lucide-react";

interface RequestCardProps {
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
    requesterName?: string | null;
    requesterNote?: string | null;
    requestCount: number;
    createdAt: string | Date;
  };
  onAccept: (id: string) => Promise<void> | void;
  onReject: (id: string) => Promise<void> | void;
}

export function RequestCard({ item, onAccept, onReject }: RequestCardProps) {
  const [processingAccept, setProcessingAccept] = useState(false);
  const [processingReject, setProcessingReject] = useState(false);

  const handleAccept = async () => {
    setProcessingAccept(true);
    try {
      await onAccept(item.id);
    } finally {
      setProcessingAccept(false);
    }
  };

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to reject and remove the request for "${item.title}"?`)) {
      return;
    }
    setProcessingReject(true);
    try {
      await onReject(item.id);
    } finally {
      setProcessingReject(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-md bg-[#1b1c1e] border border-[#292a2c] overflow-hidden hover:border-[#4d4635] transition-all duration-300 shadow-md">
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
            <span className="text-xs font-semibold text-center">{item.title}</span>
          </div>
        )}

        {/* Poster Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 pointer-events-none z-10 font-label">
          <span className="px-2 py-0.5 rounded-sm bg-[#0d0e10]/90 text-[10px] font-bold text-[#e3e2e5] border border-[#292a2c] uppercase tracking-wider">
            {item.mediaType}
          </span>
          <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-wider bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            {item.requestCount} {item.requestCount === 1 ? "Request" : "Requests"}
          </span>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3 font-label">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-headline text-base font-bold text-[#e3e2e5] line-clamp-1">
              {item.title}
            </h4>
            {item.releaseYear && (
              <span className="text-xs font-semibold text-[#99907c]">{item.releaseYear}</span>
            )}
          </div>

          {item.director && (
            <p className="text-[11px] text-[#99907c] line-clamp-1">
              by <span className="text-[#e3e2e5] font-medium">{item.director}</span>
            </p>
          )}

          {item.genre && (
            <p className="text-[10px] text-[#f2ca50] font-semibold tracking-wide">
              {item.genre}
            </p>
          )}

          {item.plot && (
            <p className="text-[11px] text-[#99907c] line-clamp-2 italic font-journal">
              "{item.plot}"
            </p>
          )}

          {/* Requester Note & Name */}
          {(item.requesterName || item.requesterNote) && (
            <div className="p-2 rounded bg-[#121315] border border-[#292a2c] text-[11px] space-y-1">
              {item.requesterName && (
                <div className="flex items-center gap-1.5 text-[#f2ca50] font-semibold">
                  <User className="w-3 h-3" />
                  <span>Requested by {item.requesterName}</span>
                </div>
              )}
              {item.requesterNote && (
                <div className="flex items-start gap-1.5 text-[#c6c6c9] italic">
                  <MessageSquare className="w-3 h-3 mt-0.5 text-[#99907c] shrink-0" />
                  <p className="line-clamp-2">{item.requesterNote}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Accept & Reject Action Buttons */}
        <div className="pt-3 border-t border-[#292a2c] flex items-center gap-2">
          <button
            type="button"
            disabled={processingAccept || processingReject}
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] disabled:opacity-50 text-[#121315] font-headline font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="Accept request and add to watchlist queue"
          >
            {processingAccept ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Accept</span>
          </button>

          <button
            type="button"
            disabled={processingAccept || processingReject}
            onClick={handleReject}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-[#121315] hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 disabled:opacity-50 font-headline font-bold text-xs transition-all cursor-pointer"
            title="Reject and delete request"
          >
            {processingReject ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Reject</span>
          </button>
        </div>
      </div>
    </div>
  );
}
