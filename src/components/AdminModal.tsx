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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-label">
      <div className="relative w-full max-w-2xl my-8 p-6 sm:p-8 rounded-lg bg-[#1f2022] border border-[#292a2c] text-[#e3e2e5] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* LOGIN FORM IF NOT AUTHENTICATED */}
        {!isAdmin ? (
          <div className="relative max-w-md mx-auto text-center space-y-6 py-4 font-label">
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 text-[#99907c] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-md bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-headline text-2xl font-bold text-[#e3e2e5]">Admin Credentials Required</h2>
              <p className="text-xs text-[#99907c] mt-1">
                Enter your secret admin password to unlock creation, editing, and publishing rights.
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
                {loginLoading ? 'Authenticating...' : 'Unlock Admin Portal'}
              </button>
            </form>
          </div>
        ) : (
          /* POST EDITOR FORM */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#292a2c] pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#f2ca50]" />
                <h2 className="font-headline text-xl font-bold text-[#e3e2e5]">
                  {editingPost ? 'Edit Journal Entry' : 'Publish New Journal Entry'}
                </h2>
              </div>

              {/* Header Right Actions: Logout & Close */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium border border-rose-500/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-md text-[#99907c] hover:text-white hover:bg-[#292a2c] transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* OMDb API Auto-Fill Banner */}
            <div className="p-4 rounded-md bg-[#121315] border border-[#4d4635] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#f2ca50] flex items-center gap-1.5 font-headline">
                  <Sparkles className="w-4 h-4 text-[#f2ca50]" /> Auto-fill Metadata from OMDb API
                </h4>
                <p className="text-[11px] text-[#99907c] mt-0.5 font-label">
                  Search movies, TV series, documentaries, or anime to instantly populate title, plot, cast, director, and poster.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOmdbSearch(!showOmdbSearch)}
                className="px-3.5 py-1.5 rounded-md bg-[#f2ca50] text-[#121315] font-headline font-bold text-xs shadow-sm shrink-0 hover:bg-[#e9c349] transition-all cursor-pointer"
              >
                {showOmdbSearch ? 'Close Search' : 'Search OMDb API'}
              </button>
            </div>

            {/* OMDb Search Accordion */}
            {showOmdbSearch && (
              <div className="p-4 rounded-md bg-[#121315] border border-[#292a2c] space-y-3 font-label">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type movie, TV series, or doc title (e.g. Severance, Succession)..."
                    value={omdbQuery}
                    onChange={(e) => setOmdbQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleOmdbSearch())}
                    className="w-full px-3.5 py-2 rounded-md bg-[#1b1c1e] border border-[#292a2c] text-xs text-[#e3e2e5] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                  />
                  <select
                    value={omdbSearchType}
                    onChange={(e) => setOmdbSearchType(e.target.value)}
                    className="px-3 py-2 rounded-md bg-[#1b1c1e] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50] shrink-0 cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="series">TV Series</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleOmdbSearch}
                    disabled={omdbLoading}
                    className="px-4 py-2 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-bold font-headline text-xs shrink-0 transition-colors cursor-pointer"
                  >
                    {omdbLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {omdbError && (
                  <p className="text-xs text-rose-400 font-medium">{omdbError}</p>
                )}

                {omdbResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2 pt-2 border-t border-[#292a2c]">
                    {omdbResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectOmdbItem(item.imdbID)}
                        className="flex items-center gap-3 p-2 rounded-md bg-[#1b1c1e] hover:bg-[#292a2c] border border-[#292a2c] cursor-pointer transition-colors"
                      >
                        {item.Poster && item.Poster !== 'N/A' ? (
                          <img
                            src={item.Poster}
                            alt={item.Title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-14 object-cover rounded-sm"
                          />
                        ) : (
                          <div className="w-10 h-14 rounded-sm bg-[#0d0e10] flex items-center justify-center text-[#99907c]">
                            <Film className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-[#e3e2e5] font-headline">{item.Title}</h5>
                          <p className="text-[10px] text-[#99907c]">
                            {item.Year} • {item.Type?.toUpperCase()}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-[#f2ca50] px-2 py-1 bg-[#f2ca50]/10 border border-[#f2ca50]/30 rounded-sm cursor-pointer">
                          Import ↓
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Entry Form */}
            <form onSubmit={handleSubmitPost} className="space-y-4 font-label">
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

              {/* Your Star Rating */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-md bg-[#121315] border border-[#292a2c]">
                <div>
                  <label className="block text-xs font-semibold text-[#c6c6c9]">
                    Your Star Rating: <span className="text-[#f2ca50] font-bold ml-1">{userRating.toFixed(1)} / 5.0</span>
                  </label>
                  <p className="text-[10px] text-[#99907c]">Click left half of star for .5, right half for full star</p>
                </div>
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
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] font-journal text-sm leading-relaxed"
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
                  <label htmlFor="isFeatured" className="text-xs font-semibold text-[#c6c6c9] cursor-pointer">
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
