import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MediaGrid } from '@/components/MediaGrid'

// Mock post actions and device token used inside MediaCard -> LikeDislikeButtons
vi.mock('@/actions/postActions', () => ({
  toggleVoteAction: vi.fn(),
  getUserVoteStatusAction: vi.fn().mockResolvedValue({ success: true, userVote: null }),
}))

vi.mock('@/lib/deviceToken', () => ({
  getOrCreateDeviceToken: vi.fn().mockReturnValue('mock-token'),
}))

describe('MediaGrid', () => {
  const mockPosts = [
    {
      id: 'post-1',
      slug: 'the-matrix',
      title: 'The Matrix',
      mediaType: 'MOVIE',
      releaseYear: 1999,
      genre: 'Sci-Fi',
      director: 'Lana & Lilly Wachowski',
      posterUrl: 'https://example.com/matrix.jpg',
      userRating: 4.8,
      review: 'Groundbreaking sci-fi classic.',
      tags: 'cyberpunk, action, sci-fi',
      likesCount: 15,
      dislikesCount: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'post-2',
      slug: 'breaking-bad',
      title: 'Breaking Bad',
      mediaType: 'TV',
      releaseYear: 2008,
      genre: 'Drama',
      director: 'Vince Gilligan',
      posterUrl: 'https://example.com/breaking-bad.jpg',
      userRating: 5.0,
      review: 'All-time masterpiece television.',
      tags: 'drama, crime, masterpiece',
      likesCount: 40,
      dislikesCount: 0,
      createdAt: '2024-01-02T00:00:00.000Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a grid of media cards when posts are provided', () => {
    render(
      <MediaGrid
        posts={mockPosts}
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        activeSort="latest"
        onSortChange={vi.fn()}
      />
    )

    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument()
  })

  it('renders empty state when posts array is empty', () => {
    render(
      <MediaGrid
        posts={[]}
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        activeSort="latest"
        onSortChange={vi.fn()}
      />
    )

    expect(screen.getByText('No Journal Entries Found')).toBeInTheDocument()
    expect(
      screen.getByText(/Try adjusting your search query/i)
    ).toBeInTheDocument()
  })

  it('renders category buttons and calls onCategoryChange when clicked', () => {
    const onCategoryChange = vi.fn()

    render(
      <MediaGrid
        posts={mockPosts}
        activeCategory="ALL"
        onCategoryChange={onCategoryChange}
        activeSort="latest"
        onSortChange={vi.fn()}
      />
    )

    const moviesBtn = screen.getByRole('button', { name: 'Movies' })
    const tvBtn = screen.getByRole('button', { name: 'TV Series' })
    const docsBtn = screen.getByRole('button', { name: 'Documentaries' })
    const animeBtn = screen.getByRole('button', { name: 'Anime' })

    expect(moviesBtn).toBeInTheDocument()
    expect(tvBtn).toBeInTheDocument()
    expect(docsBtn).toBeInTheDocument()
    expect(animeBtn).toBeInTheDocument()

    fireEvent.click(moviesBtn)
    expect(onCategoryChange).toHaveBeenCalledWith('MOVIE')

    fireEvent.click(tvBtn)
    expect(onCategoryChange).toHaveBeenCalledWith('TV')
  })

  it('renders sorting select and triggers onSortChange when sort option changes', () => {
    const onSortChange = vi.fn()

    render(
      <MediaGrid
        posts={mockPosts}
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        activeSort="latest"
        onSortChange={onSortChange}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('latest')

    fireEvent.change(select, { target: { value: 'rating' } })
    expect(onSortChange).toHaveBeenCalledWith('rating')
  })

  it('renders unique tag cloud and triggers onTagChange when tags are clicked', () => {
    const onTagChange = vi.fn()

    render(
      <MediaGrid
        posts={mockPosts}
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        activeSort="latest"
        onSortChange={vi.fn()}
        onTagChange={onTagChange}
      />
    )

    const cyberpunkTagBtn = screen.getByRole('button', { name: '#cyberpunk' })
    expect(cyberpunkTagBtn).toBeInTheDocument()

    fireEvent.click(cyberpunkTagBtn)
    expect(onTagChange).toHaveBeenCalledWith('cyberpunk')
  })

  it('toggles off active tag when clicked again and provides clear filter button', () => {
    const onTagChange = vi.fn()

    render(
      <MediaGrid
        posts={mockPosts}
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        activeSort="latest"
        onSortChange={vi.fn()}
        selectedTag="cyberpunk"
        onTagChange={onTagChange}
      />
    )

    // Clear filter button should be visible
    const clearBtn = screen.getByRole('button', { name: /Clear Filter \(cyberpunk\) ×/i })
    expect(clearBtn).toBeInTheDocument()

    fireEvent.click(clearBtn)
    expect(onTagChange).toHaveBeenCalledWith('')

    // Clicking the already selected tag button should toggle it off (pass "")
    const cyberpunkTagBtn = screen.getByRole('button', { name: '#cyberpunk' })
    fireEvent.click(cyberpunkTagBtn)
    expect(onTagChange).toHaveBeenCalledWith('')
  })

  it('does not render tag cloud when no posts have tags', () => {
    const postsWithoutTags = [
      {
        ...mockPosts[0],
        tags: null,
      },
      {
        ...mockPosts[1],
        tags: '',
      },
    ]

    render(
      <MediaGrid
        posts={postsWithoutTags}
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        activeSort="latest"
        onSortChange={vi.fn()}
      />
    )

    expect(screen.queryByText(/TAGS:/i)).not.toBeInTheDocument()
  })

  it('delegates admin callbacks onEditPost and onDeletePost to MediaCard items', () => {
    const onEditPost = vi.fn()
    const onDeletePost = vi.fn()

    render(
      <MediaGrid
        posts={mockPosts}
        isAdmin={true}
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        activeSort="latest"
        onSortChange={vi.fn()}
        onEditPost={onEditPost}
        onDeletePost={onDeletePost}
      />
    )

    const editButtons = screen.getAllByTitle('Edit Entry')
    const deleteButtons = screen.getAllByTitle('Delete Entry')

    expect(editButtons).toHaveLength(2)
    expect(deleteButtons).toHaveLength(2)

    fireEvent.click(editButtons[0])
    expect(onEditPost).toHaveBeenCalledWith(mockPosts[0])

    fireEvent.click(deleteButtons[1])
    expect(onDeletePost).toHaveBeenCalledWith(mockPosts[1].id)
  })
})
