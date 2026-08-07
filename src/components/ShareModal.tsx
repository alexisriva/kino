'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, X } from 'lucide-react';

interface ShareModalProps {
  title: string;
  slug: string;
}

export function ShareModal({ title, slug }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/post/${slug}`;
    }
    return `/post/${slug}`;
  };

  const handleCopy = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kino — ${title}`,
          text: `Check out this review of "${title}" on Kino!`,
          url: url,
        });
      } catch (error) {
        // Share cancelled
      }
    } else {
      setIsOpen(true);
    }
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out this review of "${title}" on Kino!`
  )}&url=${encodeURIComponent(getShareUrl())}`;

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-cyan-400 border border-slate-700/50 text-xs font-medium transition-all"
        title="Share review"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 rounded-2xl glass-modal shadow-2xl border border-slate-700/50 text-slate-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 text-cyan-400">
              <Share2 className="w-5 h-5" /> Share Entry
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Share <strong className="text-slate-200">{title}</strong> with your friends and fellow film lovers.
            </p>

            <div className="space-y-3">
              {/* Copy Link Input */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="w-full px-3 py-1.5 bg-transparent text-xs text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>

              {/* Twitter / X Share Button */}
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 font-medium text-xs transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X (Twitter)
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
