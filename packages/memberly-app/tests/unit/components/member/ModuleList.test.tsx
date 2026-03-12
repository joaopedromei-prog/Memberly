import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModuleList } from '@/components/member/ModuleList';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockModules = [
  {
    id: 'mod-1',
    title: 'Módulo 1',
    description: 'Descrição módulo 1',
    bannerUrl: '/banner-1.jpg',
    sortOrder: 1,
    totalLessons: 5,
    completedLessons: 2,
    nextLessonUrl: '/products/curso/lessons/les-3',
  },
  {
    id: 'mod-2',
    title: 'Módulo 2',
    description: 'Descrição módulo 2',
    bannerUrl: null,
    sortOrder: 2,
    totalLessons: 3,
    completedLessons: 3,
    nextLessonUrl: null,
  },
];

describe('ModuleList', () => {
  it('renders section title "Módulos"', () => {
    render(<ModuleList modules={mockModules} productSlug="curso" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Módulos');
  });

  it('renders all module cards', () => {
    render(<ModuleList modules={mockModules} productSlug="curso" />);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);
  });

  it('uses responsive grid layout', () => {
    const { container } = render(<ModuleList modules={mockModules} productSlug="curso" />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('sm:grid-cols-2');
    expect(grid?.className).toContain('md:grid-cols-3');
    expect(grid?.className).toContain('xl:grid-cols-4');
  });

  it('renders empty grid when no modules', () => {
    const { container } = render(<ModuleList modules={[]} productSlug="curso" />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(0);
  });

  it('passes correct props to ModuleCard', () => {
    render(<ModuleList modules={mockModules} productSlug="curso" />);
    expect(screen.getByText('Módulo 1')).toBeInTheDocument();
    expect(screen.getAllByText('Módulo 2').length).toBeGreaterThanOrEqual(1);
  });
});
