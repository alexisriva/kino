import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LikeDislikeButtons } from '@/components/LikeDislikeButtons'

// Mock the actions
vi.mock('@/actions/postActions', () => ({
  toggleVoteAction: vi.fn(),
  getUserVoteStatusAction: vi.fn().mockResolvedValue({ success: true, userVote: null })
}))

// Mock device token
vi.mock('@/lib/deviceToken', () => ({
  getOrCreateDeviceToken: vi.fn().mockReturnValue('fake-token')
}))

describe('LikeDislikeButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders initial likes and dislikes', () => {
    render(<LikeDislikeButtons postId="1" initialLikes={10} initialDislikes={5} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
