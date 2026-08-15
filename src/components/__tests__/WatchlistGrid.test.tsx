import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WatchlistGrid } from '@/components/WatchlistGrid'
import { getWatchlistAction, deleteWatchlistItemAction } from '@/actions/watchlistActions'

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

vi.mock('@/components/AddWatchlistModal', () => ({
  AddWatchlistModal: ({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) => (
    <div data-testid="add-watchlist-modal">
      <button onClick={onClose}>Close Modal</button>
      <button onClick={onAdded}>Confirm Added</button>
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

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    vi.mocked(getWatchlistAction).mockResolvedValue({
      success: true,
      items: mockItems as any,
      unwatchedCount: 2,
      watchedCount: 5,
    })
    vi.mocked(deleteWatchlistItemAction).mockResolvedValue({
      success: true,
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
      search: '',
    })
  })

  it('changes tab and calls router.replace when tab buttons are clicked', async () => {
    render(<WatchlistGrid />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const watchedTabButton = screen.getByRole('button', { name: /Watched & Logged/i })
    fireEvent.click(watchedTabButton)

    expect(mockReplace).toHaveBeenCalledWith('/watchlist?tab=watched')

    const queuedTabButton = screen.getByRole('button', { name: /Queued/i })
    fireEvent.click(queuedTabButton)

    expect(mockReplace).toHaveBeenCalledWith('/watchlist')
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
        search: '',
      })
    })

    const tvFilterButton = screen.getByRole('button', { name: 'TV Series' })
    fireEvent.click(tvFilterButton)

    await waitFor(() => {
      expect(getWatchlistAction).toHaveBeenCalledWith({
        isWatched: false,
        category: 'TV',
        search: '',
      })
    })
  })

  it('re-fetches when searchQuery prop changes', async () => {
    const { rerender } = render(<WatchlistGrid searchQuery="" />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    rerender(<WatchlistGrid searchQuery="Nolan" />)

    await waitFor(() => {
      expect(getWatchlistAction).toHaveBeenCalledWith({
        isWatched: false,
        category: 'ALL',
        search: 'Nolan',
      })
    })
  })

  it('renders empty state when no queued items are returned', async () => {
    vi.mocked(getWatchlistAction).mockResolvedValue({
      success: true,
      items: [],
      unwatchedCount: 0,
      watchedCount: 3,
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
    })

    render(<WatchlistGrid />)

    await waitFor(() => {
      expect(screen.getByText('No Watched Items Found')).toBeInTheDocument()
      expect(screen.getByText(/Items marked as watched or reviewed will appear here./i)).toBeInTheDocument()
    })

    expect(getWatchlistAction).toHaveBeenCalledWith({
      isWatched: true,
      category: 'ALL',
      search: '',
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

  it('passes onLogReviewFromWatchlist callback to cards', async () => {
    const onLogReview = vi.fn()
    render(<WatchlistGrid onLogReviewFromWatchlist={onLogReview} />)

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })

    const logButtons = screen.getAllByRole('button', { name: /Log & Review Entry/i })
    fireEvent.click(logButtons[0])

    expect(onLogReview).toHaveBeenCalledWith(mockItems[0])
  })
})
