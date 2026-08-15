import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AddWatchlistModal } from '@/components/AddWatchlistModal';
import { addToWatchlistAction } from '@/actions/watchlistActions';

// Mock addToWatchlistAction
vi.mock('@/actions/watchlistActions', () => ({
  addToWatchlistAction: vi.fn(),
}));

describe('AddWatchlistModal', () => {
  const mockOnClose = vi.fn();
  const mockOnAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders modal header, form fields, and buttons', () => {
    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    expect(screen.getByRole('heading', { name: /add to watchlist/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title...')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. 2024')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Sci-Fi, Drama')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Director...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://image.jpg')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Short plot...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^add to watchlist$/i })).toBeInTheDocument();
  });

  it('locks body scroll on mount and unlocks on unmount', () => {
    const { unmount } = render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when close icon button or cancel button is clicked', () => {
    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    const closeButtons = screen.getAllByRole('button');
    const headerCloseButton = closeButtons[0];
    fireEvent.click(headerCloseButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('toggles OMDb search box visibility when clicking Hide Search / Search OMDb button', () => {
    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    const searchInput = screen.getByPlaceholderText(/search movie\/tv title/i);
    expect(searchInput).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /hide search/i });
    fireEvent.click(toggleButton);

    expect(screen.queryByPlaceholderText(/search movie\/tv title/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search omdb/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /search omdb/i }));
    expect(screen.getByPlaceholderText(/search movie\/tv title/i)).toBeInTheDocument();
  });

  it('validates that title is required before submission', async () => {
    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    const form = screen.getByRole('button', { name: /^add to watchlist$/i }).closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(addToWatchlistAction).not.toHaveBeenCalled();
  });

  it('submits form successfully and calls onAdded and onClose', async () => {
    vi.mocked(addToWatchlistAction).mockResolvedValueOnce({
      success: true,
      item: {
        id: '1',
        title: 'Inception',
        mediaType: 'MOVIE',
        releaseYear: 2010,
        genre: 'Sci-Fi',
        director: 'Christopher Nolan',
        cast: null,
        plot: 'A thief who steals corporate secrets...',
        posterUrl: 'https://example.com/inception.jpg',
        imdbRating: null,
        isWatched: false,
        postId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    const selects = screen.getAllByRole('combobox');
    const categorySelect = selects[selects.length - 1];

    fireEvent.change(screen.getByPlaceholderText('Title...'), { target: { value: 'Inception' } });
    fireEvent.change(categorySelect, { target: { value: 'MOVIE' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 2024'), { target: { value: '2010' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Sci-Fi, Drama'), { target: { value: 'Sci-Fi' } });
    fireEvent.change(screen.getByPlaceholderText('Director...'), { target: { value: 'Christopher Nolan' } });
    fireEvent.change(screen.getByPlaceholderText('https://image.jpg'), { target: { value: 'https://example.com/inception.jpg' } });
    fireEvent.change(screen.getByPlaceholderText('Short plot...'), { target: { value: 'A thief who steals corporate secrets...' } });

    const form = screen.getByRole('button', { name: /^add to watchlist$/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(addToWatchlistAction).toHaveBeenCalledWith({
        title: 'Inception',
        mediaType: 'MOVIE',
        releaseYear: 2010,
        genre: 'Sci-Fi',
        director: 'Christopher Nolan',
        cast: '',
        plot: 'A thief who steals corporate secrets...',
        posterUrl: 'https://example.com/inception.jpg',
        imdbRating: '',
      });
      expect(mockOnAdded).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error message when addToWatchlistAction fails', async () => {
    vi.mocked(addToWatchlistAction).mockResolvedValueOnce({ success: false, error: 'Unauthorized: Admin access required' });

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    fireEvent.change(screen.getByPlaceholderText('Title...'), { target: { value: 'Inception' } });
    const form = screen.getByRole('button', { name: /^add to watchlist$/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Unauthorized: Admin access required')).toBeInTheDocument();
    });
    expect(mockOnAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays fallback error message when addToWatchlistAction fails without error message', async () => {
    vi.mocked(addToWatchlistAction).mockResolvedValueOnce({ success: false, error: '' } as any);

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    fireEvent.change(screen.getByPlaceholderText('Title...'), { target: { value: 'Inception' } });
    const form = screen.getByRole('button', { name: /^add to watchlist$/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Failed to add item')).toBeInTheDocument();
    });
  });

  it('does not search OMDb if query is empty or whitespace', async () => {
    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    const searchBtn = screen.getByRole('button', { name: /^search$/i });
    fireEvent.click(searchBtn);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('performs OMDb search and displays results list', async () => {
    const mockSearchResults = {
      Search: [
        {
          Title: 'Interstellar',
          Year: '2014',
          imdbID: 'tt0816692',
          Type: 'movie',
          Poster: 'https://example.com/interstellar.jpg',
        },
        {
          Title: 'Interstellar 2',
          Year: '2025',
          imdbID: 'tt0816693',
          Type: 'movie',
          Poster: 'N/A',
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => mockSearchResults,
    } as unknown as Response);

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    const searchInput = screen.getByPlaceholderText(/search movie\/tv title/i);
    fireEvent.change(searchInput, { target: { value: 'Interstellar' } });

    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/omdb/search?title=Interstellar');
      expect(screen.getByText('Interstellar')).toBeInTheDocument();
      expect(screen.getByText(/2014 • MOVIE/i)).toBeInTheDocument();
      expect(screen.getByText('Interstellar 2')).toBeInTheDocument();
    });
  });

  it('handles OMDb search with type parameter and single title response', async () => {
    const singleResult = {
      Title: 'Breaking Bad',
      Year: '2008–2013',
      imdbID: 'tt0903747',
      Type: 'series',
      Poster: 'https://example.com/bb.jpg',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => singleResult,
    } as unknown as Response);

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    fireEvent.change(screen.getByPlaceholderText(/search movie\/tv title/i), { target: { value: 'Breaking Bad' } });
    
    const typeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(typeSelect, { target: { value: 'series' } });

    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/omdb/search?title=Breaking%20Bad&type=series');
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });
  });

  it('displays OMDb search error returned from API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ error: 'Movie not found!' }),
    } as unknown as Response);

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    fireEvent.change(screen.getByPlaceholderText(/search movie\/tv title/i), { target: { value: 'NonexistentTitle12345' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('Movie not found!')).toBeInTheDocument();
    });
  });

  it('displays network error when OMDb search fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    fireEvent.change(screen.getByPlaceholderText(/search movie\/tv title/i), { target: { value: 'Alien' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('Error connecting to OMDb metadata service')).toBeInTheDocument();
    });
  });

  it('selects OMDb item, auto-populates form fields, and closes search box', async () => {
    const searchResponse = {
      Search: [
        {
          Title: 'Dune: Part Two',
          Year: '2024',
          imdbID: 'tt15239678',
          Type: 'movie',
          Poster: 'https://example.com/dune2.jpg',
        },
      ],
    };

    const itemDetails = {
      Title: 'Dune: Part Two',
      Year: '2024',
      Genre: 'Action, Adventure, Sci-Fi',
      Director: 'Denis Villeneuve',
      Actors: 'Timothée Chalamet, Zendaya',
      Plot: 'Paul Atreides unites with Chani and the Fremen...',
      Poster: 'https://example.com/dune2-full.jpg',
      imdbRating: '8.6',
      Type: 'movie',
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: async () => searchResponse,
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: async () => itemDetails,
      } as unknown as Response);

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    fireEvent.change(screen.getByPlaceholderText(/search movie\/tv title/i), { target: { value: 'Dune' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('Dune: Part Two')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Dune: Part Two'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/omdb/search?i=tt15239678');
      expect(screen.getByDisplayValue('Dune: Part Two')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Action, Adventure, Sci-Fi')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Denis Villeneuve')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/dune2-full.jpg')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Paul Atreides unites with Chani and the Fremen...')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/search movie\/tv title/i)).not.toBeInTheDocument();
    });
  });

  it('handles documentary and TV series type mapping when selecting OMDb item', async () => {
    const docItemDetails = {
      Title: 'Free Solo',
      Year: '2018',
      Genre: 'Documentary, Sport',
      Director: 'Jimmy Chin, Elizabeth Chai Vasarhelyi',
      Actors: 'Alex Honnold',
      Plot: 'Alex Honnold attempts to become the first person to free solo climb El Capitan.',
      Poster: 'https://example.com/freesolo.jpg',
      imdbRating: '8.1',
      Type: 'movie',
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: async () => ({ Search: [{ Title: 'Free Solo', imdbID: 'tt7775568' }] }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: async () => docItemDetails,
      } as unknown as Response);

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    fireEvent.change(screen.getByPlaceholderText(/search movie\/tv title/i), { target: { value: 'Free Solo' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('Free Solo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Free Solo'));

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[0];
      expect(categorySelect).toHaveValue('DOCUMENTARY');
    });
  });

  it('displays error when fetching item details fails', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: async () => ({ Search: [{ Title: 'Alien', imdbID: 'tt0078748' }] }),
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('Details fetch failed'));

    render(<AddWatchlistModal onClose={mockOnClose} onAdded={mockOnAdded} />);

    fireEvent.change(screen.getByPlaceholderText(/search movie\/tv title/i), { target: { value: 'Alien' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('Alien')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Alien'));

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch item details')).toBeInTheDocument();
    });
  });
});
