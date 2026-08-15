import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlugAction } from '@/actions/postActions';
import { StarRating } from '@/components/StarRating';
import { LikeDislikeButtons } from '@/components/LikeDislikeButtons';
import { ShareModal } from '@/components/ShareModal';
import { Header } from '@/components/Header';
import { ArrowLeft, Film, Tag, Star } from 'lucide-react';
import type { Metadata } from 'next';

interface PostPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; tab?: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPostBySlugAction(slug);

  if (!res.success || !res.post) {
    return {
      title: 'Post Not Found — KINO',
    };
  }

  const post = res.post;
  return {
    title: `${post.title} (${post.releaseYear || ''}) Review — KINO Journal`,
    description: post.plot || post.review.slice(0, 160),
    openGraph: {
      title: `${post.title} — KINO Review`,
      description: post.plot || post.review.slice(0, 160),
      images: post.posterUrl ? [{ url: post.posterUrl }] : [],
    },
  };
}

export default async function PostDetailPage({ params, searchParams }: PostPageProps) {
  const { slug } = await params;
  const { from, tab } = await searchParams;
  const res = await getPostBySlugAction(slug);

  if (!res.success || !res.post) {
    notFound();
  }

  const post = res.post;
  const tagsList = post.tags ? post.tags.split(',').filter(Boolean) : [];
  const isFromWatchlist = from === 'watchlist';
  const backTargetUrl = isFromWatchlist
    ? tab
      ? `/watchlist?tab=${tab}`
      : '/watchlist?tab=watched'
    : '/';

  return (
    <div className="min-h-screen bg-[#121315] text-[#e3e2e5] flex flex-col selection:bg-[#f2ca50] selection:text-[#121315]">
      {/* Header */}
      <Header currentView={isFromWatchlist ? 'watchlist' : 'journal'} />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full py-8">
        {/* Back Link */}
        <Link
          href={backTargetUrl}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#99907c] hover:text-[#f2ca50] mb-6 transition-colors font-label cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />{' '}
          {isFromWatchlist ? 'Back to Watchlist' : 'Back to Journal Grid'}
        </Link>

        {/* Post Hero Section */}
        <div className="relative w-full rounded-lg bg-[#1b1c1e] border border-[#292a2c] p-6 sm:p-10 mb-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Poster Card */}
            {post.posterUrl ? (
              <div className="relative shrink-0 mx-auto md:mx-0 w-52 sm:w-64 aspect-[2/3] overflow-hidden rounded-md bg-[#0d0e10] border border-[#292a2c]">
                <img
                  src={post.posterUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-52 h-76 rounded-md bg-[#0d0e10] flex flex-col items-center justify-center p-4 text-[#99907c] border border-[#292a2c]">
                <Film className="w-16 h-16 mb-2" />
                <span className="text-xs font-bold text-center">{post.title}</span>
              </div>
            )}

            {/* Metadata Info */}
            <div className="flex flex-col flex-1 space-y-4 text-left font-label">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-sm bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30 text-xs font-bold uppercase tracking-wider">
                  {post.mediaType}
                </span>
                {post.releaseYear && (
                  <span className="text-xs font-semibold text-[#99907c]">
                    Released: {post.releaseYear}
                  </span>
                )}
                {post.imdbRating && (
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#292a2c] text-[#f2ca50] border border-[#f2ca50]/30 text-xs font-bold">
                    IMDb: {post.imdbRating}
                  </span>
                )}
              </div>

              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#e3e2e5] tracking-tight leading-tight">
                {post.title}
              </h1>

              {/* Star Rating */}
              <div className="flex items-center gap-3 py-1">
                <span className="text-xs font-bold text-[#99907c]">Your Rating:</span>
                <StarRating rating={post.userRating || 5.0} size="lg" />
              </div>

              {/* Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#e3e2e5] p-4 rounded-md bg-[#121315] border border-[#292a2c]">
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
                  <p className="font-journal text-sm leading-relaxed italic text-[#d0c5af]">{post.plot}</p>
                </div>
              )}

              {/* Voting & Sharing */}
              <div className="pt-4 border-t border-[#292a2c] flex flex-wrap items-center justify-between gap-4">
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

        {/* Detailed Journal Review Content */}
        <article className="w-full p-6 sm:p-10 rounded-lg bg-[#1b1c1e] border border-[#292a2c] space-y-6">
          <h2 className="font-headline text-2xl font-bold text-[#e3e2e5] flex items-center gap-2 border-b border-[#292a2c] pb-4">
            <Star className="w-5 h-5 text-[#f2ca50] fill-[#f2ca50]" /> Journal Entry & Critical Review
          </h2>

          <div className="font-journal text-[#d0c5af] text-lg leading-relaxed space-y-4 whitespace-pre-line">
            {post.review}
          </div>

          {/* Tags Footer */}
          {tagsList.length > 0 && (
            <div className="pt-6 border-t border-[#292a2c] flex items-center gap-2 flex-wrap font-label">
              <span className="text-xs font-semibold text-[#99907c] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#f2ca50]" /> Tags:
              </span>
              {tagsList.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-sm bg-[#121315] text-[#c6c6c9] text-xs font-medium border border-[#292a2c]"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
