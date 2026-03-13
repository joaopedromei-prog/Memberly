import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContinueWatchingCard } from '@/components/member/ContinueWatchingCard';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('ContinueWatchingCard', () => {
  const defaultProps = {
    productSlug: 'curso-nutricao',
    productTitle: 'Curso de Nutrição',
    productBannerUrl: null,
    targetLessonId: 'lesson-3',
    targetLessonTitle: 'Aula 3: Como Montar seu Prato',
    moduleName: 'Módulo 1: Fundamentos',
    lastWatchedAt: '2026-03-12T10:00:00Z',
    isContinue: true,
    progressPercent: 45,
  };

  it('renders product title', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    expect(screen.getByText('Curso de Nutrição')).toBeInTheDocument();
  });

  it('renders "Continue:" label when isContinue is true', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    expect(screen.getByText('Continue: Aula 3: Como Montar seu Prato')).toBeInTheDocument();
  });

  it('renders "Próxima:" label when isContinue is false', () => {
    render(<ContinueWatchingCard {...defaultProps} isContinue={false} />);
    expect(screen.getByText('Próxima: Aula 3: Como Montar seu Prato')).toBeInTheDocument();
  });

  it('renders module name', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    expect(screen.getByText(/Módulo 1: Fundamentos/)).toBeInTheDocument();
  });

  it('links to correct lesson URL', () => {
    render(<ContinueWatchingCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/products/curso-nutricao/lessons/lesson-3'
    );
  });

  it('renders gradient fallback when no banner', () => {
    const { container } = render(<ContinueWatchingCard {...defaultProps} />);
    const gradientDiv = container.querySelector('[style*="linear-gradient"]');
    expect(gradientDiv).toBeInTheDocument();
  });

  it('renders banner image when URL provided', () => {
    render(<ContinueWatchingCard {...defaultProps} productBannerUrl="/img.jpg" />);
    const img = screen.getByAltText('Curso de Nutrição');
    expect(img).toBeInTheDocument();
  });
});
