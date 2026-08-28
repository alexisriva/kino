'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { isAdminAuthenticated } from '@/lib/auth';

export interface CreateWatchRequestInput {
  title: string;
  mediaType?: string;
  releaseYear?: number;
  genre?: string;
  director?: string;
  cast?: string;
  plot?: string;
  posterUrl?: string;
  imdbRating?: string;
  requesterName?: string;
  requesterNote?: string;
  deviceToken?: string;
}

// Helper to compute requester hash for anonymous rate limiting
async function getRequesterHash(deviceToken?: string): Promise<string> {
  const headerList = await headers();
  const clientIp =
    headerList.get('x-forwarded-for')?.split(',')[0] ||
    headerList.get('x-real-ip') ||
    '127.0.0.1';

  const rawIdentifier = `${clientIp}_${deviceToken || 'anonymous'}`;
  return crypto.createHash('sha256').update(rawIdentifier).digest('hex');
}

// Create or Increment Watch Request (Anonymous or Admin)
export async function createWatchRequestAction(input: CreateWatchRequestInput) {
  try {
    if (!input.title || !input.title.trim()) {
      return { success: false, error: 'Title is required' };
    }

    const trimmedTitle = input.title.trim();
    const mediaType = input.mediaType || 'MOVIE';
    const requesterHash = await getRequesterHash(input.deviceToken);

    // Rate Limiting: Max 5 submissions in the last 1 hour per client
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSubmissionsCount = await prisma.watchRequest.count({
      where: {
        requesterHash,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentSubmissionsCount >= 5) {
      return {
        success: false,
        error: 'Rate limit reached. You can submit up to 5 requests per hour. Please try again later.',
      };
    }

    // Check if an existing pending request exists for this title & mediaType
    const existingRequests = await prisma.watchRequest.findMany({
      where: {
        mediaType,
      },
    });

    const matchingExisting = existingRequests.find(
      (r) => r.title.trim().toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (matchingExisting) {
      // Append note if provided
      let combinedNote = matchingExisting.requesterNote;
      if (input.requesterNote?.trim()) {
        const newNote = input.requesterName?.trim()
          ? `${input.requesterName.trim()}: "${input.requesterNote.trim()}"`
          : `"${input.requesterNote.trim()}"`;
        combinedNote = combinedNote ? `${combinedNote}\n${newNote}` : newNote;
      }

      const updated = await prisma.watchRequest.update({
        where: { id: matchingExisting.id },
        data: {
          requestCount: { increment: 1 },
          posterUrl: matchingExisting.posterUrl || input.posterUrl?.trim() || null,
          director: matchingExisting.director || input.director?.trim() || null,
          cast: matchingExisting.cast || input.cast?.trim() || null,
          plot: matchingExisting.plot || input.plot?.trim() || null,
          genre: matchingExisting.genre || input.genre?.trim() || null,
          imdbRating: matchingExisting.imdbRating || input.imdbRating?.trim() || null,
          requesterNote: combinedNote,
        },
      });

      revalidatePath('/watchlist');
      return {
        success: true,
        item: updated,
        message: `Request recorded! This title has now been requested ${updated.requestCount} times.`,
      };
    }

    // Format initial note if name provided
    let initialNote = input.requesterNote?.trim() || null;
    if (initialNote && input.requesterName?.trim()) {
      initialNote = `${input.requesterName.trim()}: "${initialNote}"`;
    }

    const item = await prisma.watchRequest.create({
      data: {
        title: trimmedTitle,
        mediaType,
        releaseYear: input.releaseYear || null,
        genre: input.genre?.trim() || null,
        director: input.director?.trim() || null,
        cast: input.cast?.trim() || null,
        plot: input.plot?.trim() || null,
        posterUrl: input.posterUrl?.trim() || null,
        imdbRating: input.imdbRating?.trim() || null,
        requesterName: input.requesterName?.trim() || null,
        requesterNote: initialNote,
        requestCount: 1,
        requesterHash,
      },
    });

    revalidatePath('/watchlist');
    return {
      success: true,
      item,
      message: 'Your watch request has been submitted successfully!',
    };
  } catch (error: any) {
    console.error('Error creating watch request:', error);
    return { success: false, error: 'Failed to submit watch request' };
  }
}

// Fetch Watch Requests (Admin Only)
export async function getWatchRequestsAction(params?: {
  category?: string;
  search?: string;
}) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin access required', items: [], totalCount: 0 };
  }

  try {
    const where: any = {};

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
        { requesterName: { contains: q } },
        { requesterNote: { contains: q } },
      ];
    }

    const items = await prisma.watchRequest.findMany({
      where,
      orderBy: [
        { requestCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const totalCount = await prisma.watchRequest.count();

    return {
      success: true,
      items,
      totalCount,
    };
  } catch (error: any) {
    console.error('Error fetching watch requests:', error);
    return { success: false, error: 'Failed to fetch watch requests', items: [], totalCount: 0 };
  }
}

// Accept Watch Request: Creates WatchlistItem and removes Request (Admin Only)
export async function acceptWatchRequestAction(requestId: string) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    const request = await prisma.watchRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { success: false, error: 'Watch request not found' };
    }

    // Create item in Watchlist as Queued (isWatched: false)
    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        title: request.title,
        mediaType: request.mediaType,
        releaseYear: request.releaseYear,
        genre: request.genre,
        director: request.director,
        cast: request.cast,
        plot: request.plot,
        posterUrl: request.posterUrl,
        imdbRating: request.imdbRating,
        isWatched: false,
      },
    });

    // Permanently remove the request from the database
    await prisma.watchRequest.delete({
      where: { id: requestId },
    });

    revalidatePath('/');
    revalidatePath('/watchlist');
    return {
      success: true,
      watchlistItem,
      message: `"${request.title}" added to your watchlist queue!`,
    };
  } catch (error: any) {
    console.error('Error accepting watch request:', error);
    return { success: false, error: 'Failed to accept watch request' };
  }
}

// Reject Watch Request: Permanently deletes the request (Admin Only)
export async function rejectWatchRequestAction(requestId: string) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    const request = await prisma.watchRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { success: false, error: 'Watch request not found' };
    }

    // Permanently remove from database
    await prisma.watchRequest.delete({
      where: { id: requestId },
    });

    revalidatePath('/watchlist');
    return {
      success: true,
      message: `Request for "${request.title}" was rejected and removed.`,
    };
  } catch (error: any) {
    console.error('Error rejecting watch request:', error);
    return { success: false, error: 'Failed to reject watch request' };
  }
}
