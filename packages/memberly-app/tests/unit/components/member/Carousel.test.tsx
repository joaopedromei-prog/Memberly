import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Carousel } from '@/components/member/Carousel';

vi.mock('motion/react', () => ({
  motion: {
    section: ({ children, ...props }: Record<string, unknown>) => {
      const { whileInView, viewport, ...rest } = props as Record<string, unknown>;
      void whileInView;
      void viewport;
      return <section {...rest}>{children as React.ReactNode}</section>;
    },
  },
}));

describe('Carousel', () => {
  it('renders section title', () => {
    render(
      <Carousel title="Meus Cursos">
        <div>Card 1</div>
      </Carousel>
    );
    expect(screen.getByText('Meus Cursos')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Carousel title="Teste">
        <div>Item A</div>
        <div>Item B</div>
      </Carousel>
    );
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
  });

  it('has correct aria region', () => {
    render(
      <Carousel title="Continue Assistindo">
        <div>Card</div>
      </Carousel>
    );
    expect(screen.getByRole('region', { name: 'Continue Assistindo' })).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <Carousel title="Favoritos" icon={<span data-testid="heart-icon" />}>
        <div>Card</div>
      </Carousel>
    );
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
  });
});
