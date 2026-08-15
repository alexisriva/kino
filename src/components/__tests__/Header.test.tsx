import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Header } from '@/components/Header'

describe('Header', () => {
  it('renders the logo and title', () => {
    render(
      <Header
        searchQuery=""
        onSearchChange={vi.fn()}
        isAdmin={false}
        onOpenAdminModal={vi.fn()}
        currentView="journal"
      />
    )
    expect(screen.getByText('KINO')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(
      <Header
        searchQuery="Inception"
        onSearchChange={vi.fn()}
        isAdmin={false}
        onOpenAdminModal={vi.fn()}
        currentView="journal"
      />
    )
    expect(screen.getByPlaceholderText(/Search reviews\.\.\./i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Inception')).toBeInTheDocument()
  })
})
