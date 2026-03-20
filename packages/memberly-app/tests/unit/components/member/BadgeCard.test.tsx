import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BadgeCard, type BadgeWithStatus } from '@/components/member/BadgeCard';

const unlockedBadge: BadgeWithStatus = {
  id: 'badge-1',
  name: 'Primeiro Login',
  description: 'Fez login pela primeira vez',
  icon_url: null,
  unlocked: true,
  unlocked_at: '2026-01-15T10:00:00Z',
};

const lockedBadge: BadgeWithStatus = {
  id: 'badge-2',
  name: 'Maratonista',
  description: 'Complete 10 aulas em um dia',
  icon_url: null,
  unlocked: false,
  unlocked_at: null,
};

const badgeWithIcon: BadgeWithStatus = {
  id: 'badge-3',
  name: 'Explorador',
  description: 'Acesse todos os cursos',
  icon_url: '/badges/explorer.png',
  unlocked: true,
  unlocked_at: '2026-02-20T14:30:00Z',
};

describe('BadgeCard', () => {
  it('renders badge name and description', () => {
    render(<BadgeCard badge={unlockedBadge} />);
    expect(screen.getByText('Primeiro Login')).toBeInTheDocument();
    expect(screen.getByText('Fez login pela primeira vez')).toBeInTheDocument();
  });

  it('shows unlock date for unlocked badge', () => {
    render(<BadgeCard badge={unlockedBadge} />);
    expect(screen.getByText(/Desbloqueado em/)).toBeInTheDocument();
    expect(screen.getByText(/15\/01\/2026/)).toBeInTheDocument();
  });

  it('does not show unlock date for locked badge', () => {
    render(<BadgeCard badge={lockedBadge} />);
    expect(screen.queryByText(/Desbloqueado em/)).not.toBeInTheDocument();
  });

  it('applies grayscale and opacity classes to locked badge', () => {
    const { container } = render(<BadgeCard badge={lockedBadge} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('grayscale');
    expect(card.className).toContain('opacity-50');
  });

  it('does not apply grayscale to unlocked badge', () => {
    const { container } = render(<BadgeCard badge={unlockedBadge} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('grayscale');
    expect(card.className).not.toContain('opacity-50');
  });

  it('applies primary border styling to unlocked badge', () => {
    const { container } = render(<BadgeCard badge={unlockedBadge} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-primary/30');
    expect(card.className).toContain('shadow-primary/10');
  });

  it('renders fallback emoji when no icon_url', () => {
    render(<BadgeCard badge={unlockedBadge} />);
    expect(screen.getByRole('img', { name: 'badge' })).toBeInTheDocument();
  });

  it('renders image when icon_url is provided', () => {
    render(<BadgeCard badge={badgeWithIcon} />);
    const img = screen.getByAltText('Explorador');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/badges/explorer.png');
  });

  it('has correct test id', () => {
    render(<BadgeCard badge={unlockedBadge} />);
    expect(screen.getByTestId('badge-card-badge-1')).toBeInTheDocument();
  });
});
