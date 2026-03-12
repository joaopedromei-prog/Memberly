import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '@/components/ui/ProgressBar';

describe('ProgressBar', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressBar value={75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    render(<ProgressBar value={50} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('uses primary color for incomplete progress', () => {
    const { container } = render(<ProgressBar value={45} />);
    const bar = container.querySelector('.bg-primary');
    expect(bar).toBeInTheDocument();
  });

  it('uses success color for 100% progress', () => {
    const { container } = render(<ProgressBar value={100} />);
    const bar = container.querySelector('[class*="46D369"]');
    expect(bar).toBeInTheDocument();
  });

  it('clamps value between 0 and 100', () => {
    render(<ProgressBar value={150} showLabel />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
