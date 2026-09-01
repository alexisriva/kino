import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WatchlistGrid } from '@/components/WatchlistGrid'
import { getWatchlistAction, deleteWatchlistItemAction } from '@/actions/watchlistActions'
import {
  getWatchRequestsAction,
  acceptWatchRequestAction,
  rejectWatchRequestAction,
} from '@/actions/requestActions'

const mockReplace = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/watchlist',
}))

vi.mock('@/actions/watchlistActions', () => ({
  getWatchlistAction: vi.fn(),
  deleteWatchlistItemAction: vi.fn(),
}))

vi.mock('@/actions/requestActions', () => ({
  getWatchRequestsAction: vi.fn(),
  acceptWatchRequestAction: vi.fn(),
  rejectWatchRequestAction: vi.fn(),
}))

vi.mock('@/components/AddWatchlistModal', () => ({
  AddWatchlistModal: ({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) => (
    <div data-testid="add-watchlist-modal">
      <button onClick={onClose}>Close Modal</button>
      <button onClick={onAdded}>Confirm Added</button>
    </div>
  ),
}))

vi.mock('@/components/RequestMediaModal', () => ({
  RequestMediaModal: ({ onClose, onRequestSubmitted }: { onClose: () => void; onRequestSubmitted?: () => void }) => (
    <div data-testid="request-media-modal">
      <button onClick={onClose}>Close Request Modal</button>
      <button onClick={onRequestSubmitted}>Confirm Submitted</button>
    </div>
  ),
}))

describe('WatchlistGrid', () => {
  const mockItems = [
    {
      id: 'item-1',
      title: 'Inception',
      mediaType: 'MOVIE',
      releaseYear: 2010,
      genre: 'Sci-Fi',
      director: 'Christopher Nolan',
      cast: 'Leonardo DiCaprio',
      plot: 'A thief who steals corporate secrets through dream-sharing technology.',
      posterUrl: 'https://example.com/inception.jpg',
      imdbRating: '8.8',
      isWatched: false,
      post: null,
    },
    {
      id: 'item-2',
      title: 'Breaking Bad',
      mediaType: 'TV',
      releaseYear: 2008,
      genre: 'Crime, Drama',
      director: 'Vince Gilligan',
      cast: 'Bryan Cranston',
      plot: 'A chemistry teacher diagnosed with cancer turns to manufacturing meth.',
      posterUrl: 'https://example.com/breakingbad.jpg',
      imdbRating: '9.5',
      isWatched: false,
      post: null,
    },
  ]

  const mockRequests = [
    {
      id: 'req-1',
      title: 'Severance',
      mediaType: 'TV',
      releaseYear: 2022,
      genre: 'Sci-Fi, Thriller',
      director: 'Ben Stiller',
      cast: 'Adam Scott',
      plot: 'Mark leads a team of office workers whose memories have been surgically divided.',
      posterUrl: 'https://example.com/severance.jpg',
      imdbRating: '8.7',
      requesterName: 'Alice',
      requesterNote: 'Mindblowing TV series!',
      requestCount: 4,
      createdAt: new Date(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    vi.mocked(getWatchlistAction).mockResolvedValue({
      success: true,
      items: mockItems as any,
      unwatchedCount: 2,
      watchedCount: 5,
      requestsCount: 1,
    })
    vi.mocked(deleteWatchlistItemAction).mockResolvedValue({
      success: true,
    })
    vi.mocked(getWatchRequestsAction).mockResolvedValue({
      success: true,
      items: mockRequests as any,
      totalCount: 1,
    })
    vi.mocked(acceptWatchRequestAction).mockResolvedValue({
      success: true,
      message: 'Added to watchlist',
      watchlistItem: {
        id: 'item-new',
        title: 'Severance',
        mediaType: 'TV',
        releaseYear: 2022,
        genre: 'Sci-Fi',
        director: 'Ben Stiller',
        cast: 'Adam Scott',
        plot: 'Divided memories',
        posterUrl: 'https://example.com/severance.jpg',
        imdbRating: '8.7',
        isWatched: false,
        postId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    vi.mocked(rejectWatchRequestAction).mockResolvedValue({
      success: true,
      message: 'Rejected and removed',
    })
  })

  it('renders loading state initially and then displays items with tab counts', async () => {
    render(<WatchlistGrid />)

    expect(screen.getByText(/Loading Watchlist Items.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument()
    })

    expect(screen.getByText('Queued (2)')).toBeInTheDocument()
    expect(screen.getByText('Watched & Logged (5)')).toBeInTheDocument()
    expect(getWatchlistAction).toHaveBeenCalledWith({
      isWatched: false,
      category: 'ALL',
    })
  })

  it('renders Request a Title button for all visitors and opens RequestMediaModal', async () => {
    render(<WatchlistGrid isAdmin={false} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const requestBtn = screen.getByRole('button', { name: /Request a Title/i })
    expect(requestBtn).toBeInTheDocument()

    fireEvent.click(requestBtn)
    expect(screen.getByTestId('request-media-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Confirm Submitted'))
    await waitFor(() => {
      expect(getWatchlistAction).toHaveBeenCalledTimes(2)
    })

    fireEvent.click(screen.getByText('Close Request Modal'))
    expect(screen.queryByTestId('request-media-modal')).not.toBeInTheDocument()
  })

  it('changes tab and calls router.replace when tab buttons are clicked', async () => {
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const watchedTabButton = screen.getByRole('button', { name: /Watched & Logged/i })
    fireEvent.click(watchedTabButton)
    expect(mockReplace).toHaveBeenCalledWith('/watchlist?tab=watched')

    const requestsTabButton = screen.getByRole('button', { name: /Requests/i })
    fireEvent.click(requestsTabButton)
    expect(mockReplace).toHaveBeenCalledWith('/watchlist?tab=requests')

    const queuedTabButton = screen.getByRole('button', { name: /Queued/i })
    fireEvent.click(queuedTabButton)
    expect(mockReplace).toHaveBeenCalledWith('/watchlist')
  })

  it('renders Requests tab when isAdmin is true and tab=requests', async () => {
    mockSearchParams = new URLSearchParams('tab=requests')
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Severance')).toBeInTheDocument()
      expect(screen.getByText(/4 Requests/i)).toBeInTheDocument()
      expect(screen.getByText(/Requested by Alice/i)).toBeInTheDocument();
    })

    expect(getWatchRequestsAction).toHaveBeenCalledWith({
      category: 'ALL',
    })
  })

  it('allows admin to accept a request in the requests tab', async () => {
    mockSearchParams = new URLSearchParams('tab=requests')
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Severance')).toBeInTheDocument()
    })

    const acceptBtn = screen.getByRole('button', { name: /accept/i })
    fireEvent.click(acceptBtn)

    await waitFor(() => {
      expect(acceptWatchRequestAction).toHaveBeenCalledWith('req-1')
      expect(getWatchRequestsAction).toHaveBeenCalledTimes(2)
    })
  })

  it('alerts error when accepting a request fails', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(acceptWatchRequestAction).mockResolvedValueOnce({
      success: false,
      error: 'Failed to accept request',
    })

    mockSearchParams = new URLSearchParams('tab=requests')
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Severance')).toBeInTheDocument()
    })

    const acceptBtn = screen.getByRole('button', { name: /accept/i })
    fireEvent.click(acceptBtn)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to accept request')
    })
    alertSpy.mockRestore()
  })

  it('allows admin to reject a request in the requests tab', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockSearchParams = new URLSearchParams('tab=requests')
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Severance')).toBeInTheDocument()
    })

    const rejectBtn = screen.getByRole('button', { name: /reject/i })
    fireEvent.click(rejectBtn)

    await waitFor(() => {
      expect(rejectWatchRequestAction).toHaveBeenCalledWith('req-1')
      expect(getWatchRequestsAction).toHaveBeenCalledTimes(2)
    })
  })

  it('alerts error when rejecting a request fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(rejectWatchRequestAction).mockResolvedValueOnce({
      success: false,
      error: 'Failed to reject request',
    })

    mockSearchParams = new URLSearchParams('tab=requests')
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Severance')).toBeInTheDocument()
    })

    const rejectBtn = screen.getByRole('button', { name: /reject/i })
    fireEvent.click(rejectBtn)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to reject request')
    })
    alertSpy.mockRestore()
  })

  it('renders empty state when no requests exist', async () => {
    vi.mocked(getWatchRequestsAction).mockResolvedValueOnce({
      success: true,
      items: [],
      totalCount: 0,
    })

    mockSearchParams = new URLSearchParams('tab=requests')
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('No Pending Watch Requests')).toBeInTheDocument()
      expect(screen.getByText(/Viewer requests will appear here/i)).toBeInTheDocument()
    })
  })

  it('filters by category when category pills are clicked', async () => {
    render(<WatchlistGrid />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const moviesFilterButton = screen.getByRole('button', { name: 'Movies' })
    fireEvent.click(moviesFilterButton)

    await waitFor(() => {
      expect(getWatchlistAction).toHaveBeenCalledWith({
        isWatched: false,
        category: 'MOVIE',
      })
    })

    const tvFilterButton = screen.getByRole('button', { name: 'TV Series' })
    fireEvent.click(tvFilterButton)

    await waitFor(() => {
      expect(getWatchlistAction).toHaveBeenCalledWith({
        isWatched: false,
        category: 'TV',
      })
    })
  })

  it('renders empty state when no queued items are returned', async () => {
    vi.mocked(getWatchlistAction).mockResolvedValue({
      success: true,
      items: [],
      unwatchedCount: 0,
      watchedCount: 3,
      requestsCount: 0,
    })

    render(<WatchlistGrid />)

    await waitFor(() => {
      expect(screen.getByText('No Queued Items Found')).toBeInTheDocument()
      expect(screen.getByText(/Add upcoming movies, series, or docs to your watchlist/i)).toBeInTheDocument()
    })
  })

  it('renders empty state for watched tab when tab=watched in searchParams', async () => {
    mockSearchParams = new URLSearchParams('tab=watched')
    vi.mocked(getWatchlistAction).mockResolvedValue({
      success: true,
      items: [],
      unwatchedCount: 2,
      watchedCount: 0,
      requestsCount: 0,
    })

    render(<WatchlistGrid />)

    await waitFor(() => {
      expect(screen.getByText('No Watched Items Found')).toBeInTheDocument()
      expect(screen.getByText(/Items marked as watched or reviewed will appear here./i)).toBeInTheDocument()
    })

    expect(getWatchlistAction).toHaveBeenCalledWith({
      isWatched: true,
      category: 'ALL',
    })
  })

  it('opens and closes AddWatchlistModal when admin clicks Add to Watchlist', async () => {
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /Add to Watchlist/i })
    fireEvent.click(addButton)

    expect(screen.getByTestId('add-watchlist-modal')).toBeInTheDocument()

    const closeBtn = screen.getByText('Close Modal')
    fireEvent.click(closeBtn)

    expect(screen.queryByTestId('add-watchlist-modal')).not.toBeInTheDocument()
  })

  it('refreshes watchlist when modal onAdded callback is called', async () => {
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /Add to Watchlist/i })
    fireEvent.click(addButton)

    expect(screen.getByTestId('add-watchlist-modal')).toBeInTheDocument()

    const confirmAddedBtn = screen.getByText('Confirm Added')
    fireEvent.click(confirmAddedBtn)

    await waitFor(() => {
      expect(getWatchlistAction).toHaveBeenCalledTimes(2)
    })
  })

  it('does not render Add to Watchlist button if isAdmin is false', async () => {
    render(<WatchlistGrid isAdmin={false} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Add to Watchlist/i })).not.toBeInTheDocument()
  })

  it('handles item deletion when confirmed by user', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete Watchlist Item')
    fireEvent.click(deleteButtons[0])

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this watchlist item?')
    expect(deleteWatchlistItemAction).toHaveBeenCalledWith('item-1')

    await waitFor(() => {
      expect(getWatchlistAction).toHaveBeenCalledTimes(2)
    })

    confirmSpy.mockRestore()
  })

  it('does not delete item when cancelled by user in confirm prompt', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete Watchlist Item')
    fireEvent.click(deleteButtons[0])

    expect(confirmSpy).toHaveBeenCalled()
    expect(deleteWatchlistItemAction).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('alerts error if delete action fails', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(deleteWatchlistItemAction).mockResolvedValue({
      success: false,
      error: 'Delete failed due to network error',
    })

    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete Watchlist Item')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Delete failed due to network error')
    })

    confirmSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it('passes onLogReviewFromWatchlist callback to cards when isAdmin is true', async () => {
    const onLogReview = vi.fn()
    render(<WatchlistGrid isAdmin={true} onLogReviewFromWatchlist={onLogReview} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const logButtons = screen.getAllByRole('button', { name: /Log & Review Entry/i })
    fireEvent.click(logButtons[0])

    expect(onLogReview).toHaveBeenCalledWith(mockItems[0])
  })

  it('does not render Log & Review Entry buttons when isAdmin is false', async () => {
    render(<WatchlistGrid isAdmin={false} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Log & Review Entry/i })).not.toBeInTheDocument()
  })

  it('renders watched items in list view with rating and review link when tab is watched', async () => {
    mockSearchParams = new URLSearchParams('tab=watched')
    const mockWatchedItems = [
      {
        id: 'watched-1',
        title: 'Interstellar',
        mediaType: 'MOVIE',
        releaseYear: 2014,
        isWatched: true,
        post: {
          id: 'post-1',
          slug: 'interstellar',
          userRating: 5.0,
        },
      },
    ]

    vi.mocked(getWatchlistAction).mockResolvedValue({
      success: true,
      items: mockWatchedItems as any,
      unwatchedCount: 1,
      watchedCount: 1,
      requestsCount: 0,
    })

    render(<WatchlistGrid isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText('Interstellar')).toBeInTheDocument()
    })

    expect(screen.getByText('(2014)')).toBeInTheDocument()
    expect(screen.getByText('5.0')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read Review/i })).toHaveAttribute(
      'href',
      '/post/interstellar?from=watchlist&tab=watched'
    )
    expect(screen.getByTitle('Delete Watchlist Item')).toBeInTheDocument()
  })
})
