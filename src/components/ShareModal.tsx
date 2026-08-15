"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, ExternalLink, X } from "lucide-react";

interface ShareModalProps {
  title: string;
  slug: string;
}

export function ShareModal({ title, slug }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Prevent background scrolling when share modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
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
          title: `KINO — ${title}`,
          text: `Check out this review of "${title}" on KINO!`,
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
    `Check out this review of "${title}" on KINO!`,
  )}&url=${encodeURIComponent(getShareUrl())}`;

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#1b1c1e] text-[#c6c6c9] hover:bg-[#292a2c] hover:text-white border border-[#292a2c] text-xs font-semibold font-label transition-all cursor-pointer"
        title="Share review"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-lg bg-[#1f2022] border border-[#292a2c] text-[#e3e2e5] shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#99907c] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-headline text-lg font-bold mb-1 flex items-center gap-2 text-[#f2ca50]">
              <Share2 className="w-5 h-5" /> Share Entry
            </h3>
            <p className="text-xs text-[#99907c] mb-5 font-label">
              Share <strong className="text-[#e3e2e5]">{title}</strong> with
              fellow film lovers.
            </p>

            <div className="space-y-3 font-label">
              {/* Copy Link Input */}
              <div className="flex items-center gap-2 p-1.5 rounded-md bg-[#121315] border border-[#292a2c]">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="w-full px-3 py-1.5 bg-transparent text-xs text-[#c6c6c9] focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-bold text-xs shrink-0 transition-colors cursor-pointer"
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
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-[#1b1c1e] hover:bg-[#292a2c] text-[#e3e2e5] border border-[#292a2c] font-semibold text-xs transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 fill-current text-[#f2ca50]"
                  viewBox="0 0 24 24"
                >
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
