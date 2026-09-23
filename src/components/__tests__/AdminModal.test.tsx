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

  describe('Authenticated state without active item (isAdmin = true)', () => {
    it('returns null and does not render Publish New Journal Entry modal', () => {
      const { container } = render(
        <AdminModal
          isAdmin={true}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole('heading', { name: /publish new journal entry/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/auto-fill metadata from omdb api/i)).not.toBeInTheDocument();
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

    it('renders watchlist banner, hides duplicate metadata fields, and submits review', async () => {
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
          tags: 'SciFi, Classics',
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
          watchlistItem={mockWatchlistItem}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      expect(screen.getByRole('heading', { name: /log review for "solaris"/i })).toBeInTheDocument();
      expect(screen.getByText(/logging watchlist item/i)).toBeInTheDocument();
      expect(screen.getByText(/publishing this review will automatically mark "solaris" as/i)).toBeInTheDocument();
      
      // Duplicate metadata inputs must NOT be present
      expect(screen.queryByPlaceholderText(/title \(e\.g\. dune: part two\)/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/e\.g\. denis villeneuve/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/short plot description\.\.\./i)).not.toBeInTheDocument();

      // Only rating, review, tags, and feature spotlight checkbox
      expect(screen.getByText(/your star rating:/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/write your comprehensive analysis/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/masterpiece, scifi, mustwatch/i)).toBeInTheDocument();
      const spotlightCheckbox = screen.getByLabelText(/feature on hero spotlight/i);
      expect(spotlightCheckbox).toBeInTheDocument();
      expect(spotlightCheckbox).toBeChecked();

      // Enter review and tags (spotlight is true by default)
      fireEvent.change(screen.getByPlaceholderText(/write your comprehensive analysis/i), {
        target: { value: 'Poetic, philosophical cinema at its greatest.' },
      });
      fireEvent.change(screen.getByPlaceholderText(/masterpiece, scifi, mustwatch/i), {
        target: { value: 'SciFi, Classics' },
      });

      const form = screen.getByRole('button', { name: /^publish entry$/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(createPostAction).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Solaris',
          mediaType: 'MOVIE',
          releaseYear: 1972,
          genre: 'Drama, Sci-Fi',
          director: 'Andrei Tarkovsky',
          cast: 'Natalya Bondarchuk, Donatas Banionis',
          plot: 'A psychologist is sent to a space station...',
          posterUrl: 'https://example.com/solaris.jpg',
          imdbRating: '8.0/10',
          watchlistItemId: 'wl-item-1',
          review: 'Poetic, philosophical cinema at its greatest.',
          tags: 'SciFi, Classics',
          isFeatured: true,
        }));
        expect(screen.getByText('Review published & Watchlist item marked as Watched!')).toBeInTheDocument();
      });
    });

    it('allows unchecking feature on hero spotlight checkbox when logging from watchlist', async () => {
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
          tags: 'SciFi, Classics',
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

      const spotlightCheckbox = screen.getByLabelText(/feature on hero spotlight/i);
      expect(spotlightCheckbox).toBeChecked();

      // Uncheck spotlight
      fireEvent.click(spotlightCheckbox);
      expect(spotlightCheckbox).not.toBeChecked();

      fireEvent.change(screen.getByPlaceholderText(/write your comprehensive analysis/i), {
        target: { value: 'Poetic, philosophical cinema at its greatest.' },
      });

      const form = screen.getByRole('button', { name: /^publish entry$/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(createPostAction).toHaveBeenCalledWith(expect.objectContaining({
          watchlistItemId: 'wl-item-1',
          isFeatured: false,
        }));
      });
    });

    it('validates review content requirement before submission', () => {
      render(
        <AdminModal
          isAdmin={true}
          watchlistItem={mockWatchlistItem}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      const form = screen.getByRole('button', { name: /^publish entry$/i }).closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText('Title and Review content are required')).toBeInTheDocument();
      expect(createPostAction).not.toHaveBeenCalled();
    });

    it('displays error when createPostAction fails', async () => {
      vi.mocked(createPostAction).mockResolvedValueOnce({
        success: false,
        error: 'Database error saving review',
      });

      render(
        <AdminModal
          isAdmin={true}
          watchlistItem={mockWatchlistItem}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      fireEvent.change(screen.getByPlaceholderText(/write your comprehensive analysis/i), {
        target: { value: 'Review content' },
      });

      const form = screen.getByRole('button', { name: /^publish entry$/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Database error saving review')).toBeInTheDocument();
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

    it('allows changing star rating interactively in edit mode', () => {
      render(
        <AdminModal
          isAdmin={true}
          editingPost={mockPost}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      expect(screen.getByText('4.5 / 5.0')).toBeInTheDocument();

      const starHitbox = screen.getByTitle('3.5 Stars');
      fireEvent.click(starHitbox);

      expect(screen.getByText('3.5 / 5.0')).toBeInTheDocument();
    });

    it('respects isFeatured false when editing an existing post with isFeatured: false', () => {
      render(
        <AdminModal
          isAdmin={true}
          editingPost={{ ...mockPost, isFeatured: false }}
          onClose={mockOnClose}
          onAdminStatusChange={mockOnAdminStatusChange}
        />
      );

      expect(screen.getByLabelText(/feature on hero spotlight/i)).not.toBeChecked();
    });
  });

  it('locks body scroll on mount and unlocks on unmount', () => {
    const { unmount } = render(
      <AdminModal
        isAdmin={false}
        onClose={mockOnClose}
        onAdminStatusChange={mockOnAdminStatusChange}
      />
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
