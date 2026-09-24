"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { LikeDislikeButtons } from "@/components/LikeDislikeButtons";
import { ShareModal } from "@/components/ShareModal";
import { EditableJournalReview } from "@/components/EditableJournalReview";
import { AdminModal } from "@/components/AdminModal";
import { ArrowLeft, Film } from "lucide-react";

interface PostDetailContentProps {
  post: any;
  isFromWatchlist: boolean;
  backTargetUrl: string;
  tagsList: string[];
}

export function PostDetailContent({
  post,
  isFromWatchlist,
  backTargetUrl,
  tagsList,
}: PostDetailContentProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Check admin status on mount
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();
        setIsAdmin(Boolean(data.authenticated));
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#121315] text-[#e3e2e5] selection:bg-[#f2ca50] selection:text-[#121315]">
      {/* Header */}
      <Header
        currentView={isFromWatchlist ? "watchlist" : "journal"}
        isAdmin={isAdmin}
        onAdminStatusChange={(status) => setIsAdmin(status)}
        onOpenAdminModal={() => {
          if (!isAdmin) {
            setShowAdminModal(true);
          }
        }}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full py-6 sm:py-8">
        {/* Back Link */}
        <Link
          href={backTargetUrl}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#99907c] hover:text-[#f2ca50] mb-4 sm:mb-6 transition-colors font-label cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />{" "}
          {isFromWatchlist ? "Back to Watchlist" : "Back to Journal Grid"}
        </Link>

        {/* Post Hero Section */}
        <div className="relative w-full rounded-lg bg-[#1b1c1e] border border-[#292a2c] p-4 sm:p-6 md:p-10 mb-6 sm:mb-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start">
            {/* Poster Card */}
            {post.posterUrl ? (
              <div className="relative shrink-0 mx-auto md:mx-0 w-44 sm:w-64 aspect-2/3 overflow-hidden rounded-md bg-[#0d0e10] border border-[#292a2c] shadow-lg">
                <img
                  src={post.posterUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-44 sm:w-52 h-64 sm:h-76 rounded-md bg-[#0d0e10] flex flex-col items-center justify-center p-4 text-[#99907c] border border-[#292a2c]">
                <Film className="w-12 sm:w-16 h-12 sm:h-16 mb-2" />
                <span className="text-xs font-bold text-center">
                  {post.title}
                </span>
              </div>
            )}

            {/* Metadata Info */}
            <div className="flex flex-col flex-1 space-y-3.5 sm:space-y-4 text-left font-label w-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-sm bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30 text-xs font-bold uppercase tracking-wider">
                  {post.mediaType}
                </span>
                {post.releaseYear && (
                  <span className="text-xs font-semibold text-[#99907c]">
                    Released: {post.releaseYear}
                  </span>
                )}
                {post.imdbRating && (
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-sm bg-[#292a2c] text-[#f2ca50] border border-[#f2ca50]/30 text-xs font-bold">
                    IMDb: {post.imdbRating}
                  </span>
                )}
              </div>

              <h1 className="font-headline text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#e3e2e5] tracking-tight leading-tight">
                {post.title}
              </h1>

              {/* Star Rating */}
              <div className="flex items-center gap-3 py-0.5">
                <span className="text-xs font-bold text-[#99907c]">
                  Your Rating:
                </span>
                <StarRating rating={post.userRating || 5.0} size="lg" />
              </div>

              {/* Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs text-[#e3e2e5] p-3.5 sm:p-4 rounded-md bg-[#121315] border border-[#292a2c]">
                {post.director && (
                  <p>
                    <strong className="text-[#99907c] uppercase tracking-wider font-semibold block text-[10px]">
                      Director
                    </strong>
                    {post.director}
                  </p>
                )}
                {post.cast && (
                  <p>
                    <strong className="text-[#99907c] uppercase tracking-wider font-semibold block text-[10px]">
                      Main Cast
                    </strong>
                    {post.cast}
                  </p>
                )}
                {post.genre && (
                  <p className="sm:col-span-2">
                    <strong className="text-[#99907c] uppercase tracking-wider font-semibold block text-[10px]">
                      Genre
                    </strong>
                    {post.genre}
                  </p>
                )}
              </div>

              {/* Plot Summary */}
              {post.plot && (
                <div className="text-xs text-[#e3e2e5] space-y-1">
                  <span className="text-[10px] font-bold text-[#99907c] uppercase tracking-wider block">
                    Synopsis / Plot
                  </span>
                  <p className="font-journal text-xs sm:text-sm leading-relaxed italic text-[#d0c5af]">
                    {post.plot}
                  </p>
                </div>
              )}

              {/* Voting & Sharing */}
              <div className="pt-3 sm:pt-4 border-t border-[#292a2c] flex items-center justify-between gap-3 flex-wrap">
                <LikeDislikeButtons
                  postId={post.id}
                  initialLikes={post.likesCount}
                  initialDislikes={post.dislikesCount}
                  size="lg"
                />

                <ShareModal title={post.title} slug={post.slug} />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Journal Review Content (Editable when Admin) */}
        <EditableJournalReview
          postId={post.id}
          initialReview={post.review}
          tagsList={tagsList}
          isAdmin={isAdmin}
        />
      </main>

      {/* Admin Login / Action Modal */}
      {showAdminModal && (
        <AdminModal
          isAdmin={isAdmin}
          onClose={() => setShowAdminModal(false)}
          onAdminStatusChange={(status) => setIsAdmin(status)}
        />
      )}
    </div>
  );
}
