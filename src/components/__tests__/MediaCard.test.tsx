import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MediaCard } from '@/components/MediaCard'

// Mock post actions and device token for LikeDislikeButtons child component
vi.mock('@/actions/postActions', () => ({
  toggleVoteAction: vi.fn(),
  getUserVoteStatusAction: vi.fn().mockResolvedValue({ success: true, userVote: null }),
}))

vi.mock('@/lib/deviceToken', () => ({
  getOrCreateDeviceToken: vi.fn().mockReturnValue('mock-token'),
}))

describe('MediaCard', () => {
  const basePost = {
    id: 'post-123',
    slug: 'the-matrix-1999',
    title: 'The Matrix',
    mediaType: 'MOVIE',
    releaseYear: 1999,
    genre: 'Sci-Fi',
    director: 'Lana & Lilly Wachowski',
    posterUrl: 'https://example.com/matrix.jpg',
    userRating: 4.8,
    review: 'Groundbreaking sci-fi classic.',
    tags: 'cyberpunk, sci-fi, classic',
    likesCount: 50,
    dislikesCount: 2,
    createdAt: '1999-03-31T00:00:00.000Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders post title, media type, release year, and director', () => {
    render(<MediaCard post={basePost} />)

    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('MOVIE')).toBeInTheDocument()
    expect(screen.getByText('1999')).toBeInTheDocument()
    expect(screen.getByText('Lana & Lilly Wachowski')).toBeInTheDocument()
    expect(screen.getByText('★ 4.8')).toBeInTheDocument()
  })

  it('renders the poster image when posterUrl is provided', () => {
    render(<MediaCard post={basePost} />)

    const img = screen.getByRole('img', { name: 'The Matrix' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/matrix.jpg')
  })

  it('renders fallback placeholder when posterUrl is null or missing', () => {
    const postWithoutPoster = { ...basePost, posterUrl: null }
    render(<MediaCard post={postWithoutPoster} />)

    // Image shouldn't be present
    expect(screen.queryByRole('img', { name: 'The Matrix' })).not.toBeInTheDocument()
    // The placeholder renders post title
    expect(screen.getAllByText('The Matrix').length).toBeGreaterThanOrEqual(1)
  })

  it('renders at most 2 tags', () => {
    render(<MediaCard post={basePost} />)

    expect(screen.getByText('#cyberpunk')).toBeInTheDocument()
    expect(screen.getByText('#sci-fi')).toBeInTheDocument()
    // The third tag 'classic' should not be rendered
    expect(screen.queryByText('#classic')).not.toBeInTheDocument()
  })

  it('renders correctly when optional fields are null or omitted', () => {
    const minimalPost = {
      id: 'post-456',
      slug: 'minimal-post',
      title: 'Minimal Movie',
      mediaType: 'TV',
      releaseYear: null,
      genre: null,
      director: null,
      posterUrl: null,
      userRating: null,
      review: 'Short review',
      tags: null,
      likesCount: 0,
      dislikesCount: 0,
      createdAt: new Date().toISOString(),
    }

    render(<MediaCard post={minimalPost} />)

    expect(screen.getAllByText('Minimal Movie').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('TV')).toBeInTheDocument()
    expect(screen.queryByText(/★/)).not.toBeInTheDocument()
    expect(screen.queryByText(/by/i)).not.toBeInTheDocument()
  })

  it('links to the correct post detail slug', () => {
    render(<MediaCard post={basePost} />)

    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('/post/the-matrix-1999')
  })

  it('does not render admin buttons when isAdmin is false', () => {
    render(<MediaCard post={basePost} isAdmin={false} />)

    expect(screen.queryByTitle('Edit Entry')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete Entry')).not.toBeInTheDocument()
  })

  it('renders admin buttons and calls callbacks on click when isAdmin is true', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <MediaCard
        post={basePost}
        isAdmin={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    const editBtn = screen.getByTitle('Edit Entry')
    const deleteBtn = screen.getByTitle('Delete Entry')

    expect(editBtn).toBeInTheDocument()
    expect(deleteBtn).toBeInTheDocument()

    fireEvent.click(editBtn)
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(basePost)

    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('post-123')
  })

  it('renders LikeDislikeButtons and ShareModal child components', () => {
    render(<MediaCard post={basePost} />)

    // Likes & Dislikes count from LikeDislikeButtons
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()

    // Share button from ShareModal
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })
})
