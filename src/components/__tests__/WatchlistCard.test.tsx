import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { WatchlistCard } from '@/components/WatchlistCard'

describe('WatchlistCard', () => {
  const mockQueuedItem = {
    id: 'item-1',
    title: 'Dune: Part Two',
    mediaType: 'MOVIE',
    releaseYear: 2024,
    genre: 'Sci-Fi',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya',
    plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
    posterUrl: 'https://example.com/dune2.jpg',
    imdbRating: '8.5',
    isWatched: false,
    post: null,
  }

  const mockWatchedItem = {
    id: 'item-2',
    title: 'Oppenheimer',
    mediaType: 'MOVIE',
    releaseYear: 2023,
    genre: 'Biography, Drama',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt',
    plot: 'The story of American scientist J. Robert Oppenheimer.',
    posterUrl: 'https://example.com/oppenheimer.jpg',
    imdbRating: '8.9',
    isWatched: true,
    post: {
      id: 'post-1',
      slug: 'oppenheimer-review',
      userRating: 4.8,
    },
  }

  it('renders queued item information correctly', () => {
    render(<WatchlistCard item={mockQueuedItem} />)

    expect(screen.getByRole('heading', { name: 'Dune: Part Two' })).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('Denis Villeneuve')).toBeInTheDocument()
    expect(
      screen.getByText(/"Paul Atreides unites with Chani and the Fremen while seeking revenge."/)
    ).toBeInTheDocument()
    expect(screen.getByText('MOVIE')).toBeInTheDocument()
    expect(screen.getByText('Queued')).toBeInTheDocument()

    const poster = screen.getByRole('img', { name: 'Dune: Part Two' })
    expect(poster).toHaveAttribute('src', 'https://example.com/dune2.jpg')
    expect(screen.getByRole('button', { name: /Log & Review Entry/i })).toBeInTheDocument()
  })

  it('calls onLogReview when Log & Review Entry button is clicked', () => {
    const onLogReview = vi.fn()
    render(<WatchlistCard item={mockQueuedItem} onLogReview={onLogReview} />)

    const button = screen.getByRole('button', { name: /Log & Review Entry/i })
    fireEvent.click(button)

    expect(onLogReview).toHaveBeenCalledTimes(1)
    expect(onLogReview).toHaveBeenCalledWith(mockQueuedItem)
  })

  it('renders watched item with link to review and user rating', () => {
    render(<WatchlistCard item={mockWatchedItem} />)

    expect(screen.getByRole('heading', { name: 'Oppenheimer' })).toBeInTheDocument()
    expect(screen.getByText('Watched')).toBeInTheDocument()
    expect(screen.getByText('Read Review')).toBeInTheDocument()
    expect(screen.getByText(/★ 4.8/)).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /Read Review/i })
    expect(link).toHaveAttribute('href', '/post/oppenheimer-review?from=watchlist&tab=watched')
  })

  it('renders placeholder when posterUrl is not provided', () => {
    const itemWithoutPoster = {
      ...mockQueuedItem,
      posterUrl: null,
    }
    render(<WatchlistCard item={itemWithoutPoster} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // Renders title inside fallback placeholder as well as in card heading
    expect(screen.getByRole('heading', { name: 'Dune: Part Two' })).toBeInTheDocument()
    const titles = screen.getAllByText('Dune: Part Two')
    expect(titles.length).toBeGreaterThanOrEqual(2)
  })

  it('shows admin delete button when isAdmin is true and handles click', () => {
    const onDelete = vi.fn()
    render(<WatchlistCard item={mockQueuedItem} isAdmin={true} onDelete={onDelete} />)

    const deleteButton = screen.getByTitle('Delete Watchlist Item')
    expect(deleteButton).toBeInTheDocument()

    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('item-1')
  })

  it('does not show admin delete button when isAdmin is false', () => {
    render(<WatchlistCard item={mockQueuedItem} isAdmin={false} />)

    expect(screen.queryByTitle('Delete Watchlist Item')).not.toBeInTheDocument()
  })

  it('renders correctly when optional fields are omitted or null', () => {
    const minimalItem = {
      id: 'item-min',
      title: 'Minimal Movie',
      mediaType: 'TV',
      posterUrl: 'https://example.com/poster.jpg',
      isWatched: false,
    }
    render(<WatchlistCard item={minimalItem} />)

    expect(screen.getAllByText('Minimal Movie').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('TV')).toBeInTheDocument()
    expect(screen.queryByText(/by/i)).not.toBeInTheDocument()
  })

  it('renders watched item without post by falling back to log review button', () => {
    const watchedWithoutPost = {
      ...mockWatchedItem,
      post: null,
    }
    render(<WatchlistCard item={watchedWithoutPost} />)

    expect(screen.getByRole('button', { name: /Log & Review Entry/i })).toBeInTheDocument()
  })
})
