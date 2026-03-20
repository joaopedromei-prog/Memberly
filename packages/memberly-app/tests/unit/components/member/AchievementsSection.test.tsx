import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementsSection } from '@/components/member/AchievementsSection';

const mockBadges = [
  {
    id: 'b1',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira aula',
    icon_url: null,
    unlocked: true,
    unlocked_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'b2',
    name: 'Dedicado',
    description: 'Estude por 7 dias seguidos',
    icon_url: null,
    unlocked: false,
    unlocked_at: null,
  },
  {
    id: 'b3',
    name: 'Mestre',
    description: 'Complete todos os cursos',
    icon_url: '/badges/master.png',
    unlocked: true,
    unlocked_at: '2026-02-15T12:00:00Z',
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('AchievementsSection', () => {
  it('renders skeleton while loading', () => {
    // Never-resolving fetch to keep loading state
    vi.spyOn(global, 'fetch').mockImplementation(
      () => new Promise(() => {})
    );
    const { container } = render(<AchievementsSection />);
    // Skeleton has shimmer animation divs
    const skeletonElements = container.querySelectorAll('.animate-shimmer');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders badges after successful fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockBadges }),
    } as Response);

    render(<AchievementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Primeiro Passo')).toBeInTheDocument();
    });

    expect(screen.getByText('Dedicado')).toBeInTheDocument();
    expect(screen.getByText('Mestre')).toBeInTheDocument();
  });

  it('renders section title with icon', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockBadges }),
    } as Response);

    render(<AchievementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Conquistas')).toBeInTheDocument();
    });
  });

  it('renders empty state when no badges', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    render(<AchievementsSection />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma conquista disponível ainda/)).toBeInTheDocument();
    });
  });

  it('renders error state with retry button on fetch failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<AchievementsSection />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar conquistas/)).toBeInTheDocument();
    });
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });

  it('renders responsive grid classes', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockBadges }),
    } as Response);

    const { container } = render(<AchievementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Primeiro Passo')).toBeInTheDocument();
    });

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('sm:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
  });

  it('sorts unlocked badges before locked badges', async () => {
    const mixed = [
      { ...mockBadges[1] }, // locked
      { ...mockBadges[0] }, // unlocked
    ];

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mixed }),
    } as Response);

    const { container } = render(<AchievementsSection />);

    await waitFor(() => {
      expect(screen.getByText('Primeiro Passo')).toBeInTheDocument();
    });

    const cards = container.querySelectorAll('[data-testid^="badge-card-"]');
    expect(cards[0]).toHaveAttribute('data-testid', 'badge-card-b1');
    expect(cards[1]).toHaveAttribute('data-testid', 'badge-card-b2');
  });
});
