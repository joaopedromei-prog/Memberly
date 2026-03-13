import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonNavigation } from '@/components/member/LessonNavigation';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('LessonNavigation', () => {
  it('renders next lesson link', () => {
    render(<LessonNavigation prevLessonUrl={null} nextLessonUrl="/products/react/lessons/les-2" />);
    const nextLink = screen.getByLabelText('Próxima aula');
    expect(nextLink.closest('a')).toHaveAttribute('href', '/products/react/lessons/les-2');
  });

  it('does not render prev link when no previous lesson', () => {
    render(<LessonNavigation prevLessonUrl={null} nextLessonUrl="/products/react/lessons/les-2" />);
    expect(screen.queryByLabelText('Aula anterior')).not.toBeInTheDocument();
  });

  it('renders prev link when available', () => {
    render(<LessonNavigation prevLessonUrl="/products/react/lessons/les-0" nextLessonUrl={null} />);
    const prevLink = screen.getByLabelText('Aula anterior');
    expect(prevLink.closest('a')).toHaveAttribute('href', '/products/react/lessons/les-0');
  });

  it('does not render next link when no next lesson', () => {
    render(<LessonNavigation prevLessonUrl={null} nextLessonUrl={null} />);
    expect(screen.queryByLabelText('Próxima aula')).not.toBeInTheDocument();
  });

  it('renders prev and next lesson titles when provided', () => {
    render(
      <LessonNavigation
        prevLessonUrl="/products/react/lessons/les-0"
        nextLessonUrl="/products/react/lessons/les-2"
        prevLessonTitle="Introdução"
        nextLessonTitle="Componentes"
      />
    );
    expect(screen.getByText('Introdução')).toBeInTheDocument();
    expect(screen.getByText('Componentes')).toBeInTheDocument();
  });
});
