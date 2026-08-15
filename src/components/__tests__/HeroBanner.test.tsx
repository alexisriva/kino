import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HeroBanner } from '@/components/HeroBanner'

vi.mock('@/lib/deviceToken', () => ({
  getOrCreateDeviceToken: vi.fn().mockReturnValue('fake-token')
}))

describe('HeroBanner', () => {
  const mockPost = {
    id: '1',
    slug: 'test-movie',
    title: 'Test Movie Title',
    mediaType: 'MOVIE',
    releaseYear: 2024,
    director: 'John Doe',
    cast: 'Jane Doe',
    posterUrl: 'http://example.com/poster.jpg',
    userRating: 4.5,
    review: 'This is a great movie review!',
    likesCount: 10,
    dislikesCount: 2
  }

  it('renders the post title and details', () => {
    render(<HeroBanner post={mockPost} />)
    expect(screen.getByText('Test Movie Title')).toBeInTheDocument()
    expect(screen.getByText('Director:')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Cast:')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('(2024)')).toBeInTheDocument()
  })

  it('renders the review excerpt', () => {
    render(<HeroBanner post={mockPost} />)
    expect(screen.getByText(/"This is a great movie review!"/)).toBeInTheDocument()
  })
})
