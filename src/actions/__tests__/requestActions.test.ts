import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createWatchRequestAction,
  getWatchRequestsAction,
  acceptWatchRequestAction,
  rejectWatchRequestAction,
} from '@/actions/requestActions';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    watchRequest: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    watchlistItem: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  isAdminAuthenticated: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(
    new Map([
      ['x-forwarded-for', '192.168.1.1, 10.0.0.1'],
    ])
  ),
}));

describe('requestActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWatchRequestAction', () => {
    it('returns error if title is empty or missing', async () => {
      const res = await createWatchRequestAction({ title: '   ' });
      expect(res).toEqual({ success: false, error: 'Title is required' });
    });

    it('blocks request if rate limit (>= 5 in last hour) is exceeded', async () => {
      vi.mocked(prisma.watchRequest.count).mockResolvedValueOnce(5);

      const res = await createWatchRequestAction({ title: 'Dune: Part Two' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Rate limit reached');
    });

    it('creates a new watch request when no duplicate exists', async () => {
      vi.mocked(prisma.watchRequest.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.watchRequest.findMany).mockResolvedValueOnce([]);
      vi.mocked(prisma.watchRequest.create).mockResolvedValueOnce({
        id: 'new-req-1',
        title: 'Arrival',
        mediaType: 'MOVIE',
        releaseYear: 2016,
        genre: 'Sci-Fi',
        director: 'Denis Villeneuve',
        cast: 'Amy Adams',
        plot: 'Linguist communicates with aliens.',
        posterUrl: 'https://example.com/arrival.jpg',
        imdbRating: '7.9',
        requesterName: 'Alex',
        requesterNote: 'Alex: "Great sci-fi"',
        requestCount: 1,
        requesterHash: 'somehash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await createWatchRequestAction({
        title: 'Arrival',
        mediaType: 'MOVIE',
        releaseYear: 2016,
        genre: 'Sci-Fi',
        director: 'Denis Villeneuve',
        cast: 'Amy Adams',
        plot: 'Linguist communicates with aliens.',
        posterUrl: 'https://example.com/arrival.jpg',
        imdbRating: '7.9',
        requesterName: 'Alex',
        requesterNote: 'Great sci-fi',
      });

      expect(res.success).toBe(true);
      expect(res.item?.id).toBe('new-req-1');
      expect(prisma.watchRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Arrival',
            mediaType: 'MOVIE',
            requestCount: 1,
            requesterNote: 'Alex: "Great sci-fi"',
          }),
        })
      );
    });

    it('increments requestCount and appends note when duplicate title exists', async () => {
      vi.mocked(prisma.watchRequest.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.watchRequest.findMany).mockResolvedValueOnce([
        {
          id: 'existing-req-1',
          title: 'Arrival',
          mediaType: 'MOVIE',
          releaseYear: 2016,
          genre: 'Sci-Fi',
          director: 'Denis Villeneuve',
          cast: null,
          plot: null,
          posterUrl: null,
          imdbRating: null,
          requesterName: 'Bob',
          requesterNote: 'Bob: "Classic"',
          requestCount: 1,
          requesterHash: 'hash1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      vi.mocked(prisma.watchRequest.update).mockResolvedValueOnce({
        id: 'existing-req-1',
        title: 'Arrival',
        mediaType: 'MOVIE',
        releaseYear: 2016,
        genre: 'Sci-Fi',
        director: 'Denis Villeneuve',
        cast: null,
        plot: null,
        posterUrl: 'https://example.com/arrival.jpg',
        imdbRating: null,
        requesterName: 'Bob',
        requesterNote: 'Bob: "Classic"\nCharlie: "Must watch"',
        requestCount: 2,
        requesterHash: 'hash1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await createWatchRequestAction({
        title: 'Arrival',
        mediaType: 'MOVIE',
        posterUrl: 'https://example.com/arrival.jpg',
        requesterName: 'Charlie',
        requesterNote: 'Must watch',
      });

      expect(res.success).toBe(true);
      expect(res.message).toContain('requested 2 times');
      expect(prisma.watchRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'existing-req-1' },
          data: expect.objectContaining({
            requestCount: { increment: 1 },
            posterUrl: 'https://example.com/arrival.jpg',
            requesterNote: 'Bob: "Classic"\nCharlie: "Must watch"',
          }),
        })
      );
    });

    it('handles unexpected exceptions during create', async () => {
      vi.mocked(prisma.watchRequest.count).mockRejectedValueOnce(new Error('DB Connection Failed'));

      const res = await createWatchRequestAction({ title: 'Arrival' });
      expect(res).toEqual({ success: false, error: 'Failed to submit watch request' });
    });
  });

  describe('getWatchRequestsAction', () => {
    it('returns unauthorized error if not admin', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(false);

      const res = await getWatchRequestsAction();
      expect(res.success).toBe(false);
      expect(res.error).toContain('Unauthorized');
    });

    it('fetches watch requests with filters when admin authenticated', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
      vi.mocked(prisma.watchRequest.findMany).mockResolvedValueOnce([
        {
          id: 'req-1',
          title: 'Severance',
          mediaType: 'TV',
          releaseYear: 2022,
          genre: 'Sci-Fi',
          director: 'Ben Stiller',
          cast: 'Adam Scott',
          plot: 'Office thrill.',
          posterUrl: null,
          imdbRating: '8.7',
          requesterName: 'Alice',
          requesterNote: 'Awesome',
          requestCount: 3,
          requesterHash: 'hash',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      vi.mocked(prisma.watchRequest.count).mockResolvedValueOnce(1);

      const res = await getWatchRequestsAction({ category: 'TV', search: 'Severance' });
      expect(res.success).toBe(true);
      expect(res.items).toHaveLength(1);
      expect(res.totalCount).toBe(1);
      expect(prisma.watchRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            mediaType: 'TV',
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('handles database error when fetching requests', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
      vi.mocked(prisma.watchRequest.findMany).mockRejectedValueOnce(new Error('Fetch error'));

      const res = await getWatchRequestsAction();
      expect(res.success).toBe(false);
      expect(res.error).toContain('Failed to fetch watch requests');
    });
  });

  describe('acceptWatchRequestAction', () => {
    it('returns unauthorized error if not admin', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(false);

      const res = await acceptWatchRequestAction('req-1');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Unauthorized');
    });

    it('returns error if request is not found', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
      vi.mocked(prisma.watchRequest.findUnique).mockResolvedValueOnce(null);

      const res = await acceptWatchRequestAction('nonexistent');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Watch request not found');
    });

    it('creates watchlistItem and deletes watch request when accepted', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
      vi.mocked(prisma.watchRequest.findUnique).mockResolvedValueOnce({
        id: 'req-1',
        title: 'Dune: Part Two',
        mediaType: 'MOVIE',
        releaseYear: 2024,
        genre: 'Sci-Fi',
        director: 'Denis Villeneuve',
        cast: 'Timothée Chalamet',
        plot: 'Fremen uprising.',
        posterUrl: 'https://example.com/dune2.jpg',
        imdbRating: '8.6',
        requesterName: 'Alice',
        requesterNote: 'Epic',
        requestCount: 2,
        requesterHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.watchlistItem.create).mockResolvedValueOnce({
        id: 'item-new',
        title: 'Dune: Part Two',
        mediaType: 'MOVIE',
        releaseYear: 2024,
        genre: 'Sci-Fi',
        director: 'Denis Villeneuve',
        cast: 'Timothée Chalamet',
        plot: 'Fremen uprising.',
        posterUrl: 'https://example.com/dune2.jpg',
        imdbRating: '8.6',
        isWatched: false,
        postId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.watchRequest.delete).mockResolvedValueOnce({} as any);

      const res = await acceptWatchRequestAction('req-1');
      expect(res.success).toBe(true);
      expect(res.message).toContain('"Dune: Part Two" added to your watchlist queue!');
      expect(prisma.watchlistItem.create).toHaveBeenCalledWith({
        data: {
          title: 'Dune: Part Two',
          mediaType: 'MOVIE',
          releaseYear: 2024,
          genre: 'Sci-Fi',
          director: 'Denis Villeneuve',
          cast: 'Timothée Chalamet',
          plot: 'Fremen uprising.',
          posterUrl: 'https://example.com/dune2.jpg',
          imdbRating: '8.6',
          isWatched: false,
        },
      });
      expect(prisma.watchRequest.delete).toHaveBeenCalledWith({
        where: { id: 'req-1' },
      });
    });

    it('handles unexpected exceptions during accept', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
      vi.mocked(prisma.watchRequest.findUnique).mockRejectedValueOnce(new Error('DB Error'));

      const res = await acceptWatchRequestAction('req-1');
      expect(res).toEqual({ success: false, error: 'Failed to accept watch request' });
    });
  });

  describe('rejectWatchRequestAction', () => {
    it('returns unauthorized error if not admin', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(false);

      const res = await rejectWatchRequestAction('req-1');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Unauthorized');
    });

    it('returns error if request is not found', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
      vi.mocked(prisma.watchRequest.findUnique).mockResolvedValueOnce(null);

      const res = await rejectWatchRequestAction('nonexistent');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Watch request not found');
    });

    it('permanently deletes watch request when rejected', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
      vi.mocked(prisma.watchRequest.findUnique).mockResolvedValueOnce({
        id: 'req-1',
        title: 'Bad Movie',
        mediaType: 'MOVIE',
        releaseYear: 2000,
        genre: null,
        director: null,
        cast: null,
        plot: null,
        posterUrl: null,
        imdbRating: null,
        requesterName: null,
        requesterNote: null,
        requestCount: 1,
        requesterHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.watchRequest.delete).mockResolvedValueOnce({} as any);

      const res = await rejectWatchRequestAction('req-1');
      expect(res.success).toBe(true);
      expect(res.message).toContain('rejected and removed');
      expect(prisma.watchRequest.delete).toHaveBeenCalledWith({
        where: { id: 'req-1' },
      });
    });

    it('handles unexpected exceptions during reject', async () => {
      vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
      vi.mocked(prisma.watchRequest.findUnique).mockRejectedValueOnce(new Error('DB Error'));

      const res = await rejectWatchRequestAction('req-1');
      expect(res).toEqual({ success: false, error: 'Failed to reject watch request' });
    });
  });
});
