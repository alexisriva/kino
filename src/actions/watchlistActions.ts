'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';

export interface AddWatchlistInput {
  title: string;
  mediaType?: string;
  releaseYear?: number;
  genre?: string;
  director?: string;
  cast?: string;
  plot?: string;
  posterUrl?: string;
  imdbRating?: string;
}

// Retroactive sync function: Ensures all published Posts are mirrored in Watchlist as WATCHED
export async function syncAllPostsToWatchlistAction() {
  try {
    const allPosts = await prisma.post.findMany();
    let createdCount = 0;
    let linkedCount = 0;

    for (const post of allPosts) {
      // Check if WatchlistItem already exists for this post (by postId or matching title)
      const existingItem = await prisma.watchlistItem.findFirst({
        where: {
          OR: [
            { postId: post.id },
            { title: { equals: post.title } },
          ],
        },
      });

      if (existingItem) {
        if (!existingItem.isWatched || existingItem.postId !== post.id) {
          await prisma.watchlistItem.update({
            where: { id: existingItem.id },
            data: {
              isWatched: true,
              postId: post.id,
              posterUrl: post.posterUrl || existingItem.posterUrl,
              director: post.director || existingItem.director,
              cast: post.cast || existingItem.cast,
              plot: post.plot || existingItem.plot,
            },
          });
          linkedCount++;
        }
      } else {
        // Create new watched item for pre-existing post
        await prisma.watchlistItem.create({
          data: {
            title: post.title,
            mediaType: post.mediaType || 'MOVIE',
            releaseYear: post.releaseYear,
            genre: post.genre,
            director: post.director,
            cast: post.cast,
            plot: post.plot,
            posterUrl: post.posterUrl,
            imdbRating: post.imdbRating,
            isWatched: true,
            postId: post.id,
          },
        });
        createdCount++;
      }
    }

    revalidatePath('/');
    return {
      success: true,
      message: `Sync complete: ${createdCount} created, ${linkedCount} updated.`,
    };
  } catch (error: any) {
    console.error('Error syncing posts to watchlist:', error);
    return { success: false, error: 'Failed to sync posts to watchlist' };
  }
}

// Fetch Watchlist items (with automatic retroactive sync for pre-existing posts)
export async function getWatchlistAction(params?: {
  isWatched?: boolean;
  category?: string;
  search?: string;
}) {
  try {
    // Ensure all existing posts are synced retroactively
    await syncAllPostsToWatchlistAction();

    const where: any = {};

    if (typeof params?.isWatched === 'boolean') {
      where.isWatched = params.isWatched;
    }

    if (params?.category && params.category !== 'ALL') {
      where.mediaType = params.category;
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q } },
        { director: { contains: q } },
        { cast: { contains: q } },
        { genre: { contains: q } },
      ];
    }

    const items = await prisma.watchlistItem.findMany({
      where,
      include: {
        post: {
          select: {
            id: true,
            slug: true,
            userRating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const unwatchedCount = await prisma.watchlistItem.count({
      where: { isWatched: false },
    });

    const watchedCount = await prisma.watchlistItem.count({
      where: { isWatched: true },
    });

    return {
      success: true,
      items,
      unwatchedCount,
      watchedCount,
    };
  } catch (error: any) {
    console.error('Error fetching watchlist:', error);
    return { success: false, error: 'Failed to fetch watchlist' };
  }
}

// Add Item to Watchlist (Admin Only)
export async function addToWatchlistAction(input: AddWatchlistInput) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    if (!input.title || !input.title.trim()) {
      return { success: false, error: 'Title is required' };
    }

    const item = await prisma.watchlistItem.create({
      data: {
        title: input.title.trim(),
        mediaType: input.mediaType || 'MOVIE',
        releaseYear: input.releaseYear || null,
        genre: input.genre?.trim() || null,
        director: input.director?.trim() || null,
        cast: input.cast?.trim() || null,
        plot: input.plot?.trim() || null,
        posterUrl: input.posterUrl?.trim() || null,
        imdbRating: input.imdbRating?.trim() || null,
        isWatched: false,
      },
    });

    revalidatePath('/');
    return { success: true, item };
  } catch (error: any) {
    console.error('Error adding to watchlist:', error);
    return { success: false, error: 'Failed to add item to watchlist' };
  }
}

// Delete Watchlist Item (Admin Only)
export async function deleteWatchlistItemAction(id: string) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    await prisma.watchlistItem.delete({
      where: { id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting watchlist item:', error);
    return { success: false, error: 'Failed to delete watchlist item' };
  }
}
