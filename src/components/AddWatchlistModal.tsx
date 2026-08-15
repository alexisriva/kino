'use client';

import React, { useState, useEffect } from 'react';
import { addToWatchlistAction } from '@/actions/watchlistActions';
import { X, Sparkles, Plus, Film, BookmarkPlus } from 'lucide-react';

interface AddWatchlistModalProps {
  onClose: () => void;
  onAdded: () => void;
}

export function AddWatchlistModal({ onClose, onAdded }: AddWatchlistModalProps) {
  // Prevent background page scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Form state
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState('MOVIE');
  const [releaseYear, setReleaseYear] = useState<number | string>('');
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [plot, setPlot] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [imdbRating, setImdbRating] = useState('');

  // OMDb Search state
  const [omdbQuery, setOmdbQuery] = useState('');
  const [omdbSearchType, setOmdbSearchType] = useState('');
  const [omdbResults, setOmdbResults] = useState<any[]>([]);
  const [omdbLoading, setOmdbLoading] = useState(false);
  const [omdbError, setOmdbError] = useState('');
  const [showOmdbSearch, setShowOmdbSearch] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const res = await addToWatchlistAction({
      title,
      mediaType,
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      genre,
      director,
      cast,
      plot,
      posterUrl,
      imdbRating,
    });

    if (res.success) {
      onAdded();
      onClose();
    } else {
      setFormError(res.error || 'Failed to add item');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-label">
      <div className="relative w-full max-w-xl my-8 p-6 sm:p-8 rounded-lg bg-[#1f2022] border border-[#292a2c] text-[#e3e2e5] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#292a2c] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-6 h-6 text-[#f2ca50]" />
            <h2 className="font-headline text-xl font-bold text-[#e3e2e5]">Add to Watchlist</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#99907c] hover:text-white hover:bg-[#292a2c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OMDb API Auto-Fill Banner */}
        <div className="p-4 rounded-md bg-[#121315] border border-[#4d4635] mb-6 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-[#f2ca50] flex items-center gap-1.5 font-headline">
              <Sparkles className="w-4 h-4 text-[#f2ca50]" /> Auto-fill from OMDb API
            </h4>
            <p className="text-[11px] text-[#99907c] mt-0.5">
              Search movies or series to auto-import poster, director, cast, and plot.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOmdbSearch(!showOmdbSearch)}
            className="px-3 py-1 rounded-md bg-[#f2ca50] text-[#121315] font-headline font-bold text-xs shrink-0 cursor-pointer"
          >
            {showOmdbSearch ? 'Hide Search' : 'Search OMDb'}
          </button>
        </div>

        {/* OMDb Search Box */}
        {showOmdbSearch && (
          <div className="p-4 rounded-md bg-[#121315] border border-[#292a2c] mb-6 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search movie/TV title (e.g. Alien, Succession)..."
                value={omdbQuery}
                onChange={(e) => setOmdbQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleOmdbSearch())}
                className="w-full px-3.5 py-2 rounded-md bg-[#1b1c1e] border border-[#292a2c] text-xs text-[#e3e2e5] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
              />
              <select
                value={omdbSearchType}
                onChange={(e) => setOmdbSearchType(e.target.value)}
                className="px-3 py-2 rounded-md bg-[#1b1c1e] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50] cursor-pointer"
              >
                <option value="">All</option>
                <option value="movie">Movies</option>
                <option value="series">Series</option>
              </select>
              <button
                type="button"
                onClick={handleOmdbSearch}
                disabled={omdbLoading}
                className="px-4 py-2 rounded-md bg-[#f2ca50] text-[#121315] font-headline font-bold text-xs shrink-0 cursor-pointer"
              >
                {omdbLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {omdbError && <p className="text-xs text-rose-400">{omdbError}</p>}

            {omdbResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2 pt-2 border-t border-[#292a2c]">
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
                        className="w-8 h-12 object-cover rounded-sm"
                      />
                    ) : (
                      <div className="w-8 h-12 rounded-sm bg-[#0d0e10] flex items-center justify-center text-[#99907c]">
                        <Film className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-[#e3e2e5] font-headline">{item.Title}</h5>
                      <p className="text-[10px] text-[#99907c]">{item.Year} • {item.Type?.toUpperCase()}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#f2ca50] px-2 py-1 bg-[#f2ca50]/10 border border-[#f2ca50]/30 rounded-sm">
                      Import ↓
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Watchlist Item Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">Category</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">Release Year</label>
              <input
                type="number"
                placeholder="e.g. 2024"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">Genre</label>
              <input
                type="text"
                placeholder="e.g. Sci-Fi, Drama"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">Director</label>
              <input
                type="text"
                placeholder="Director..."
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">Poster URL</label>
              <input
                type="text"
                placeholder="https://image.jpg"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c6c6c9] mb-1">Plot Summary</label>
            <textarea
              rows={2}
              placeholder="Short plot..."
              value={plot}
              onChange={(e) => setPlot(e.target.value)}
              className="w-full px-3.5 py-2 rounded-md bg-[#121315] border border-[#292a2c] text-xs text-[#e3e2e5] focus:outline-none focus:border-[#f2ca50]"
            />
          </div>

          {formError && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#292a2c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-[#1b1c1e] text-[#c6c6c9] font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-md bg-[#f2ca50] text-[#121315] font-headline font-bold text-xs shadow-md cursor-pointer"
            >
              {submitting ? 'Adding...' : 'Add to Watchlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
