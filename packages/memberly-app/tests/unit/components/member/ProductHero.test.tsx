import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductHero } from '@/components/member/ProductHero';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const defaultProps = {
  title: 'Curso de React',
  description: 'Aprenda React do zero ao avançado com projetos práticos e muito mais conteúdo interessante para aprender. Este curso cobre tudo que você precisa saber para se tornar um desenvolvedor React completo e profissional.',
  bannerUrl: '/banner.jpg',
  totalModules: 5,
  totalLessons: 42,
  nextLessonUrl: '/products/react/lessons/les-1',
};

describe('ProductHero', () => {
  it('renders product title', () => {
    render(<ProductHero {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Curso de React');
  });

  it('renders stats with module and lesson count', () => {
    render(<ProductHero {...defaultProps} />);
    expect(screen.getByText('5 módulos · 42 aulas')).toBeInTheDocument();
  });

  it('renders banner image with alt text', () => {
    render(<ProductHero {...defaultProps} />);
    expect(screen.getByAltText('Banner do produto Curso de React')).toBeInTheDocument();
  });

  it('renders continue button when nextLessonUrl provided', () => {
    render(<ProductHero {...defaultProps} />);
    const link = screen.getByText('Continuar de onde parei');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/products/react/lessons/les-1');
  });

  it('does not render continue button when nextLessonUrl is null', () => {
    render(<ProductHero {...defaultProps} nextLessonUrl={null} />);
    expect(screen.queryByText('Continuar de onde parei')).not.toBeInTheDocument();
  });

  it('renders emoji fallback when no banner', () => {
    render(<ProductHero {...defaultProps} bannerUrl={null} />);
    expect(screen.getByText('🎬')).toBeInTheDocument();
  });

  it('toggles description expand/collapse', () => {
    render(<ProductHero {...defaultProps} />);
    const toggleBtn = screen.getByText('ver mais');
    fireEvent.click(toggleBtn);
    expect(screen.getByText('ver menos')).toBeInTheDocument();
    fireEvent.click(screen.getByText('ver menos'));
    expect(screen.getByText('ver mais')).toBeInTheDocument();
  });
});
