import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StarRating } from '@/components/StarRating'

describe('StarRating', () => {
  it('renders correctly with given rating', () => {
    render(<StarRating rating={4.5} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })
})
