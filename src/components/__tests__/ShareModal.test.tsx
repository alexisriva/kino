import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShareModal } from '@/components/ShareModal';

describe('ShareModal', () => {
  const defaultProps = {
    title: 'Dune: Part Two',
    slug: 'dune-part-two-2024',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial share trigger button and modal is closed', () => {
    render(<ShareModal {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /share entry/i })).not.toBeInTheDocument();
  });

  it('calls navigator.share when available and does not open fallback modal', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareModal {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    expect(mockShare).toHaveBeenCalledWith({
      title: 'KINO — Dune: Part Two',
      text: 'Check out this review of "Dune: Part Two" on KINO!',
      url: `${window.location.origin}/post/dune-part-two-2024`,
    });

    // Fallback modal dialog should not be rendered
    expect(screen.queryByRole('heading', { name: /share entry/i })).not.toBeInTheDocument();
  });

  it('handles cancelled native share gracefully without throwing or opening modal', async () => {
    const mockShare = vi.fn().mockRejectedValue(new Error('AbortError'));
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareModal {...defaultProps} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    expect(mockShare).toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /share entry/i })).not.toBeInTheDocument();
  });

  describe('Fallback Modal (when navigator.share is unavailable)', () => {
    beforeEach(() => {
      // Remove navigator.share to trigger modal fallback
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    it('opens fallback modal dialog when clicking share button', () => {
      render(<ShareModal {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      expect(screen.getByRole('heading', { name: /share entry/i })).toBeInTheDocument();
      expect(screen.getByText(/share/i, { selector: 'p' })).toBeInTheDocument();
      expect(screen.getByText('Dune: Part Two')).toBeInTheDocument();
      expect(screen.getByDisplayValue(`${window.location.origin}/post/dune-part-two-2024`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /share on x \(twitter\)/i })).toBeInTheDocument();
    });

    it('locks body scroll when modal opens and unlocks on close', () => {
      const { unmount } = render(<ShareModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('');

      // Open modal
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(document.body.style.overflow).toBe('hidden');

      // Close modal using X button in modal header (second button in the DOM)
      const buttons = screen.getAllByRole('button');
      const modalCloseBtn = buttons[1];
      fireEvent.click(modalCloseBtn);

      expect(document.body.style.overflow).toBe('');
      expect(screen.queryByRole('heading', { name: /share entry/i })).not.toBeInTheDocument();

      // Open modal again and verify unlock on unmount
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('copies share link to clipboard and shows temporary copied state', () => {
      vi.useFakeTimers();

      render(<ShareModal {...defaultProps} />);

      // Open modal
      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      const copyBtn = screen.getByRole('button', { name: /copy link/i });
      fireEvent.click(copyBtn);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `${window.location.origin}/post/dune-part-two-2024`
      );
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();

      // Fast-forward 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText(/copy link/i)).toBeInTheDocument();
      expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
    });

    it('renders correct Twitter / X share link with proper attributes', () => {
      render(<ShareModal {...defaultProps} />);

      // Open modal
      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      const twitterLink = screen.getByRole('link', { name: /share on x \(twitter\)/i });
      expect(twitterLink).toHaveAttribute('target', '_blank');
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');

      const expectedText = encodeURIComponent('Check out this review of "Dune: Part Two" on KINO!');
      const expectedUrl = encodeURIComponent(`${window.location.origin}/post/dune-part-two-2024`);
      expect(twitterLink).toHaveAttribute(
        'href',
        `https://twitter.com/intent/tweet?text=${expectedText}&url=${expectedUrl}`
      );
    });
  });
});
