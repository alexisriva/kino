import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlugAction } from '@/actions/postActions';
import { StarRating } from '@/components/StarRating';
import { LikeDislikeButtons } from '@/components/LikeDislikeButtons';
import { ShareModal } from '@/components/ShareModal';
import { Header } from '@/components/Header';
import { ArrowLeft, Film, Tag, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPostBySlugAction(slug);

  if (!res.success || !res.post) {
    return {
      title: 'Post Not Found — Kino',
    };
  }

  const post = res.post;
  return {
    title: `${post.title} (${post.releaseYear || ''}) Review — Kino Journal`,
    description: post.plot || post.review.slice(0, 160),
    openGraph: {
      title: `${post.title} — Kino Review`,
      description: post.plot || post.review.slice(0, 160),
      images: post.posterUrl ? [{ url: post.posterUrl }] : [],
    },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const res = await getPostBySlugAction(slug);

  if (!res.success || !res.post) {
    notFound();
  }

  const post = res.post;
  const tagsList = post.tags ? post.tags.split(',').filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Journal Grid
        </Link>

        {/* Post Hero Section */}
        <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-slate-800/80 p-6 sm:p-10 mb-8 shadow-2xl">
          {/* Atmospheric Backdrop Blur */}
          {post.posterUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-3xl scale-125 pointer-events-none"
              style={{ backgroundImage: `url(${post.posterUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/70 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Poster Card */}
            {post.posterUrl ? (
              <div className="relative group shrink-0 mx-auto md:mx-0">
                <img
                  src={post.posterUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-52 sm:w-64 h-76 sm:h-92 object-cover rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
            ) : (
              <div className="w-52 h-76 rounded-2xl bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-600 border border-slate-800">
                <Film className="w-16 h-16 mb-2" />
                <span className="text-xs font-bold text-center">{post.title}</span>
              </div>
            )}

            {/* Metadata Info */}
            <div className="flex flex-col flex-1 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                  {post.mediaType}
                </span>
                {post.releaseYear && (
                  <span className="text-xs font-semibold text-slate-400">
                    Released: {post.releaseYear}
                  </span>
                )}
                {post.imdbRating && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
                    IMDb: {post.imdbRating}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {post.title}
              </h1>

              {/* Star Rating */}
              <div className="flex items-center gap-3 py-1">
                <span className="text-xs font-bold text-slate-400">Your Rating:</span>
                <StarRating rating={post.userRating || 5.0} size="lg" />
              </div>

              {/* Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                {post.director && (
                  <p>
                    <strong className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">
                      Director
                    </strong>
                    {post.director}
                  </p>
                )}
                {post.cast && (
                  <p>
                    <strong className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">
                      Main Cast
                    </strong>
                    {post.cast}
                  </p>
                )}
                {post.genre && (
                  <p className="sm:col-span-2">
                    <strong className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">
                      Genre
                    </strong>
                    {post.genre}
                  </p>
                )}
              </div>

              {/* Plot Summary */}
              {post.plot && (
                <div className="text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Synopsis / Plot
                  </span>
                  <p className="leading-relaxed italic text-slate-300/90">{post.plot}</p>
                </div>
              )}

              {/* Voting & Sharing */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
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
        <article className="w-full p-6 sm:p-10 rounded-3xl glass-panel border border-slate-800/80 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" /> Journal Entry & Critical Review
          </h2>

          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-light">
            {post.review}
          </div>

          {/* Tags Footer */}
          {tagsList.length > 0 && (
            <div className="pt-6 border-t border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {tagsList.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800"
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
