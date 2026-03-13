import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModuleCard } from '@/components/member/ModuleCard';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const defaultProps = {
  moduleId: 'mod-1',
  productSlug: 'curso-react',
  title: 'Fundamentos do React',
  description: 'Aprenda os conceitos básicos do React',
  bannerUrl: '/module-banner.jpg',
  totalLessons: 8,
  completedLessons: 3,
  nextLessonUrl: '/products/curso-react/lessons/les-4',
};

describe('ModuleCard', () => {
  it('renders module title', () => {
    render(<ModuleCard {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Fundamentos do React');
  });

  it('renders lesson progress text', () => {
    render(<ModuleCard {...defaultProps} />);
    expect(screen.getByText('3/8 aulas')).toBeInTheDocument();
  });

  it('renders banner image with fill', () => {
    render(<ModuleCard {...defaultProps} />);
    const img = screen.getByAltText('Banner do módulo Fundamentos do React');
    expect(img).toBeInTheDocument();
  });

  it('renders gradient fallback when no banner', () => {
    const { container } = render(<ModuleCard {...defaultProps} bannerUrl={null} />);
    const gradient = container.querySelector('[class*="bg-gradient-to-br"]');
    expect(gradient).toBeInTheDocument();
  });

  it('shows completed badge when 100% progress', () => {
    render(<ModuleCard {...defaultProps} completedLessons={8} />);
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('does not show completed badge when not 100%', () => {
    render(<ModuleCard {...defaultProps} />);
    expect(screen.queryByText('Concluído')).not.toBeInTheDocument();
  });

  it('links to next lesson URL when provided', () => {
    render(<ModuleCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/curso-react/lessons/les-4');
  });

  it('links to product page when no nextLessonUrl', () => {
    render(<ModuleCard {...defaultProps} nextLessonUrl={null} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/curso-react');
  });

  it('has accessible article with aria-label', () => {
    render(<ModuleCard {...defaultProps} />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute(
      'aria-label',
      'Módulo: Fundamentos do React — 3/8 aulas concluídas'
    );
  });

  it('renders portrait aspect ratio card', () => {
    render(<ModuleCard {...defaultProps} />);
    const article = screen.getByRole('article');
    expect(article.className).toContain('aspect-[5/7]');
  });

  it('renders hover scale effect', () => {
    render(<ModuleCard {...defaultProps} />);
    const article = screen.getByRole('article');
    expect(article.className).toContain('hover:scale-105');
  });

  it('renders progress bar when lessons exist', () => {
    const { container } = render(<ModuleCard {...defaultProps} />);
    const progressBar = container.querySelector('.bg-\\[\\#46D369\\]');
    expect(progressBar).toBeInTheDocument();
  });

  it('does not render progress bar when zero lessons', () => {
    const { container } = render(<ModuleCard {...defaultProps} totalLessons={0} completedLessons={0} />);
    expect(screen.getByText('0/0 aulas')).toBeInTheDocument();
    const progressBar = container.querySelector('.bg-\\[\\#46D369\\]');
    expect(progressBar).not.toBeInTheDocument();
  });
});
