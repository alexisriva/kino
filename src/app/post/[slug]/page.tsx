import React from "react";
import { notFound } from "next/navigation";
import { getPostBySlugAction } from "@/actions/postActions";
import { PostDetailContent } from "./PostDetailContent";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; tab?: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPostBySlugAction(slug);

  if (!res.success || !res.post) {
    return {
      title: "Post Not Found — KINO",
    };
  }

  const post = res.post;
  return {
    title: `${post.title} (${post.releaseYear || ""}) Review — KINO Journal`,
    description: post.plot || post.review.slice(0, 160),
    openGraph: {
      title: `${post.title} — KINO Review`,
      description: post.plot || post.review.slice(0, 160),
      images: post.posterUrl ? [{ url: post.posterUrl }] : [],
    },
  };
}

export default async function PostDetailPage({
  params,
  searchParams,
}: PostPageProps) {
  const { slug } = await params;
  const { from, tab } = await searchParams;
  const res = await getPostBySlugAction(slug);

  if (!res.success || !res.post) {
    notFound();
  }

  const post = res.post;
  const tagsList = post.tags ? post.tags.split(",").filter(Boolean) : [];
  const isFromWatchlist = from === "watchlist";
  const backTargetUrl = isFromWatchlist
    ? tab
      ? `/watchlist?tab=${tab}`
      : "/watchlist?tab=watched"
    : "/";

  return (
    <PostDetailContent
      post={post}
      isFromWatchlist={isFromWatchlist}
      backTargetUrl={backTargetUrl}
      tagsList={tagsList}
    />
  );
}
