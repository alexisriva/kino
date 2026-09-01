"use client";

import React, { useState, useEffect } from "react";
import { createPostAction, updatePostAction } from "@/actions/postActions";
import { StarRating } from "./StarRating";
import {
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  BookmarkCheck,
} from "lucide-react";

interface AdminModalProps {
  isAdmin: boolean;
  editingPost?: any;
  watchlistItem?: any;
  onClose: () => void;
  onAdminStatusChange: (status: boolean) => void;
}

export function AdminModal({
  isAdmin,
  editingPost,
  watchlistItem,
  onClose,
  onAdminStatusChange,
}: AdminModalProps) {
  // Prevent background page scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Login form state
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Post form state initialized from editingPost OR watchlistItem
  const [title, setTitle] = useState(
    editingPost?.title || watchlistItem?.title || "",
  );
  const [mediaType, setMediaType] = useState(
    editingPost?.mediaType || watchlistItem?.mediaType || "MOVIE",
  );
  const [releaseYear, setReleaseYear] = useState<number | string>(
    editingPost?.releaseYear || watchlistItem?.releaseYear || "",
  );
  const [genre, setGenre] = useState(
    editingPost?.genre || watchlistItem?.genre || "",
  );
  const [director, setDirector] = useState(
    editingPost?.director || watchlistItem?.director || "",
  );
  const [cast, setCast] = useState(
    editingPost?.cast || watchlistItem?.cast || "",
  );
  const [plot, setPlot] = useState(
    editingPost?.plot || watchlistItem?.plot || "",
  );
  const [posterUrl, setPosterUrl] = useState(
    editingPost?.posterUrl || watchlistItem?.posterUrl || "",
  );
  const [imdbRating, setImdbRating] = useState(
    editingPost?.imdbRating || watchlistItem?.imdbRating || "",
  );
  const [userRating, setUserRating] = useState<number>(
    editingPost?.userRating || 5.0,
  );
  const [review, setReview] = useState(editingPost?.review || "");
  const [tags, setTags] = useState(editingPost?.tags || "");
  const [isFeatured, setIsFeatured] = useState(
    editingPost?.isFeatured || false,
  );

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If user is admin but neither editing a post nor logging a watchlist item, this modal should not render
  if (isAdmin && !editingPost && !watchlistItem) {
    return null;
  }

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        onAdminStatusChange(true);
        setPassword("");
      } else {
        setLoginError(data.message || "Invalid admin password");
      }
    } catch (err) {
      setLoginError("Authentication server error");
    } finally {
      setLoginLoading(false);
    }
  };

  // Submit Post Creation or Update
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !review) {
      setFormError("Title and Review content are required");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    const postData = {
      title,
      mediaType,
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      genre,
      director,
      cast,
      plot,
      posterUrl,
      imdbRating,
      userRating,
      review,
      tags,
      isFeatured,
      watchlistItemId: watchlistItem?.id,
    };

    let res;
    if (editingPost) {
      res = await updatePostAction(editingPost.id, postData);
    } else {
      res = await createPostAction(postData);
    }

    if (res.success) {
      setFormSuccess(
        editingPost
          ? "Post updated successfully!"
          : "Review published & Watchlist item marked as Watched!",
      );
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } else {
      setFormError(res.error || "Failed to save post");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-label">
      <div className="relative w-full max-w-2xl my-auto p-4 sm:p-6 md:p-8 rounded-lg bg-[#1f2022] border border-[#292a2c] text-[#e3e2e5] shadow-2xl max-h-[90dvh] overflow-y-auto">
        {/* LOGIN FORM IF NOT AUTHENTICATED */}
        {!isAdmin ? (
          <div className="relative max-w-md mx-auto text-center space-y-4 sm:space-y-6 py-2 sm:py-4 font-label">
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 text-[#99907c] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#e3e2e5]">
                Admin Credentials Required
              </h2>
              <p className="text-xs text-[#99907c] mt-1">
                Enter your secret admin password to unlock creation, editing,
                and publishing rights.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                  Secret Admin Password
                </label>
                <input
                  type="password"
                  placeholder="Enter admin password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-headline font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {loginLoading ? "Authenticating..." : "Unlock Admin Portal"}
              </button>
            </form>
          </div>
        ) : (
          /* POST EDITOR FORM (ONLY FOR WATCHLIST LOGGING OR EDITING EXISTING POST) */
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-[#292a2c] pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#f2ca50] shrink-0" />
                <h2 className="font-headline text-lg sm:text-xl font-bold text-[#e3e2e5]">
                  {editingPost
                    ? "Edit Journal Entry"
                    : `Log Review for "${watchlistItem?.title}"`}
                </h2>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-[#99907c] hover:text-white hover:bg-[#292a2c] transition-colors cursor-pointer shrink-0"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Watchlist Item Info Banner when logging review */}
            {watchlistItem && (
              <div className="p-4 rounded-md bg-[#f2ca50]/10 border border-[#f2ca50]/30 flex items-center gap-3">
                <BookmarkCheck className="w-5 h-5 text-[#f2ca50] shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-[#f2ca50]">
                    Logging Watchlist Item
                  </p>
                  <p className="text-[#99907c] text-[11px]">
                    Publishing this review will automatically mark "
                    {watchlistItem.title}" as{" "}
                    <strong className="text-[#e3e2e5]">WATCHED</strong> and link
                    to your new blog post.
                  </p>
                </div>
              </div>
            )}

            {/* Entry Form */}
            <form onSubmit={handleSubmitPost} className="space-y-4 font-label">
              {/* Metadata Fields (only when editing existing post) */}
              {editingPost && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Title (e.g. Dune: Part Two)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                        Media Category
                      </label>
                      <select
                        value={mediaType}
                        onChange={(e) => setMediaType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50] cursor-pointer"
                      >
                        <option value="MOVIE">Movie</option>
                        <option value="TV">TV Series</option>
                        <option value="DOCUMENTARY">Documentary</option>
                        <option value="ANIME">Anime</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                        Release Year
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2024"
                        value={releaseYear}
                        onChange={(e) => setReleaseYear(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                        Genre
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sci-Fi, Drama"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                        Director
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Denis Villeneuve"
                        value={director}
                        onChange={(e) => setDirector(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                        Main Cast
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Timothée Chalamet, Zendaya"
                        value={cast}
                        onChange={(e) => setCast(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                        Poster URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://image-url.jpg"
                        value={posterUrl}
                        onChange={(e) => setPosterUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                      Plot Summary
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Short plot description..."
                      value={plot}
                      onChange={(e) => setPlot(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                </>
              )}

              {/* Your Star Rating */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-md bg-[#121315] border border-[#292a2c]">
                <label className="block text-xs font-semibold text-[#c6c6c9]">
                  Your Star Rating:{" "}
                  <span className="text-[#f2ca50] font-bold ml-1">
                    {userRating.toFixed(1)} / 5.0
                  </span>
                </label>
                <StarRating
                  rating={userRating}
                  size="lg"
                  interactive
                  onChange={(r) => setUserRating(r)}
                />
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                  Your Review / Journal Entry *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your comprehensive analysis, feelings, and review..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] font-journal leading-relaxed"
                />
              </div>

              {/* Tags & Featured Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">
                    Custom Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Masterpiece, SciFi, MustWatch"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#f2ca50] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-xs font-semibold text-[#c6c6c9] cursor-pointer"
                  >
                    Feature on Hero Spotlight
                  </label>
                </div>
              </div>

              {/* Feedback messages */}
              {formError && (
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-md bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-[#f2ca50] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {formSuccess}
                </div>
              )}

              {/* Submit button */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#292a2c]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-md bg-[#1b1c1e] hover:bg-[#292a2c] text-[#c6c6c9] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-headline font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {submitting
                    ? "Publishing..."
                    : editingPost
                      ? "Update Entry"
                      : "Publish Entry"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
