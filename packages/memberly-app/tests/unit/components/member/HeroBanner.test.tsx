import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeroBanner } from '@/components/member/HeroBanner';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children as React.ReactNode}</div>,
    h1: ({ children, ...props }: Record<string, unknown>) => <h1 {...props}>{children as React.ReactNode}</h1>,
    p: ({ children, ...props }: Record<string, unknown>) => <p {...props}>{children as React.ReactNode}</p>,
    section: ({ children, ...props }: Record<string, unknown>) => <section {...props}>{children as React.ReactNode}</section>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockItems = [
  { slug: 'curso-1', title: 'Curso Incrível', description: 'Descrição do curso', bannerUrl: null },
  { slug: 'curso-2', title: 'Segundo Curso', description: 'Outra descrição', bannerUrl: '/banner.jpg' },
];

describe('HeroBanner', () => {
  it('renders title of first item', () => {
    render(<HeroBanner items={mockItems} />);
    expect(screen.getByText('Curso Incrível')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<HeroBanner items={mockItems} />);
    expect(screen.getByText('Descrição do curso')).toBeInTheDocument();
  });

  it('renders CTA link', () => {
    render(<HeroBanner items={mockItems} />);
    expect(screen.getByText('Continuar Assistindo')).toBeInTheDocument();
  });

  it('renders dot indicators for multiple items', () => {
    render(<HeroBanner items={mockItems} />);
    const dots = screen.getAllByRole('button', { name: /Ir para banner/ });
    expect(dots).toHaveLength(2);
  });

  it('changes slide on dot click', () => {
    render(<HeroBanner items={mockItems} />);
    fireEvent.click(screen.getByLabelText('Ir para banner 2'));
    expect(screen.getByText('Segundo Curso')).toBeInTheDocument();
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(<HeroBanner items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render dots for single item', () => {
    render(<HeroBanner items={[mockItems[0]]} />);
    expect(screen.queryByRole('button', { name: /Ir para banner/ })).not.toBeInTheDocument();
  });

  it('renders context when provided', () => {
    const items = [{ ...mockItems[0], context: 'Módulo 3 · Aula 12 · 67% concluído' }];
    render(<HeroBanner items={items} />);
    expect(screen.getByText('Módulo 3 · Aula 12 · 67% concluído')).toBeInTheDocument();
  });

  it('links to lessonUrl when provided', () => {
    const items = [{ ...mockItems[0], lessonUrl: '/products/curso-1/lessons/abc' }];
    render(<HeroBanner items={items} />);
    const link = screen.getByText('Continuar Assistindo').closest('a');
    expect(link).toHaveAttribute('href', '/products/curso-1/lessons/abc');
  });
});
