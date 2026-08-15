'use server';

import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/auth';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function getPostsAction(params?: {
  category?: string;
  search?: string;
  tag?: string;
  sort?: string;
}) {
  try {
    const { category, search, tag, sort } = params || {};

    let where: any = { isPublished: true };

    if (category && category !== 'ALL') {
      where.mediaType = category.toUpperCase();
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { director: { contains: search } },
        { cast: { contains: search } },
        { genre: { contains: search } },
        { review: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'rating') {
      orderBy = { userRating: 'desc' };
    } else if (sort === 'likes') {
      orderBy = { likesCount: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy,
    });

    return { success: true, posts };
  } catch (error: any) {
    console.error('getPostsAction error:', error);
    return { success: false, error: error.message || 'Failed to fetch posts', posts: [] };
  }
}

export async function getPostBySlugAction(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        votes: true,
      },
    });

    if (!post) {
      return { success: false, error: 'Post not found', post: null };
    }

    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error fetching post', post: null };
  }
}

export async function createPostAction(data: {
  title: string;
  slug?: string;
  mediaType: string;
  releaseYear?: number;
  genre?: string;
  director?: string;
  cast?: string;
  plot?: string;
  posterUrl?: string;
  imdbRating?: string;
  userRating?: number;
  review: string;
  tags?: string;
  isFeatured?: boolean;
  watchlistItemId?: string;
}) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    const generatedSlug =
      data.slug ||
      `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${data.releaseYear || new Date().getFullYear()}`;

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: generatedSlug,
        mediaType: data.mediaType || 'MOVIE',
        releaseYear: data.releaseYear ? Number(data.releaseYear) : null,
        genre: data.genre || '',
        director: data.director || '',
        cast: data.cast || '',
        plot: data.plot || '',
        posterUrl: data.posterUrl || '',
        imdbRating: data.imdbRating || '',
        userRating: data.userRating ? Number(data.userRating) : 5.0,
        review: data.review,
        tags: data.tags || '',
        isFeatured: Boolean(data.isFeatured),
        isPublished: true,
      },
    });

    // Handle Watchlist linking or creation
    let watchlistItemToLink = null;
    if (data.watchlistItemId) {
      watchlistItemToLink = await prisma.watchlistItem.findUnique({
        where: { id: data.watchlistItemId },
      });
    }

    // Check if an existing Watchlist item matches by title (case-insensitive)
    if (!watchlistItemToLink) {
      watchlistItemToLink = await prisma.watchlistItem.findFirst({
        where: {
          title: { equals: data.title },
        },
      });
    }

    if (watchlistItemToLink) {
      // Mark existing item as watched & link to new post
      await prisma.watchlistItem.update({
        where: { id: watchlistItemToLink.id },
        data: {
          isWatched: true,
          postId: post.id,
          posterUrl: data.posterUrl || watchlistItemToLink.posterUrl,
          director: data.director || watchlistItemToLink.director,
          cast: data.cast || watchlistItemToLink.cast,
          plot: data.plot || watchlistItemToLink.plot,
          genre: data.genre || watchlistItemToLink.genre,
          releaseYear: data.releaseYear || watchlistItemToLink.releaseYear,
        },
      });
    } else {
      // Create new Watchlist item marked as WATCHED
      await prisma.watchlistItem.create({
        data: {
          title: data.title,
          mediaType: data.mediaType || 'MOVIE',
          releaseYear: data.releaseYear ? Number(data.releaseYear) : null,
          genre: data.genre || null,
          director: data.director || null,
          cast: data.cast || null,
          plot: data.plot || null,
          posterUrl: data.posterUrl || null,
          imdbRating: data.imdbRating || null,
          isWatched: true,
          postId: post.id,
        },
      });
    }

    revalidatePath('/');
    revalidatePath(`/post/${post.slug}`);
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create post' };
  }
}

export async function updatePostAction(
  id: string,
  data: {
    title?: string;
    mediaType?: string;
    releaseYear?: number;
    genre?: string;
    director?: string;
    cast?: string;
    plot?: string;
    posterUrl?: string;
    imdbRating?: string;
    userRating?: number;
    review?: string;
    tags?: string;
    isFeatured?: boolean;
  }
) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        releaseYear: data.releaseYear ? Number(data.releaseYear) : undefined,
        userRating: data.userRating ? Number(data.userRating) : undefined,
      },
    });

    // Keep linked Watchlist item synced if title/metadata updated
    const linkedItem = await prisma.watchlistItem.findFirst({
      where: { postId: post.id },
    });
    if (linkedItem) {
      await prisma.watchlistItem.update({
        where: { id: linkedItem.id },
        data: {
          title: post.title,
          mediaType: post.mediaType,
          releaseYear: post.releaseYear,
          genre: post.genre,
          director: post.director,
          cast: post.cast,
          plot: post.plot,
          posterUrl: post.posterUrl,
          imdbRating: post.imdbRating,
        },
      });
    }

    revalidatePath('/');
    revalidatePath(`/post/${post.slug}`);
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update post' };
  }
}

export async function deletePostAction(id: string) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    const post = await prisma.post.delete({
      where: { id },
    });

    revalidatePath('/');
    return { success: true, message: 'Post deleted successfully' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete post' };
  }
}

export async function toggleVoteAction(
  postId: string,
  voteType: 'LIKE' | 'DISLIKE',
  deviceToken: string
) {
  try {
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0] ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const rawIdentifier = `${clientIp}_${deviceToken}`;
    const voterHash = crypto.createHash('sha256').update(rawIdentifier).digest('hex');

    const existingVote = await prisma.vote.findUnique({
      where: {
        postId_voterHash: {
          postId,
          voterHash,
        },
      },
    });

    let currentPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!currentPost) {
      return { success: false, error: 'Post not found' };
    }

    let userVote: 'LIKE' | 'DISLIKE' | null = null;

    if (!existingVote) {
      // Create new vote
      await prisma.vote.create({
        data: {
          postId,
          voterHash,
          voteType,
        },
      });

      const updateField = voteType === 'LIKE' ? { likesCount: { increment: 1 } } : { dislikesCount: { increment: 1 } };
      currentPost = await prisma.post.update({
        where: { id: postId },
        data: updateField,
      });
      userVote = voteType;
    } else if (existingVote.voteType === voteType) {
      // User clicked same vote -> toggle off / remove vote
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      const updateField = voteType === 'LIKE' ? { likesCount: { decrement: 1 } } : { dislikesCount: { decrement: 1 } };
      currentPost = await prisma.post.update({
        where: { id: postId },
        data: updateField,
      });
      userVote = null;
    } else {
      // User switched vote (from LIKE to DISLIKE or vice-versa)
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });

      const updateField =
        voteType === 'LIKE'
          ? { likesCount: { increment: 1 }, dislikesCount: { decrement: 1 } }
          : { dislikesCount: { increment: 1 }, likesCount: { decrement: 1 } };

      currentPost = await prisma.post.update({
        where: { id: postId },
        data: updateField,
      });
      userVote = voteType;
    }

    revalidatePath('/');
    revalidatePath(`/post/${currentPost.slug}`);

    return {
      success: true,
      likesCount: currentPost.likesCount,
      dislikesCount: currentPost.dislikesCount,
      userVote,
    };
  } catch (error: any) {
    console.error('toggleVoteAction error:', error);
    return { success: false, error: error.message || 'Failed to register vote' };
  }
}

export async function getUserVoteStatusAction(postId: string, deviceToken: string) {
  try {
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0] ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const rawIdentifier = `${clientIp}_${deviceToken}`;
    const voterHash = crypto.createHash('sha256').update(rawIdentifier).digest('hex');

    const vote = await prisma.vote.findUnique({
      where: {
        postId_voterHash: {
          postId,
          voterHash,
        },
      },
    });

    return { success: true, userVote: vote ? vote.voteType : null };
  } catch (error) {
    return { success: false, userVote: null };
  }
}
