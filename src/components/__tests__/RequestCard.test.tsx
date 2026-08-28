import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestCard } from '@/components/RequestCard';

describe('RequestCard', () => {
  const mockItem = {
    id: 'req-1',
    title: 'Dune: Part Two',
    mediaType: 'MOVIE',
    releaseYear: 2024,
    genre: 'Sci-Fi, Adventure',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya',
    plot: 'Paul Atreides unites with Chani and the Fremen.',
    posterUrl: 'https://example.com/dune2.jpg',
    imdbRating: '8.6/10',
    requesterName: 'Alex',
    requesterNote: 'Please watch this masterpiece!',
    requestCount: 3,
    createdAt: new Date(),
  };

  const mockItemMinimal = {
    id: 'req-2',
    title: 'Unknown Title',
    mediaType: 'TV',
    requestCount: 1,
    createdAt: new Date(),
  };

  it('renders all details for a complete request item', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();

    render(
      <RequestCard
        item={mockItem}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );

    expect(screen.getByText('Dune: Part Two')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('MOVIE')).toBeInTheDocument();
    expect(screen.getByText(/3 Requests/i)).toBeInTheDocument();
    expect(screen.getByText('Denis Villeneuve')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi, Adventure')).toBeInTheDocument();
    expect(screen.getByText('"Paul Atreides unites with Chani and the Fremen."')).toBeInTheDocument();
    expect(screen.getByText(/Requested by Alex/i)).toBeInTheDocument();
    expect(screen.getByText(/Please watch this masterpiece!/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Dune: Part Two' })).toHaveAttribute('src', 'https://example.com/dune2.jpg');
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('renders fallback when poster, director, plot, and requester info are missing', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();

    render(
      <RequestCard
        item={mockItemMinimal}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );

    expect(screen.getAllByText('Unknown Title').length).toBe(2);
    expect(screen.getByText('TV')).toBeInTheDocument();
    expect(screen.getByText(/1 Request/i)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText(/Requested by/i)).not.toBeInTheDocument();
  });

  it('calls onAccept and handles loading state when Accept button is clicked', async () => {
    const mockAccept = vi.fn().mockResolvedValue(undefined);
    const mockReject = vi.fn();

    render(
      <RequestCard
        item={mockItem}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );

    const acceptBtn = screen.getByRole('button', { name: /accept/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(mockAccept).toHaveBeenCalledWith('req-1');
    });
  });

  it('confirms and calls onReject when Reject button is clicked and confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const mockAccept = vi.fn();
    const mockReject = vi.fn().mockResolvedValue(undefined);

    render(
      <RequestCard
        item={mockItem}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );

    const rejectBtn = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectBtn);

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Are you sure you want to reject and remove the request for "Dune: Part Two"?')
    );
    await waitFor(() => {
      expect(mockReject).toHaveBeenCalledWith('req-1');
    });
  });

  it('does not call onReject when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const mockAccept = vi.fn();
    const mockReject = vi.fn();

    render(
      <RequestCard
        item={mockItem}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );

    const rejectBtn = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockReject).not.toHaveBeenCalled();
  });
});
