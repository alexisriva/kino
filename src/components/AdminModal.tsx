'use client';

import React, { useState, useEffect } from 'react';
import { createPostAction, updatePostAction } from '@/actions/postActions';
import { StarRating } from './StarRating';
import { X, Lock, ShieldCheck, Search, Plus, Sparkles, LogOut, CheckCircle2, Film } from 'lucide-react';

interface AdminModalProps {
  isAdmin: boolean;
  editingPost?: any;
  onClose: () => void;
  onAdminStatusChange: (status: boolean) => void;
}

export function AdminModal({
  isAdmin,
  editingPost,
  onClose,
  onAdminStatusChange,
}: AdminModalProps) {
  // Login form state
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // OMDb Search state
  const [omdbQuery, setOmdbQuery] = useState('');
  const [omdbSearchType, setOmdbSearchType] = useState(''); // '' (all), 'movie', 'series'
  const [omdbResults, setOmdbResults] = useState<any[]>([]);
  const [omdbLoading, setOmdbLoading] = useState(false);
  const [omdbError, setOmdbError] = useState('');
  const [showOmdbSearch, setShowOmdbSearch] = useState(false);

  // Post form state
  const [title, setTitle] = useState(editingPost?.title || '');
  const [mediaType, setMediaType] = useState(editingPost?.mediaType || 'MOVIE');
  const [releaseYear, setReleaseYear] = useState<number | string>(editingPost?.releaseYear || '');
  const [genre, setGenre] = useState(editingPost?.genre || '');
  const [director, setDirector] = useState(editingPost?.director || '');
  const [cast, setCast] = useState(editingPost?.cast || '');
  const [plot, setPlot] = useState(editingPost?.plot || '');
  const [posterUrl, setPosterUrl] = useState(editingPost?.posterUrl || '');
  const [imdbRating, setImdbRating] = useState(editingPost?.imdbRating || '');
  const [userRating, setUserRating] = useState<number>(editingPost?.userRating || 5.0);
  const [review, setReview] = useState(editingPost?.review || '');
  const [tags, setTags] = useState(editingPost?.tags || '');
  const [isFeatured, setIsFeatured] = useState(editingPost?.isFeatured || false);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        onAdminStatusChange(true);
        setPassword('');
      } else {
        setLoginError(data.message || 'Invalid admin password');
      }
    } catch (err) {
      setLoginError('Authentication server error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    onAdminStatusChange(false);
    onClose();
  };

  // Query OMDb API
  const handleOmdbSearch = async () => {
    if (!omdbQuery.trim()) return;
    setOmdbLoading(true);
    setOmdbError('');
    setOmdbResults([]);

    try {
      const typeParam = omdbSearchType ? `&type=${omdbSearchType}` : '';
      const res = await fetch(`/api/omdb/search?title=${encodeURIComponent(omdbQuery)}${typeParam}`);
      const data = await res.json();

      if (data.Search) {
        setOmdbResults(data.Search);
      } else if (data.Title) {
        setOmdbResults([data]);
      } else if (data.error) {
        setOmdbError(data.error);
      }
    } catch (err) {
      setOmdbError('Error connecting to OMDb metadata service');
    } finally {
      setOmdbLoading(false);
    }
  };

  // Select item from OMDb search results to autofill form
  const handleSelectOmdbItem = async (imdbID: string) => {
    setOmdbLoading(true);
    try {
      const res = await fetch(`/api/omdb/search?i=${imdbID}`);
      const item = await res.json();

      if (item && item.Title) {
        setTitle(item.Title);
        setReleaseYear(item.Year ? parseInt(item.Year) : '');
        setGenre(item.Genre !== 'N/A' ? item.Genre : '');
        setDirector(item.Director !== 'N/A' ? item.Director : '');
        setCast(item.Actors !== 'N/A' ? item.Actors : '');
        setPlot(item.Plot !== 'N/A' ? item.Plot : '');
        setPosterUrl(item.Poster !== 'N/A' ? item.Poster : '');
        setImdbRating(item.imdbRating !== 'N/A' ? `${item.imdbRating}/10` : '');
        setMediaType(item.Type === 'series' ? 'TV' : item.Genre?.toLowerCase().includes('documentary') ? 'DOCUMENTARY' : 'MOVIE');
        setShowOmdbSearch(false);
      }
    } catch (err) {
      setOmdbError('Failed to fetch item details');
    } finally {
      setOmdbLoading(false);
    }
  };

  // Submit Post Creation or Update
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !review) {
      setFormError('Title and Review content are required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

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
    };

    let res;
    if (editingPost) {
      res = await updatePostAction(editingPost.id, postData);
    } else {
      res = await createPostAction(postData);
    }

    if (res.success) {
      setFormSuccess(editingPost ? 'Post updated successfully!' : 'Post published successfully!');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } else {
      setFormError(res.error || 'Failed to save post');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl glass-modal shadow-2xl border border-slate-700/60 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* LOGIN FORM IF NOT AUTHENTICATED */}
        {!isAdmin ? (
          <div className="max-w-md mx-auto text-center space-y-6 py-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Admin Credentials Required</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your secret admin password to unlock creation, editing, and publishing rights.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secret Admin Password
                </label>
                <input
                  type="password"
                  placeholder="Enter admin password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
              >
                {loginLoading ? 'Authenticating...' : 'Unlock Admin Portal'}
              </button>
            </form>
          </div>
        ) : (
          /* POST EDITOR FORM */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">
                  {editingPost ? 'Edit Journal Entry' : 'Publish New Journal Entry'}
                </h2>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium border border-rose-500/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>

            {/* OMDb API Auto-Fill Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Auto-fill Metadata from OMDb API
                </h4>
                <p className="text-[11px] text-slate-400">
                  Search movies, TV series, documentaries, or anime to instantly populate title, plot, cast, director, and poster.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOmdbSearch(!showOmdbSearch)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shrink-0 hover:bg-emerald-400 transition-all"
              >
                {showOmdbSearch ? 'Close Search' : 'Search OMDb API'}
              </button>
            </div>

            {/* OMDb Search Modal / Accordion */}
            {showOmdbSearch && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type movie, TV series, or doc title (e.g. Severance, Succession)..."
                    value={omdbQuery}
                    onChange={(e) => setOmdbQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleOmdbSearch())}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={omdbSearchType}
                    onChange={(e) => setOmdbSearchType(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 shrink-0"
                  >
                    <option value="">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="series">TV Series</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleOmdbSearch}
                    disabled={omdbLoading}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 transition-colors"
                  >
                    {omdbLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {omdbError && (
                  <p className="text-xs text-rose-400 font-medium">{omdbError}</p>
                )}

                {omdbResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2 pt-2 border-t border-slate-800">
                    {omdbResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectOmdbItem(item.imdbID)}
                        className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition-colors"
                      >
                        {item.Poster && item.Poster !== 'N/A' ? (
                          <img
                            src={item.Poster}
                            alt={item.Title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-14 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-10 h-14 rounded-md bg-slate-900 flex items-center justify-center text-slate-600">
                            <Film className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-white">{item.Title}</h5>
                          <p className="text-[10px] text-slate-400">
                            {item.Year} • {item.Type?.toUpperCase()}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg">
                          Import ↓
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Entry Form */}
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Title (e.g. Dune: Part Two)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Media Category
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Release Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sci-Fi, Drama"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Director
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Denis Villeneuve"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Main Cast
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Timothée Chalamet, Zendaya"
                    value={cast}
                    onChange={(e) => setCast(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Poster URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://image-url.jpg"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Plot Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Short plot description..."
                  value={plot}
                  onChange={(e) => setPlot(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Your Star Rating */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    Your Star Rating: <span className="text-amber-400 font-bold ml-1">{userRating.toFixed(1)} / 5.0</span>
                  </label>
                  <p className="text-[10px] text-slate-500">Click left half of star for .5, right half for full star</p>
                </div>
                <StarRating
                  rating={userRating}
                  size="lg"
                  interactive
                  onChange={(r) => setUserRating(r)}
                />
              </div>

              {/* Review Markdown Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Review / Journal Entry *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your comprehensive analysis, feelings, and review..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                />
              </div>

              {/* Tags & Featured Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Masterpiece, SciFi, MustWatch"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Feature on Hero Spotlight
                  </label>
                </div>
              </div>

              {/* Feedback messages */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {formSuccess}
                </div>
              )}

              {/* Submit button */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {submitting ? 'Publishing...' : editingPost ? 'Update Entry' : 'Publish Entry'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
