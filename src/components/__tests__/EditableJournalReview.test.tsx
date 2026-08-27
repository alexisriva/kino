import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EditableJournalReview } from '@/components/EditableJournalReview'
import { updatePostAction } from '@/actions/postActions'

vi.mock('@/actions/postActions', () => ({
  updatePostAction: vi.fn(),
}))

describe('EditableJournalReview', () => {
  const defaultProps = {
    postId: 'post-123',
    initialReview: 'This is the initial critical review.',
    tagsList: ['Masterpiece', 'Anime'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ authenticated: false }),
    } as any)
  })

  it('renders review text, header, and tags in view mode', () => {
    render(<EditableJournalReview {...defaultProps} isAdmin={false} />)

    expect(screen.getByText(/Journal Entry & Critical Review/i)).toBeInTheDocument()
    expect(screen.getByText('This is the initial critical review.')).toBeInTheDocument()
    expect(screen.getByText('#Masterpiece')).toBeInTheDocument()
    expect(screen.getByText('#Anime')).toBeInTheDocument()
    expect(screen.queryByTitle('Edit Journal Review')).not.toBeInTheDocument()
  })

  it('does not render edit button when isAdmin is false', () => {
    render(<EditableJournalReview {...defaultProps} isAdmin={false} />)

    expect(screen.queryByTitle('Edit Journal Review')).not.toBeInTheDocument()
  })

  it('checks admin status via API when isAdmin prop is undefined', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ authenticated: true }),
    } as any)

    render(<EditableJournalReview {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTitle('Edit Journal Review')).toBeInTheDocument()
    })
  })

  it('handles API check failure gracefully when isAdmin prop is undefined', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    render(<EditableJournalReview {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByTitle('Edit Journal Review')).not.toBeInTheDocument()
    })
  })

  it('renders edit button when isAdmin is true and switches to textarea editor when clicked', () => {
    render(<EditableJournalReview {...defaultProps} isAdmin={true} />)

    const editBtn = screen.getByTitle('Edit Journal Review')
    expect(editBtn).toBeInTheDocument()

    fireEvent.click(editBtn)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue('This is the initial critical review.')
    expect(screen.getByRole('button', { name: /Save Review/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })

  it('cancels editing and reverts text when cancel is clicked', () => {
    render(<EditableJournalReview {...defaultProps} isAdmin={true} />)

    fireEvent.click(screen.getByTitle('Edit Journal Review'))

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Modified text that will be canceled' } })
    expect(textarea).toHaveValue('Modified text that will be canceled')

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('This is the initial critical review.')).toBeInTheDocument()
  })

  it('shows error validation if review is saved empty', async () => {
    render(<EditableJournalReview {...defaultProps} isAdmin={true} />)

    fireEvent.click(screen.getByTitle('Edit Journal Review'))

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: '   ' } })

    fireEvent.click(screen.getByRole('button', { name: /Save Review/i }))

    expect(screen.getByText('Review content cannot be empty.')).toBeInTheDocument()
    expect(updatePostAction).not.toHaveBeenCalled()
  })

  it('calls updatePostAction and returns to view mode on successful save', async () => {
    vi.mocked(updatePostAction).mockResolvedValue({
      success: true,
      post: {
        id: 'post-123',
        review: 'Updated awesome review text.',
      } as any,
    })

    render(<EditableJournalReview {...defaultProps} isAdmin={true} />)

    fireEvent.click(screen.getByTitle('Edit Journal Review'))

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Updated awesome review text.' } })

    fireEvent.click(screen.getByRole('button', { name: /Save Review/i }))

    expect(updatePostAction).toHaveBeenCalledWith('post-123', {
      review: 'Updated awesome review text.',
    })

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByText('Updated awesome review text.')).toBeInTheDocument()
    })
  })

  it('displays error message if updatePostAction fails', async () => {
    vi.mocked(updatePostAction).mockResolvedValue({
      success: false,
      error: 'Unauthorized: Admin authentication required.',
    })

    render(<EditableJournalReview {...defaultProps} isAdmin={true} />)

    fireEvent.click(screen.getByTitle('Edit Journal Review'))

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Attempting edit without auth' } })

    fireEvent.click(screen.getByRole('button', { name: /Save Review/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Unauthorized: Admin authentication required.')
      ).toBeInTheDocument()
    })

    // Stays in edit mode
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('handles exceptions thrown by updatePostAction', async () => {
    vi.mocked(updatePostAction).mockRejectedValue(new Error('Server crash'))

    render(<EditableJournalReview {...defaultProps} isAdmin={true} />)

    fireEvent.click(screen.getByTitle('Edit Journal Review'))

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'New review' } })

    fireEvent.click(screen.getByRole('button', { name: /Save Review/i }))

    await waitFor(() => {
      expect(screen.getByText('Server crash')).toBeInTheDocument()
    })
  })
})
