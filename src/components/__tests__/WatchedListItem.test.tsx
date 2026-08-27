import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { WatchedListItem } from '@/components/WatchedListItem'

describe('WatchedListItem', () => {
  const mockItem = {
    id: 'item-101',
    title: 'Dune: Part Two',
    mediaType: 'MOVIE',
    releaseYear: 2024,
    isWatched: true,
    post: {
      id: 'post-101',
      slug: 'dune-part-two',
      userRating: 4.5,
    },
  }

  it('renders title, release year, media type, user rating, and review link', () => {
    render(<WatchedListItem item={mockItem} />)

    expect(screen.getByText('Dune: Part Two')).toBeInTheDocument()
    expect(screen.getByText('(2024)')).toBeInTheDocument()
    expect(screen.getByText('MOVIE')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read Review/i })).toHaveAttribute(
      'href',
      '/post/dune-part-two?from=watchlist&tab=watched'
    )
  })

  it('renders unrated when user rating is not provided', () => {
    const unratedItem = {
      ...mockItem,
      post: {
        id: 'post-102',
        slug: 'dune-unrated',
        userRating: null,
      },
    }
    render(<WatchedListItem item={unratedItem} />)

    expect(screen.getByText('Not rated')).toBeInTheDocument()
  })

  it('does not render admin delete button when isAdmin is false', () => {
    render(<WatchedListItem item={mockItem} isAdmin={false} />)

    expect(screen.queryByTitle('Delete Watchlist Item')).not.toBeInTheDocument()
  })

  it('renders delete button when isAdmin is true and handles click', () => {
    const onDelete = vi.fn()
    render(<WatchedListItem item={mockItem} isAdmin={true} onDelete={onDelete} />)

    const deleteBtn = screen.getByTitle('Delete Watchlist Item')
    expect(deleteBtn).toBeInTheDocument()

    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledWith('item-101')
  })

  it('handles items without a linked post gracefully', () => {
    const itemWithoutPost = {
      id: 'item-103',
      title: 'Solo Movie',
      mediaType: 'MOVIE',
      releaseYear: 2023,
      isWatched: true,
      post: null,
    }
    render(<WatchedListItem item={itemWithoutPost} />)

    expect(screen.getByText('Solo Movie')).toBeInTheDocument()
    expect(screen.getByText('Not rated')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Read Review/i })).not.toBeInTheDocument()
  })
})
