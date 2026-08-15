import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StarRating } from '@/components/StarRating'

describe('StarRating', () => {
  describe('Rendering and Default Props', () => {
    it('renders correctly with given positive rating', () => {
      render(<StarRating rating={4.5} />)
      expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('renders "NR" when rating is 0 or negative', () => {
      const { rerender } = render(<StarRating rating={0} />)
      expect(screen.getByText('NR')).toBeInTheDocument()

      rerender(<StarRating rating={-1} />)
      expect(screen.getByText('NR')).toBeInTheDocument()
    })

    it('renders custom maxRating', () => {
      const { container } = render(<StarRating rating={3} maxRating={10} />)
      expect(screen.getByText('3.0')).toBeInTheDocument()
      const starWrappers = container.querySelectorAll('.relative.inline-flex')
      expect(starWrappers).toHaveLength(10)
    })

    it('renders with different size props (sm, md, lg)', () => {
      const { container, rerender } = render(<StarRating rating={3} size="sm" />)
      let svgs = container.querySelectorAll('svg')
      expect(svgs[0].getAttribute('class')).toContain('w-3.5 h-3.5')

      rerender(<StarRating rating={3} size="md" />)
      svgs = container.querySelectorAll('svg')
      expect(svgs[0].getAttribute('class')).toContain('w-4 h-4')

      rerender(<StarRating rating={3} size="lg" />)
      svgs = container.querySelectorAll('svg')
      expect(svgs[0].getAttribute('class')).toContain('w-6 h-6')
    })

    it('does not render interactive hitboxes when interactive is false', () => {
      render(<StarRating rating={3} interactive={false} />)
      expect(screen.queryByTitle('0.5 Stars')).not.toBeInTheDocument()
      expect(screen.queryByTitle('1 Stars')).not.toBeInTheDocument()
    })

    it('handles mouse leave when not interactive without changing rating', () => {
      const { container } = render(<StarRating rating={3} interactive={false} />)
      const starWrapper = container.querySelector('.relative.inline-flex')
      expect(starWrapper).not.toBeNull()
      if (starWrapper) {
        fireEvent.mouseLeave(starWrapper)
      }
      expect(screen.getByText('3.0')).toBeInTheDocument()
    })
  })

  describe('Interactive Mode', () => {
    it('renders cursor-pointer and hitboxes when interactive is true', () => {
      const { container } = render(<StarRating rating={3} interactive={true} />)
      const starWrappers = container.querySelectorAll('.relative.inline-flex')
      starWrappers.forEach((wrapper) => {
        expect(wrapper.className).toContain('cursor-pointer')
      })
      expect(screen.getByTitle('0.5 Stars')).toBeInTheDocument()
      expect(screen.getByTitle('1 Stars')).toBeInTheDocument()
      expect(screen.getByTitle('5 Stars')).toBeInTheDocument()
    })

    it('updates displayed rating onMouseEnter for half and full star hitboxes and resets onMouseLeave', () => {
      const { container } = render(<StarRating rating={3} interactive={true} />)
      expect(screen.getByText('3.0')).toBeInTheDocument()

      const halfHitbox = screen.getByTitle('1.5 Stars')
      fireEvent.mouseEnter(halfHitbox)
      expect(screen.getByText('1.5')).toBeInTheDocument()

      const fullHitbox = screen.getByTitle('4 Stars')
      fireEvent.mouseEnter(fullHitbox)
      expect(screen.getByText('4.0')).toBeInTheDocument()

      const starWrapper = container.querySelector('.relative.inline-flex')
      expect(starWrapper).not.toBeNull()
      if (starWrapper) {
        fireEvent.mouseLeave(starWrapper)
      }
      expect(screen.getByText('3.0')).toBeInTheDocument()
    })

    it('calls onChange with halfValue when clicking half star hitbox', () => {
      const onChange = vi.fn()
      render(<StarRating rating={3} interactive={true} onChange={onChange} />)

      const halfHitbox = screen.getByTitle('2.5 Stars')
      fireEvent.click(halfHitbox)

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(2.5)
    })

    it('calls onChange with fullValue when clicking full star hitbox', () => {
      const onChange = vi.fn()
      render(<StarRating rating={3} interactive={true} onChange={onChange} />)

      const fullHitbox = screen.getByTitle('5 Stars')
      fireEvent.click(fullHitbox)

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(5)
    })

    it('handles clicking hitboxes when onChange is not provided', () => {
      render(<StarRating rating={3} interactive={true} />)

      const halfHitbox = screen.getByTitle('3.5 Stars')
      expect(() => fireEvent.click(halfHitbox)).not.toThrow()

      const fullHitbox = screen.getByTitle('4 Stars')
      expect(() => fireEvent.click(fullHitbox)).not.toThrow()
    })
  })
})
