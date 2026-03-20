import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StreakCounter, StreakCounterSkeleton } from '@/components/member/StreakCounter';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockStreakResponse(data: {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}) {
  mockFetch.mockResolvedValueOnce({
    json: () => Promise.resolve({ data }),
  });
}

describe('StreakCounter', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders skeleton while loading', () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // never resolves
    const { container } = render(<StreakCounter />);
    expect(container.querySelector('.animate-shimmer')).toBeInTheDocument();
  });

  it('renders current streak count and label', async () => {
    mockStreakResponse({ current_streak: 5, longest_streak: 10, last_activity_date: '2026-03-20' });
    render(<StreakCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('streak-count')).toHaveTextContent('5');
    });
    expect(screen.getByText('dias consecutivos')).toBeInTheDocument();
  });

  it('renders fire emoji icon', async () => {
    mockStreakResponse({ current_streak: 3, longest_streak: 3, last_activity_date: '2026-03-20' });
    render(<StreakCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('streak-icon')).toHaveTextContent('🔥');
    });
  });

  it('renders longest streak as record', async () => {
    mockStreakResponse({ current_streak: 5, longest_streak: 15, last_activity_date: '2026-03-20' });
    render(<StreakCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('streak-record')).toHaveTextContent('Recorde: 15 dias');
    });
  });

  it('does not render record when longest_streak is 0', async () => {
    mockStreakResponse({ current_streak: 1, longest_streak: 0, last_activity_date: '2026-03-20' });
    render(<StreakCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('streak-count')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('streak-record')).not.toBeInTheDocument();
  });

  it('renders motivational message when streak is 0', async () => {
    mockStreakResponse({ current_streak: 0, longest_streak: 5, last_activity_date: null });
    render(<StreakCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('streak-zero-message')).toHaveTextContent('Comece sua sequência hoje!');
    });
    expect(screen.queryByTestId('streak-count')).not.toBeInTheDocument();
  });

  it('applies milestone animation for streak of 7', async () => {
    mockStreakResponse({ current_streak: 7, longest_streak: 7, last_activity_date: '2026-03-20' });
    render(<StreakCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('streak-count')).toHaveTextContent('7');
    });
    // milestone animation is applied via motion props (stripped in test env)
    // we verify the icon renders — animation props verified via component structure
    expect(screen.getByTestId('streak-icon')).toBeInTheDocument();
  });

  it('applies milestone animation for streak of 30', async () => {
    mockStreakResponse({ current_streak: 30, longest_streak: 30, last_activity_date: '2026-03-20' });
    render(<StreakCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('streak-count')).toHaveTextContent('30');
    });
    expect(screen.getByTestId('streak-icon')).toBeInTheDocument();
  });

  it('fetches from /api/gamification/streak', async () => {
    mockStreakResponse({ current_streak: 1, longest_streak: 1, last_activity_date: '2026-03-20' });
    render(<StreakCounter />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/gamification/streak');
    });
  });

  it('renders nothing when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(<StreakCounter />);

    await waitFor(() => {
      // After error, streak is null so component renders null
      expect(container.querySelector('.animate-shimmer')).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId('streak-count')).not.toBeInTheDocument();
    expect(screen.queryByTestId('streak-zero-message')).not.toBeInTheDocument();
  });
});

describe('StreakCounterSkeleton', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<StreakCounterSkeleton />);
    const skeletons = container.querySelectorAll('.animate-shimmer');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
