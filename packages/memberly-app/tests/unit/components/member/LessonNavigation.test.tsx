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

  it('disables prev button when no previous lesson', () => {
    render(<LessonNavigation prevLessonUrl={null} nextLessonUrl="/products/react/lessons/les-2" />);
    const prevBtn = screen.getByLabelText('Aula anterior');
    expect(prevBtn).toBeDisabled();
  });

  it('renders prev link when available', () => {
    render(<LessonNavigation prevLessonUrl="/products/react/lessons/les-0" nextLessonUrl={null} />);
    const prevLink = screen.getByLabelText('Aula anterior');
    expect(prevLink.closest('a')).toHaveAttribute('href', '/products/react/lessons/les-0');
  });

  it('disables next button when no next lesson', () => {
    render(<LessonNavigation prevLessonUrl={null} nextLessonUrl={null} />);
    const nextBtn = screen.getByLabelText('Próxima aula');
    expect(nextBtn).toBeDisabled();
  });
});
