import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestMediaModal } from '@/components/RequestMediaModal';
import { createWatchRequestAction } from '@/actions/requestActions';

// Mock createWatchRequestAction
vi.mock('@/actions/requestActions', () => ({
  createWatchRequestAction: vi.fn(),
}));

// Mock device token
vi.mock('@/lib/deviceToken', () => ({
  getOrCreateDeviceToken: vi.fn().mockReturnValue('test-device-token'),
}));

describe('RequestMediaModal', () => {
  const mockOnClose = vi.fn();
  const mockOnRequestSubmitted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders modal header, form fields, and buttons', () => {
    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    expect(screen.getByRole('heading', { name: /request a title/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title...')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. 2024')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Sci-Fi, Thriller')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Director...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://image.jpg')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Short plot summary...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Alex')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Great plot twist and acting!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^submit request$/i })).toBeInTheDocument();
  });

  it('locks body scroll on mount and unlocks on unmount', () => {
    const { unmount } = render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when close icon button or cancel button is clicked', () => {
    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const headerCloseButton = closeButtons[0];
    fireEvent.click(headerCloseButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('toggles OMDb search box visibility when clicking Hide Search / Search OMDb button', () => {
    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search title \(e\.g\. dune, severance\)/i);
    expect(searchInput).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /hide search/i });
    fireEvent.click(toggleButton);

    expect(screen.queryByPlaceholderText(/search title \(e\.g\. dune, severance\)/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search omdb/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /search omdb/i }));
    expect(screen.getByPlaceholderText(/search title \(e\.g\. dune, severance\)/i)).toBeInTheDocument();
  });

  it('validates that title is required before submission', async () => {
    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    const form = screen.getByRole('button', { name: /^submit request$/i }).closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(createWatchRequestAction).not.toHaveBeenCalled();
  });

  it('submits request successfully and triggers callbacks', async () => {
    vi.mocked(createWatchRequestAction).mockResolvedValueOnce({
      success: true,
      item: {
        id: 'req-1',
        title: 'Interstellar',
        mediaType: 'MOVIE',
        releaseYear: 2014,
        genre: 'Sci-Fi',
        director: 'Christopher Nolan',
        cast: null,
        plot: 'Space exploration.',
        posterUrl: 'https://example.com/interstellar.jpg',
        imdbRating: null,
        requesterName: 'Sarah',
        requesterNote: 'Masterpiece',
        requestCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      message: 'Your watch request was submitted successfully!',
    });

    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const categorySelect = selects[selects.length - 1];

    fireEvent.change(screen.getByPlaceholderText('Title...'), { target: { value: 'Interstellar' } });
    fireEvent.change(categorySelect, { target: { value: 'MOVIE' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 2024'), { target: { value: '2014' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Sci-Fi, Thriller'), { target: { value: 'Sci-Fi' } });
    fireEvent.change(screen.getByPlaceholderText('Director...'), { target: { value: 'Christopher Nolan' } });
    fireEvent.change(screen.getByPlaceholderText('https://image.jpg'), { target: { value: 'https://example.com/interstellar.jpg' } });
    fireEvent.change(screen.getByPlaceholderText('Short plot summary...'), { target: { value: 'Space exploration.' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Alex'), { target: { value: 'Sarah' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Great plot twist and acting!'), { target: { value: 'Masterpiece' } });

    const form = screen.getByRole('button', { name: /^submit request$/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(createWatchRequestAction).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Interstellar',
          mediaType: 'MOVIE',
          releaseYear: 2014,
          genre: 'Sci-Fi',
          director: 'Christopher Nolan',
          plot: 'Space exploration.',
          posterUrl: 'https://example.com/interstellar.jpg',
          requesterName: 'Sarah',
          requesterNote: 'Masterpiece',
          deviceToken: 'test-device-token',
        })
      );
      expect(mockOnRequestSubmitted).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Request Received!')).toBeInTheDocument();
    });
  });

  it('displays error message when createWatchRequestAction fails', async () => {
    vi.mocked(createWatchRequestAction).mockResolvedValueOnce({
      success: false,
      error: 'Rate limit reached. You can submit up to 5 requests per hour. Please try again later.',
    });

    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Title...'), { target: { value: 'Dune' } });
    const form = screen.getByRole('button', { name: /^submit request$/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Rate limit reached/i)).toBeInTheDocument();
    });
    expect(mockOnRequestSubmitted).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays fallback error message when error is empty', async () => {
    vi.mocked(createWatchRequestAction).mockResolvedValueOnce({
      success: false,
      error: '',
    });

    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Title...'), { target: { value: 'Dune' } });
    const form = screen.getByRole('button', { name: /^submit request$/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit request')).toBeInTheDocument();
    });
  });

  it('does not search OMDb if query is empty or whitespace', async () => {
    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    const searchBtn = screen.getByRole('button', { name: /^search$/i });
    fireEvent.click(searchBtn);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('performs OMDb search and selects result to auto-populate fields', async () => {
    const mockSearchResults = {
      Search: [
        {
          Title: 'Blade Runner 2049',
          Year: '2017',
          imdbID: 'tt1856101',
          Type: 'movie',
          Poster: 'https://example.com/br2049.jpg',
        },
      ],
    };

    const mockItemDetails = {
      Title: 'Blade Runner 2049',
      Year: '2017',
      Genre: 'Action, Drama, Mystery',
      Director: 'Denis Villeneuve',
      Actors: 'Ryan Gosling, Harrison Ford',
      Plot: 'Young Blade Runner K uncovers a secret.',
      Poster: 'https://example.com/br2049-full.jpg',
      imdbRating: '8.0',
      Type: 'movie',
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: async () => mockSearchResults,
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: async () => mockItemDetails,
      } as unknown as Response);

    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search title \(e\.g\. dune, severance\)/i);
    fireEvent.change(searchInput, { target: { value: 'Blade Runner' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Blade Runner 2049')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Blade Runner 2049'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Blade Runner 2049')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2017')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Action, Drama, Mystery')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Denis Villeneuve')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Young Blade Runner K uncovers a secret.')).toBeInTheDocument();
    });
  });

  it('handles series and documentary type mapping correctly', async () => {
    const docItemDetails = {
      Title: 'Planet Earth',
      Year: '2006',
      Genre: 'Documentary',
      Director: 'Alastair Fothergill',
      Actors: 'David Attenborough',
      Plot: 'Documentary series on natural history.',
      Poster: 'https://example.com/pe.jpg',
      imdbRating: '9.4',
      Type: 'series',
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: async () => ({ Title: 'Planet Earth', imdbID: 'tt0795176' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: async () => docItemDetails,
      } as unknown as Response);

    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/search title \(e\.g\. dune, severance\)/i), {
      target: { value: 'Planet Earth' },
    });

    const typeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(typeSelect, { target: { value: 'series' } });

    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('Planet Earth')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Planet Earth'));

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[0];
      expect(categorySelect).toHaveValue('TV');
    });
  });

  it('handles search and detail fetch errors gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ error: 'Too many results.' }),
    } as unknown as Response);

    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/search title \(e\.g\. dune, severance\)/i), {
      target: { value: 'Star' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('Too many results.')).toBeInTheDocument();
    });
  });

  it('handles search network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network offline'));

    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/search title \(e\.g\. dune, severance\)/i), {
      target: { value: 'Inception' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('Error connecting to OMDb metadata service')).toBeInTheDocument();
    });
  });

  it('handles detail fetch network error', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: async () => ({ Search: [{ Title: 'Alien', imdbID: 'tt0078748' }] }),
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('Network offline'));

    render(
      <RequestMediaModal
        onClose={mockOnClose}
        onRequestSubmitted={mockOnRequestSubmitted}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/search title \(e\.g\. dune, severance\)/i), {
      target: { value: 'Alien' },
    });
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
