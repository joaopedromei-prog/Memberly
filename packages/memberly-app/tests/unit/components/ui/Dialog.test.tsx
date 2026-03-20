import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from '@/components/ui/Dialog';

describe('Dialog', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders nothing when open=false', () => {
    const { container } = render(
      <Dialog open={false} onClose={onClose}>
        <p>Content</p>
      </Dialog>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders content when open=true', () => {
    render(
      <Dialog open={true} onClose={onClose}>
        <p>Dialog content</p>
      </Dialog>
    );
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <Dialog open={true} onClose={onClose}>
        <p>Content</p>
      </Dialog>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the overlay', () => {
    render(
      <Dialog open={true} onClose={onClose}>
        <p>Content</p>
      </Dialog>
    );
    fireEvent.click(screen.getByTestId('dialog-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when clicking the content area', () => {
    render(
      <Dialog open={true} onClose={onClose}>
        <p>Content</p>
      </Dialog>
    );
    fireEvent.click(screen.getByTestId('dialog-content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders Header, Body, and Footer sub-components', () => {
    render(
      <Dialog open={true} onClose={onClose}>
        <Dialog.Header>My Title</Dialog.Header>
        <Dialog.Body>Body text</Dialog.Body>
        <Dialog.Footer>
          <button>OK</button>
        </Dialog.Footer>
      </Dialog>
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('applies correct max-width class based on size prop', () => {
    const sizes = [
      { size: 'sm' as const, expected: 'max-w-sm' },
      { size: 'md' as const, expected: 'max-w-md' },
      { size: 'lg' as const, expected: 'max-w-lg' },
      { size: 'xl' as const, expected: 'max-w-xl' },
    ];

    for (const { size, expected } of sizes) {
      const { unmount } = render(
        <Dialog open={true} onClose={onClose} size={size}>
          <p>Content</p>
        </Dialog>
      );
      expect(screen.getByTestId('dialog-content').className).toContain(expected);
      unmount();
    }
  });

  it('defaults to md size when no size prop is provided', () => {
    render(
      <Dialog open={true} onClose={onClose}>
        <p>Content</p>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-content').className).toContain('max-w-md');
  });

  it('has correct ARIA attributes', () => {
    render(
      <Dialog open={true} onClose={onClose}>
        <p>Content</p>
      </Dialog>
    );
    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveAttribute('role', 'dialog');
    expect(content).toHaveAttribute('aria-modal', 'true');
  });

  it('uses motion elements for overlay and content (AnimatePresence wrapping)', () => {
    const { container } = render(
      <Dialog open={true} onClose={onClose}>
        <p>Animated content</p>
      </Dialog>
    );
    // With the motion mock, motion.div renders as <div>
    // The overlay and content should both be rendered as divs
    expect(screen.getByTestId('dialog-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Animated content')).toBeInTheDocument();
  });

  it('renders nothing inside AnimatePresence when closed', () => {
    const { container } = render(
      <Dialog open={false} onClose={onClose}>
        <p>Hidden</p>
      </Dialog>
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });
});
