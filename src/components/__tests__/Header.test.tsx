import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Header } from '@/components/Header'
let mockPathname = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => mockPathname,
}))

describe('Header', () => {
  beforeEach(() => {
    mockPathname = ''
  })

  describe('Brand & Logo', () => {
    it('renders the logo image and brand title linking to home', () => {
      render(<Header />)

      const logoImg = screen.getByAltText('KINO Logo')
      expect(logoImg).toBeInTheDocument()
      expect(logoImg).toHaveAttribute('src', '/logo.png')

      const brandTitle = screen.getByText('KINO')
      expect(brandTitle).toBeInTheDocument()

      const brandLink = brandTitle.closest('a')
      expect(brandLink).toHaveAttribute('href', '/')
    })
  })

  describe('Navigation Links & Active State', () => {
    it('renders Journal and Watchlist navigation links with correct hrefs', () => {
      render(<Header />)

      const journalLink = screen.getByRole('link', { name: /Journal/i })
      expect(journalLink).toBeInTheDocument()
      expect(journalLink).toHaveAttribute('href', '/')

      const watchlistLink = screen.getByRole('link', { name: /Watchlist/i })
      expect(watchlistLink).toBeInTheDocument()
      expect(watchlistLink).toHaveAttribute('href', '/watchlist')
    })

    it('highlights Journal tab when currentView is "journal"', () => {
      render(<Header currentView="journal" />)

      const journalLink = screen.getByRole('link', { name: /Journal/i })
      const watchlistLink = screen.getByRole('link', { name: /Watchlist/i })

      expect(journalLink.className).toContain('bg-[#f2ca50]')
      expect(journalLink.className).toContain('text-[#121315]')
      expect(watchlistLink.className).toContain('text-[#99907c]')
    })

    it('highlights Watchlist tab when currentView is "watchlist"', () => {
      render(<Header currentView="watchlist" />)

      const journalLink = screen.getByRole('link', { name: /Journal/i })
      const watchlistLink = screen.getByRole('link', { name: /Watchlist/i })

      expect(watchlistLink.className).toContain('bg-[#f2ca50]')
      expect(watchlistLink.className).toContain('text-[#121315]')
      expect(journalLink.className).toContain('text-[#99907c]')
    })

    it('determines active view from pathname when currentView is not provided (watchlist route)', () => {
      mockPathname = '/watchlist'
      render(<Header />)

      const journalLink = screen.getByRole('link', { name: /Journal/i })
      const watchlistLink = screen.getByRole('link', { name: /Watchlist/i })

      expect(watchlistLink.className).toContain('bg-[#f2ca50]')
      expect(watchlistLink.className).toContain('text-[#121315]')
      expect(journalLink.className).toContain('text-[#99907c]')
    })

    it('determines active view from pathname when currentView is not provided (watchlist subroute)', () => {
      mockPathname = '/watchlist/archive'
      render(<Header />)

      const watchlistLink = screen.getByRole('link', { name: /Watchlist/i })
      expect(watchlistLink.className).toContain('bg-[#f2ca50]')
    })

    it('determines active view from pathname when currentView is not provided (home or other route)', () => {
      mockPathname = '/'
      render(<Header />)

      const journalLink = screen.getByRole('link', { name: /Journal/i })
      const watchlistLink = screen.getByRole('link', { name: /Watchlist/i })

      expect(journalLink.className).toContain('bg-[#f2ca50]')
      expect(watchlistLink.className).toContain('text-[#99907c]')
    })

    it('handles null pathname gracefully when currentView is omitted', () => {
      mockPathname = null as unknown as string
      render(<Header />)

      const journalLink = screen.getByRole('link', { name: /Journal/i })
      expect(journalLink.className).toContain('bg-[#f2ca50]')
    })
  })

  describe('Search Input', () => {
    it('renders the search input with searchQuery and calls onSearchChange on user input', () => {
      const onSearchChange = vi.fn()
      render(
        <Header
          searchQuery="Inception"
          onSearchChange={onSearchChange}
          currentView="journal"
        />
      )

      const searchInput = screen.getByPlaceholderText('Search reviews...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveValue('Inception')

      fireEvent.change(searchInput, { target: { value: 'Interstellar' } })
      expect(onSearchChange).toHaveBeenCalledTimes(1)
      expect(onSearchChange).toHaveBeenCalledWith('Interstellar')
    })

    it('uses empty string as default searchQuery when searchQuery prop is omitted', () => {
      render(<Header onSearchChange={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText('Search reviews...')
      expect(searchInput).toHaveValue('')
    })

    it('renders "Search watchlist..." placeholder when viewing watchlist', () => {
      render(
        <Header
          onSearchChange={vi.fn()}
          currentView="watchlist"
        />
      )

      expect(screen.getByPlaceholderText('Search watchlist...')).toBeInTheDocument()
    })

    it('does not render search input when onSearchChange is not provided', () => {
      render(<Header searchQuery="Matrix" />)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText(/Search/i)).not.toBeInTheDocument()
    })
  })

  describe('Admin Control & Modal Trigger', () => {
    it('renders "Admin Access" button when isAdmin is false and invokes onOpenAdminModal on click', () => {
      const onOpenAdminModal = vi.fn()
      render(<Header isAdmin={false} onOpenAdminModal={onOpenAdminModal} />)

      const adminButton = screen.getByRole('button', { name: /Admin Access/i })
      expect(adminButton).toBeInTheDocument()
      expect(screen.queryByText(/Admin Mode/i)).not.toBeInTheDocument()

      fireEvent.click(adminButton)
      expect(onOpenAdminModal).toHaveBeenCalledTimes(1)
    })

    it('renders "Admin Mode" button when isAdmin is true and invokes onOpenAdminModal on click', () => {
      const onOpenAdminModal = vi.fn()
      render(<Header isAdmin={true} onOpenAdminModal={onOpenAdminModal} />)

      const adminButton = screen.getByRole('button', { name: /Admin Mode/i })
      expect(adminButton).toBeInTheDocument()
      expect(screen.queryByText(/Admin Access/i)).not.toBeInTheDocument()

      fireEvent.click(adminButton)
      expect(onOpenAdminModal).toHaveBeenCalledTimes(1)
    })

    it('does not throw when clicking "Admin Access" without onOpenAdminModal provided', () => {
      render(<Header isAdmin={false} />)

      const adminButton = screen.getByRole('button', { name: /Admin Access/i })
      expect(() => fireEvent.click(adminButton)).not.toThrow()
    })

    it('does not throw when clicking "Admin Mode" without onOpenAdminModal provided', () => {
      render(<Header isAdmin={true} />)

      const adminButton = screen.getByRole('button', { name: /Admin Mode/i })
      expect(() => fireEvent.click(adminButton)).not.toThrow()
    })
  })

  describe('Default Props', () => {
    it('renders default Header without props successfully', () => {
      render(<Header />)

      expect(screen.getByText('KINO')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Admin Access/i })).toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })
})

