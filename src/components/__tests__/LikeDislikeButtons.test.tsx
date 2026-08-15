import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LikeDislikeButtons } from '@/components/LikeDislikeButtons'
import { toggleVoteAction, getUserVoteStatusAction } from '@/actions/postActions'
import { getOrCreateDeviceToken } from '@/lib/deviceToken'
import confetti from 'canvas-confetti'

// Mock the actions
vi.mock('@/actions/postActions', () => ({
  toggleVoteAction: vi.fn(),
  getUserVoteStatusAction: vi.fn(),
}))

// Mock device token
vi.mock('@/lib/deviceToken', () => ({
  getOrCreateDeviceToken: vi.fn().mockReturnValue('test-device-token'),
}))

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('LikeDislikeButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getUserVoteStatusAction).mockResolvedValue({ success: true, userVote: null })
  })

  describe('Rendering & Size Styling', () => {
    it('renders initial likes and dislikes with default size (md)', async () => {
      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      const likeBtn = screen.getByTitle('Like entry')
      const dislikeBtn = screen.getByTitle('Dislike entry')

      expect(likeBtn).toBeInTheDocument()
      expect(dislikeBtn).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()

      // Check default size (md) padding
      expect(likeBtn).toHaveClass('px-3', 'py-1.5', 'text-xs', 'font-medium')
      expect(dislikeBtn).toHaveClass('px-3', 'py-1.5', 'text-xs', 'font-medium')

      // Check default inactive styling
      expect(likeBtn).toHaveClass('bg-[#1b1c1e]', 'text-[#c6c6c9]', 'border-[#292a2c]')
      expect(dislikeBtn).toHaveClass('bg-[#1b1c1e]', 'text-[#c6c6c9]', 'border-[#292a2c]')

      // Check default icon size
      const likeIcon = likeBtn.querySelector('svg')
      const dislikeIcon = dislikeBtn.querySelector('svg')
      expect(likeIcon).toHaveClass('w-3.5', 'h-3.5')
      expect(dislikeIcon).toHaveClass('w-3.5', 'h-3.5')
    })

    it('renders with small size (sm)', () => {
      render(
        <LikeDislikeButtons
          postId="post-1"
          initialLikes={2}
          initialDislikes={1}
          size="sm"
        />
      )

      const likeBtn = screen.getByTitle('Like entry')
      const dislikeBtn = screen.getByTitle('Dislike entry')

      expect(likeBtn).toHaveClass('px-2.5', 'py-1', 'text-xs')
      expect(dislikeBtn).toHaveClass('px-2.5', 'py-1', 'text-xs')

      const likeIcon = likeBtn.querySelector('svg')
      expect(likeIcon).toHaveClass('w-3.5', 'h-3.5')
    })

    it('renders with large size (lg)', () => {
      render(
        <LikeDislikeButtons
          postId="post-1"
          initialLikes={50}
          initialDislikes={3}
          size="lg"
        />
      )

      const likeBtn = screen.getByTitle('Like entry')
      const dislikeBtn = screen.getByTitle('Dislike entry')

      expect(likeBtn).toHaveClass('px-4', 'py-2', 'text-sm', 'font-semibold')
      expect(dislikeBtn).toHaveClass('px-4', 'py-2', 'text-sm', 'font-semibold')

      const likeIcon = likeBtn.querySelector('svg')
      const dislikeIcon = dislikeBtn.querySelector('svg')
      expect(likeIcon).toHaveClass('w-4', 'h-4')
      expect(dislikeIcon).toHaveClass('w-4', 'h-4')
    })
  })

  describe('Initial Vote Status Fetching', () => {
    it('fetches and sets user vote to LIKE on mount', async () => {
      vi.mocked(getUserVoteStatusAction).mockResolvedValueOnce({
        success: true,
        userVote: 'LIKE',
      })

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      await waitFor(() => {
        expect(getOrCreateDeviceToken).toHaveBeenCalled()
        expect(getUserVoteStatusAction).toHaveBeenCalledWith('post-1', 'test-device-token')
      })

      const likeBtn = screen.getByTitle('Like entry')
      const dislikeBtn = screen.getByTitle('Dislike entry')

      await waitFor(() => {
        expect(likeBtn).toHaveClass('bg-[#f2ca50]/20', 'text-[#f2ca50]', 'border-[#f2ca50]/50')
        expect(likeBtn.querySelector('svg')).toHaveClass('fill-[#f2ca50]')
      })

      expect(dislikeBtn).toHaveClass('bg-[#1b1c1e]', 'text-[#c6c6c9]')
      expect(dislikeBtn.querySelector('svg')).not.toHaveClass('fill-rose-400')
    })

    it('fetches and sets user vote to DISLIKE on mount', async () => {
      vi.mocked(getUserVoteStatusAction).mockResolvedValueOnce({
        success: true,
        userVote: 'DISLIKE',
      })

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      const likeBtn = screen.getByTitle('Like entry')
      const dislikeBtn = screen.getByTitle('Dislike entry')

      await waitFor(() => {
        expect(dislikeBtn).toHaveClass('bg-rose-500/20', 'text-rose-400', 'border-rose-500/50')
        expect(dislikeBtn.querySelector('svg')).toHaveClass('fill-rose-400')
      })

      expect(likeBtn).toHaveClass('bg-[#1b1c1e]', 'text-[#c6c6c9]')
      expect(likeBtn.querySelector('svg')).not.toHaveClass('fill-[#f2ca50]')
    })

    it('handles getUserVoteStatusAction returning success false gracefully', async () => {
      vi.mocked(getUserVoteStatusAction).mockResolvedValueOnce({
        success: false,
        userVote: null,
      })

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      await waitFor(() => {
        expect(getUserVoteStatusAction).toHaveBeenCalledWith('post-1', 'test-device-token')
      })

      const likeBtn = screen.getByTitle('Like entry')
      const dislikeBtn = screen.getByTitle('Dislike entry')

      expect(likeBtn).toHaveClass('bg-[#1b1c1e]')
      expect(dislikeBtn).toHaveClass('bg-[#1b1c1e]')
    })

    it('re-fetches vote status when postId prop changes', async () => {
      vi.mocked(getUserVoteStatusAction)
        .mockResolvedValueOnce({ success: true, userVote: 'LIKE' })
        .mockResolvedValueOnce({ success: true, userVote: 'DISLIKE' })

      const { rerender } = render(
        <LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />
      )

      await waitFor(() => {
        expect(getUserVoteStatusAction).toHaveBeenCalledWith('post-1', 'test-device-token')
        expect(screen.getByTitle('Like entry')).toHaveClass('bg-[#f2ca50]/20')
      })

      rerender(<LikeDislikeButtons postId="post-2" initialLikes={10} initialDislikes={5} />)

      await waitFor(() => {
        expect(getUserVoteStatusAction).toHaveBeenCalledWith('post-2', 'test-device-token')
        expect(screen.getByTitle('Dislike entry')).toHaveClass('bg-rose-500/20')
      })
    })
  })

  describe('Voting Interactions', () => {
    it('successfully votes LIKE, updates counts, and triggers confetti', async () => {
      vi.mocked(toggleVoteAction).mockResolvedValueOnce({
        success: true,
        likesCount: 11,
        dislikesCount: 5,
        userVote: 'LIKE',
      })

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      const likeBtn = screen.getByTitle('Like entry')
      fireEvent.click(likeBtn)

      await waitFor(() => {
        expect(toggleVoteAction).toHaveBeenCalledWith('post-1', 'LIKE', 'test-device-token')
        expect(screen.getByText('11')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(likeBtn).toHaveClass('bg-[#f2ca50]/20', 'text-[#f2ca50]')
        expect(likeBtn.querySelector('svg')).toHaveClass('fill-[#f2ca50]')
      })

      expect(confetti).toHaveBeenCalledTimes(1)
      expect(confetti).toHaveBeenCalledWith({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#f2ca50', '#d4af37', '#e3e2e5'],
      })
    })

    it('successfully removes LIKE when clicking like again and does not trigger confetti', async () => {
      vi.mocked(getUserVoteStatusAction).mockResolvedValueOnce({
        success: true,
        userVote: 'LIKE',
      })
      vi.mocked(toggleVoteAction).mockResolvedValueOnce({
        success: true,
        likesCount: 10,
        dislikesCount: 5,
        userVote: null,
      })

      render(<LikeDislikeButtons postId="post-1" initialLikes={11} initialDislikes={5} />)

      const likeBtn = screen.getByTitle('Like entry')

      await waitFor(() => {
        expect(likeBtn).toHaveClass('bg-[#f2ca50]/20')
      })

      fireEvent.click(likeBtn)

      await waitFor(() => {
        expect(toggleVoteAction).toHaveBeenCalledWith('post-1', 'LIKE', 'test-device-token')
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(likeBtn).toHaveClass('bg-[#1b1c1e]', 'text-[#c6c6c9]')
        expect(likeBtn.querySelector('svg')).not.toHaveClass('fill-[#f2ca50]')
      })

      expect(confetti).not.toHaveBeenCalled()
    })

    it('successfully votes DISLIKE, updates counts, and does not trigger confetti', async () => {
      vi.mocked(toggleVoteAction).mockResolvedValueOnce({
        success: true,
        likesCount: 10,
        dislikesCount: 6,
        userVote: 'DISLIKE',
      })

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      const dislikeBtn = screen.getByTitle('Dislike entry')
      fireEvent.click(dislikeBtn)

      await waitFor(() => {
        expect(toggleVoteAction).toHaveBeenCalledWith('post-1', 'DISLIKE', 'test-device-token')
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('6')).toBeInTheDocument()
        expect(dislikeBtn).toHaveClass('bg-rose-500/20', 'text-rose-400')
        expect(dislikeBtn.querySelector('svg')).toHaveClass('fill-rose-400')
      })

      expect(confetti).not.toHaveBeenCalled()
    })

    it('successfully removes DISLIKE when clicking dislike again', async () => {
      vi.mocked(getUserVoteStatusAction).mockResolvedValueOnce({
        success: true,
        userVote: 'DISLIKE',
      })
      vi.mocked(toggleVoteAction).mockResolvedValueOnce({
        success: true,
        likesCount: 10,
        dislikesCount: 5,
        userVote: null,
      })

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={6} />)

      const dislikeBtn = screen.getByTitle('Dislike entry')

      await waitFor(() => {
        expect(dislikeBtn).toHaveClass('bg-rose-500/20')
      })

      fireEvent.click(dislikeBtn)

      await waitFor(() => {
        expect(toggleVoteAction).toHaveBeenCalledWith('post-1', 'DISLIKE', 'test-device-token')
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(dislikeBtn).toHaveClass('bg-[#1b1c1e]')
        expect(dislikeBtn.querySelector('svg')).not.toHaveClass('fill-rose-400')
      })
    })

    it('handles toggleVoteAction success response with nullish counts and vote falling back to current state', async () => {
      vi.mocked(toggleVoteAction).mockResolvedValueOnce({
        success: true,
        likesCount: undefined as unknown as number,
        dislikesCount: undefined as unknown as number,
        userVote: undefined as unknown as null,
      } as Awaited<ReturnType<typeof toggleVoteAction>>)

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      const likeBtn = screen.getByTitle('Like entry')
      fireEvent.click(likeBtn)

      await waitFor(() => {
        expect(toggleVoteAction).toHaveBeenCalled()
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(likeBtn).toHaveClass('bg-[#1b1c1e]')
      })
    })

    it('handles toggleVoteAction failure response without updating counts or vote', async () => {
      vi.mocked(toggleVoteAction).mockResolvedValueOnce({
        success: false,
        error: 'Vote action failed',
      })

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      const likeBtn = screen.getByTitle('Like entry')
      fireEvent.click(likeBtn)

      await waitFor(() => {
        expect(toggleVoteAction).toHaveBeenCalled()
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(likeBtn).toHaveClass('bg-[#1b1c1e]')
      })

      expect(confetti).not.toHaveBeenCalled()
      expect(likeBtn).not.toBeDisabled()
    })

    it('disables buttons while voting is in progress and prevents concurrent votes', async () => {
      type ToggleVoteResult = Awaited<ReturnType<typeof toggleVoteAction>>
      let resolvePromise: (value: ToggleVoteResult) => void = () => {}
      vi.mocked(toggleVoteAction).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve
          })
      )

      render(<LikeDislikeButtons postId="post-1" initialLikes={10} initialDislikes={5} />)

      const likeBtn = screen.getByTitle('Like entry')
      const dislikeBtn = screen.getByTitle('Dislike entry')

      fireEvent.click(likeBtn)

      expect(likeBtn).toBeDisabled()
      expect(dislikeBtn).toBeDisabled()

      // Trigger onClick while loading is true to hit the `if (loading) return;` branch
      const reactPropsKey = Object.keys(likeBtn).find((key) => key.startsWith('__reactProps$'))
      if (reactPropsKey) {
        const props = (likeBtn as unknown as Record<string, { onClick?: () => void }>)[reactPropsKey]
        props?.onClick?.()
      }

      expect(toggleVoteAction).toHaveBeenCalledTimes(1)

      // Resolve async action
      resolvePromise({
        success: true,
        likesCount: 11,
        dislikesCount: 5,
        userVote: 'LIKE',
      })

      await waitFor(() => {
        expect(likeBtn).not.toBeDisabled()
        expect(dislikeBtn).not.toBeDisabled()
        expect(screen.getByText('11')).toBeInTheDocument()
      })
    })
  })
})

