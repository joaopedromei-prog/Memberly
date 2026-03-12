import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Carousel } from '@/components/member/Carousel';

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
});
