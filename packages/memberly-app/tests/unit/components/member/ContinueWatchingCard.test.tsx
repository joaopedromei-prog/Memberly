import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContinueWatchingCard } from '@/components/member/ContinueWatchingCard';

describe('ContinueWatchingCard', () => {
  const defaultProps = {
    productSlug: 'curso-nutricao',
    productTitle: 'Curso de Nutrição',
    productBannerUrl: null,
    nextLessonId: 'lesson-3',
    nextLessonTitle: 'Aula 3: Como Montar seu Prato',
    progressPercent: 45,
  };

  it('renders product title', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    expect(screen.getByText('Curso de Nutrição')).toBeInTheDocument();
  });

  it('renders next lesson title', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    expect(screen.getByText('Aula 3: Como Montar seu Prato')).toBeInTheDocument();
  });

  it('renders progress percentage', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('links to correct lesson URL', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/products/curso-nutricao/lessons/lesson-3'
    );
  });

  it('renders placeholder when no banner', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    expect(screen.getByText('🎬')).toBeInTheDocument();
  });
});
