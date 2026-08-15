import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdminModal } from '@/components/AdminModal';
import { createPostAction, updatePostAction } from '@/actions/postActions';

// Mock post actions
vi.mock('@/actions/postActions', () => ({
  createPostAction: vi.fn(),
  updatePostAction: vi.fn(),
}));

describe('AdminModal', () => {
  const mockOnClose = vi.fn();
  const mockOnAdminStatusChange = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.stubGlobal('fetch', vi.fn());
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('Unauthenticated state (isAdmin = false)', () => {
    it('renders the admin login modal', () => {
      render(
        <AdminModal
          isAdmin={false}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      expect(screen.getByText('Admin Credentials Required')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter admin password...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /unlock admin portal/i })).toBeInTheDocument();
    });

    it('calls onClose when close icon button is clicked', () => {
      render(
        <AdminModal
          isAdmin={false}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      const closeBtn = screen.getByTitle('Close modal');
      fireEvent.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('successfully logs in when correct password is submitted', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        json: async () => ({ success: true }),
      } as unknown as Response);

      render(
        <AdminModal
          isAdmin={false}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      fireEvent.change(screen.getByPlaceholderText('Enter admin password...'), {
        target: { value: 'secretpass' },
      });

      const form = screen.getByRole('button', { name: /unlock admin portal/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'secretpass' }),
        });
        expect(mockOnAdminStatusChange).toHaveBeenCalledWith(true);
      });
    });

    it('displays error message when login fails with message', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        json: async () => ({ success: false, message: 'Incorrect password entered' }),
      } as unknown as Response);

      render(
        <AdminModal
          isAdmin={false}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      fireEvent.change(screen.getByPlaceholderText('Enter admin password...'), {
        target: { value: 'wrongpass' },
      });

      const form = screen.getByRole('button', { name: /unlock admin portal/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Incorrect password entered')).toBeInTheDocument();
        expect(mockOnAdminStatusChange).not.toHaveBeenCalled();
      });
    });

    it('displays default error message when login fails without message', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        json: async () => ({ success: false }),
      } as unknown as Response);

      render(
        <AdminModal
          isAdmin={false}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      fireEvent.change(screen.getByPlaceholderText('Enter admin password...'), {
        target: { value: 'wrongpass' },
      });

      const form = screen.getByRole('button', { name: /unlock admin portal/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Invalid admin password')).toBeInTheDocument();
      });
    });

    it('displays server error when login fetch throws', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      render(
        <AdminModal
          isAdmin={false}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      fireEvent.change(screen.getByPlaceholderText('Enter admin password...'), {
        target: { value: 'secretpass' },
      });

      const form = screen.getByRole('button', { name: /unlock admin portal/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Authentication server error')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated state - Create Mode (isAdmin = true)', () => {
    it('renders post creation editor and handles logout', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        json: async () => ({ success: true }),
      } as unknown as Response);

      render(
        <AdminModal
          isAdmin={true}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      expect(screen.getByRole('heading', { name: /publish new journal entry/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/title \(e\.g\. dune: part two\)/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /logout/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/logout', { method: 'POST' });
        expect(mockOnAdminStatusChange).toHaveBeenCalledWith(false);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('toggles OMDb search and searches API in post creation mode', async () => {
      const searchResults = {
        Search: [
          {
            Title: 'Oppenheimer',
            Year: '2023',
            imdbID: 'tt15398776',
            Type: 'movie',
            Poster: 'https://example.com/oppenheimer.jpg',
          },
        ],
      };

      const itemDetails = {
        Title: 'Oppenheimer',
        Year: '2023',
        Genre: 'Biography, Drama, History',
        Director: 'Christopher Nolan',
        Actors: 'Cillian Murphy, Emily Blunt',
        Plot: 'The story of J. Robert Oppenheimer...',
        Poster: 'https://example.com/oppenheimer-poster.jpg',
        imdbRating: '8.9',
        Type: 'movie',
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          json: async () => searchResults,
        } as unknown as Response)
        .mockResolvedValueOnce({
          json: async () => itemDetails,
        } as unknown as Response);

      render(
        <AdminModal
          isAdmin={true}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      // Expand OMDb search
      fireEvent.click(screen.getByRole('button', { name: /search omdb api/i }));
      expect(screen.getByPlaceholderText(/type movie, tv series, or doc title/i)).toBeInTheDocument();

      // Search
      fireEvent.change(screen.getByPlaceholderText(/type movie, tv series, or doc title/i), {
        target: { value: 'Oppenheimer' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getByText('Oppenheimer')).toBeInTheDocument();
      });

      // Select item to auto-populate
      fireEvent.click(screen.getByText('Oppenheimer'));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Oppenheimer')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Biography, Drama, History')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Christopher Nolan')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Cillian Murphy, Emily Blunt')).toBeInTheDocument();
        expect(screen.getByDisplayValue('The story of J. Robert Oppenheimer...')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example.com/oppenheimer-poster.jpg')).toBeInTheDocument();
        // OMDb search accordion should be closed
        expect(screen.queryByPlaceholderText(/type movie, tv series, or doc title/i)).not.toBeInTheDocument();
      });
    });

    it('validates that title and review are required before publishing', () => {
      render(
        <AdminModal
          isAdmin={true}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      const form = screen.getByRole('button', { name: /^publish entry$/i }).closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText('Title and Review content are required')).toBeInTheDocument();
      expect(createPostAction).not.toHaveBeenCalled();
    });

    it('allows changing star rating interactively', () => {
      render(
        <AdminModal
          isAdmin={true}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      // Default rating is 5.0
      expect(screen.getByText('5.0 / 5.0')).toBeInTheDocument();

      // Click on 3.5 Stars hitbox in StarRating
      const starHitbox = screen.getByTitle('3.5 Stars');
      fireEvent.click(starHitbox);

      expect(screen.getByText('3.5 / 5.0')).toBeInTheDocument();
    });

    it('submits new post and handles success', async () => {
      vi.mocked(createPostAction).mockResolvedValueOnce({
        success: true,
        post: {
          id: 'post-1',
          title: 'Arrival',
          slug: 'arrival-2016',
          mediaType: 'MOVIE',
          releaseYear: 2016,
          genre: 'Sci-Fi',
          director: 'Denis Villeneuve',
          cast: 'Amy Adams, Jeremy Renner',
          plot: 'A linguist works with the military to communicate with alien lifeforms.',
          posterUrl: 'https://example.com/arrival.jpg',
          imdbRating: '',
          userRating: 5.0,
          review: 'A profound masterpiece about time, language, and human connection.',
          tags: 'SciFi, Masterpiece',
          isFeatured: true,
          isPublished: true,
          likesCount: 0,
          dislikesCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      render(
        <AdminModal
          isAdmin={true}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      fireEvent.change(screen.getByPlaceholderText(/title \(e\.g\. dune: part two\)/i), {
        target: { value: 'Arrival' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 2024/i), {
        target: { value: '2016' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. sci-fi, drama/i), {
        target: { value: 'Sci-Fi' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. denis villeneuve/i), {
        target: { value: 'Denis Villeneuve' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. timothée chalamet/i), {
        target: { value: 'Amy Adams, Jeremy Renner' },
      });
      fireEvent.change(screen.getByPlaceholderText(/https:\/\/image-url\.jpg/i), {
        target: { value: 'https://example.com/arrival.jpg' },
      });
      fireEvent.change(screen.getByPlaceholderText(/short plot description\.\.\./i), {
        target: { value: 'A linguist works with the military to communicate with alien lifeforms.' },
      });
      fireEvent.change(screen.getByPlaceholderText(/write your comprehensive analysis/i), {
        target: { value: 'A profound masterpiece about time, language, and human connection.' },
      });
      fireEvent.change(screen.getByPlaceholderText(/masterpiece, scifi, mustwatch/i), {
        target: { value: 'SciFi, Masterpiece' },
      });

      // Toggle Featured checkbox
      fireEvent.click(screen.getByLabelText(/feature on hero spotlight/i));

      const form = screen.getByRole('button', { name: /^publish entry$/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(createPostAction).toHaveBeenCalledWith({
          title: 'Arrival',
          mediaType: 'MOVIE',
          releaseYear: 2016,
          genre: 'Sci-Fi',
          director: 'Denis Villeneuve',
          cast: 'Amy Adams, Jeremy Renner',
          plot: 'A linguist works with the military to communicate with alien lifeforms.',
          posterUrl: 'https://example.com/arrival.jpg',
          imdbRating: '',
          userRating: 5.0,
          review: 'A profound masterpiece about time, language, and human connection.',
          tags: 'SciFi, Masterpiece',
          isFeatured: true,
          watchlistItemId: undefined,
        });
        expect(screen.getByText('Post published successfully!')).toBeInTheDocument();
      });
    });

    it('displays error when createPostAction fails', async () => {
      vi.mocked(createPostAction).mockResolvedValueOnce({
        success: false,
        error: 'Slug already exists',
      });

      render(
        <AdminModal
          isAdmin={true}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      fireEvent.change(screen.getByPlaceholderText(/title \(e\.g\. dune: part two\)/i), {
        target: { value: 'Duplicate Post' },
      });
      fireEvent.change(screen.getByPlaceholderText(/write your comprehensive analysis/i), {
        target: { value: 'Review content' },
      });

      const form = screen.getByRole('button', { name: /^publish entry$/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Slug already exists')).toBeInTheDocument();
      });
    });
  });

  describe('Editing existing post (editingPost provided)', () => {
    const mockPost = {
      id: 'post-123',
      title: 'Blade Runner 2049',
      slug: 'blade-runner-2049-2017',
      mediaType: 'MOVIE',
      releaseYear: 2017,
      genre: 'Sci-Fi, Mystery',
      director: 'Denis Villeneuve',
      cast: 'Ryan Gosling, Harrison Ford',
      plot: 'Young Blade Runner K unearths a secret...',
      posterUrl: 'https://example.com/br2049.jpg',
      imdbRating: '8.0/10',
      userRating: 4.5,
      review: 'A visual spectacle and narrative tour de force.',
      tags: 'Cyberpunk, SciFi',
      isFeatured: true,
      isPublished: true,
      likesCount: 0,
      dislikesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('pre-populates form with post data and updates post on submit', async () => {
      vi.mocked(updatePostAction).mockResolvedValueOnce({ success: true, post: mockPost });

      render(
        <AdminModal
          isAdmin={true}
          editingPost={mockPost}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      expect(screen.getByRole('heading', { name: /edit journal entry/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Blade Runner 2049')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2017')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sci-Fi, Mystery')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Denis Villeneuve')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Ryan Gosling, Harrison Ford')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Young Blade Runner K unearths a secret...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/br2049.jpg')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A visual spectacle and narrative tour de force.')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Cyberpunk, SciFi')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^update entry$/i })).toBeInTheDocument();

      const form = screen.getByRole('button', { name: /^update entry$/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(updatePostAction).toHaveBeenCalledWith('post-123', expect.objectContaining({
          title: 'Blade Runner 2049',
          userRating: 4.5,
          isFeatured: true,
        }));
        expect(screen.getByText('Post updated successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Logging review from Watchlist (watchlistItem provided)', () => {
    const mockWatchlistItem = {
      id: 'wl-item-1',
      title: 'Solaris',
      mediaType: 'MOVIE',
      releaseYear: 1972,
      genre: 'Drama, Sci-Fi',
      director: 'Andrei Tarkovsky',
      cast: 'Natalya Bondarchuk, Donatas Banionis',
      plot: 'A psychologist is sent to a space station...',
      posterUrl: 'https://example.com/solaris.jpg',
      imdbRating: '8.0/10',
      isWatched: false,
      postId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('renders watchlist banner and submits with watchlistItemId', async () => {
      vi.mocked(createPostAction).mockResolvedValueOnce({
        success: true,
        post: {
          id: 'p-new',
          title: 'Solaris',
          slug: 'solaris-1972',
          mediaType: 'MOVIE',
          releaseYear: 1972,
          genre: 'Drama, Sci-Fi',
          director: 'Andrei Tarkovsky',
          cast: 'Natalya Bondarchuk, Donatas Banionis',
          plot: 'A psychologist is sent to a space station...',
          posterUrl: 'https://example.com/solaris.jpg',
          imdbRating: '8.0/10',
          userRating: 5.0,
          review: 'Poetic, philosophical cinema at its greatest.',
          tags: '',
          isFeatured: false,
          isPublished: true,
          likesCount: 0,
          dislikesCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      render(
        <AdminModal
          isAdmin={true}
          watchlistItem={mockWatchlistItem}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      expect(screen.getByRole('heading', { name: /log review for "solaris"/i })).toBeInTheDocument();
      expect(screen.getByText(/logging watchlist item/i)).toBeInTheDocument();
      expect(screen.getByText(/publishing this review will automatically mark "solaris" as/i)).toBeInTheDocument();
      expect(screen.queryByText(/auto-fill metadata from omdb api/i)).not.toBeInTheDocument();

      // Enter review
      fireEvent.change(screen.getByPlaceholderText(/write your comprehensive analysis/i), {
        target: { value: 'Poetic, philosophical cinema at its greatest.' },
      });

      const form = screen.getByRole('button', { name: /^publish entry$/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(createPostAction).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Solaris',
          watchlistItemId: 'wl-item-1',
          review: 'Poetic, philosophical cinema at its greatest.',
        }));
        expect(screen.getByText('Review published & Watchlist item marked as Watched!')).toBeInTheDocument();
      });
    });
  });

  it('locks body scroll on mount and unlocks on unmount', () => {
    const { unmount } = render(
      <AdminModal
        isAdmin={true}
        onClose={mockOnClose}
        onAdminStatusChange={mockOnAdminStatusChange}
      />
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
