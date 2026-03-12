import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonSidebar } from '@/components/member/LessonSidebar';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const lessons = [
  { id: 'les-1', title: 'Introdução', durationMinutes: 10, completed: true },
  { id: 'les-2', title: 'Setup', durationMinutes: 15, completed: false },
  { id: 'les-3', title: 'Primeiro Componente', durationMinutes: null, completed: false },
];

const defaultProps = {
  moduleName: 'Fundamentos',
  productSlug: 'curso-react',
  lessons,
  currentLessonId: 'les-2',
  completedCount: 1,
};

describe('LessonSidebar', () => {
  it('renders module name in desktop sidebar', () => {
    render(<LessonSidebar {...defaultProps} />);
    expect(screen.getByText('Fundamentos')).toBeInTheDocument();
  });

  it('renders completion count', () => {
    render(<LessonSidebar {...defaultProps} />);
    expect(screen.getByText('1/3 aulas concluídas')).toBeInTheDocument();
  });

  it('renders all lessons', () => {
    render(<LessonSidebar {...defaultProps} />);
    expect(screen.getAllByText('Introdução').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Setup').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Primeiro Componente').length).toBeGreaterThan(0);
  });

  it('highlights current lesson with aria-current', () => {
    render(<LessonSidebar {...defaultProps} />);
    const currentLinks = screen.getAllByRole('link', { current: 'page' });
    expect(currentLinks.length).toBeGreaterThan(0);
    expect(currentLinks[0]).toHaveAttribute('href', '/products/curso-react/lessons/les-2');
  });

  it('shows duration when available', () => {
    render(<LessonSidebar {...defaultProps} />);
    expect(screen.getAllByText('10 min').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15 min').length).toBeGreaterThan(0);
  });

  it('links to correct lesson URLs', () => {
    render(<LessonSidebar {...defaultProps} />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/products/curso-react/lessons/les-1');
    expect(hrefs).toContain('/products/curso-react/lessons/les-2');
    expect(hrefs).toContain('/products/curso-react/lessons/les-3');
  });

  it('has mobile accordion toggle', () => {
    render(<LessonSidebar {...defaultProps} />);
    const toggleSpan = screen.getByText(/Outras aulas deste módulo/);
    const toggleBtn = toggleSpan.closest('button')!;
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
  });
});
