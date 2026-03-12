import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from '@/components/admin/StatCard';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total de Membros" value={42} />);

    expect(screen.getByText('Total de Membros')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(<StatCard title="Status" value="Ativo" />);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <StatCard
        title="Test"
        value={0}
        icon={<span data-testid="test-icon">icon</span>}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatCard title="Test" value={0} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
