import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from '@/components/admin/StatCard';

describe('StatCard', () => {
  const defaultIcon = <span data-testid="test-icon">icon</span>;

  it('renders title and value', () => {
    render(<StatCard title="Total de Membros" value={42} icon={defaultIcon} index={0} />);

    expect(screen.getByText('Total de Membros')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(<StatCard title="Status" value="Ativo" icon={defaultIcon} index={0} />);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <StatCard
        title="Test"
        value={0}
        icon={<span data-testid="test-icon">icon</span>}
        index={0}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders trend badge when provided', () => {
    render(
      <StatCard title="Test" value={10} icon={defaultIcon} index={0} trend="↑ 12% vs mês anterior" />
    );

    expect(screen.getByText('↑ 12% vs mês anterior')).toBeInTheDocument();
  });

  it('renders progress bar when provided', () => {
    const { container } = render(
      <StatCard title="Conclusão" value="64%" icon={defaultIcon} index={0} progress={64} />
    );

    const progressBar = container.querySelector('.bg-violet-500');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '64%' });
  });
});
