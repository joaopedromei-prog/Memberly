import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Breadcrumb } from '@/components/admin/Breadcrumb';

let mockPathname = '/admin/products';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Breadcrumb', () => {
  it('renders breadcrumb items for /admin/products', () => {
    mockPathname = '/admin/products';
    render(<Breadcrumb />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
  });

  it('renders Dashboard as link and last item as text', () => {
    mockPathname = '/admin/products';
    render(<Breadcrumb />);

    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/admin');

    const produtosText = screen.getByText('Produtos');
    expect(produtosText.closest('a')).toBeNull();
  });

  it('renders separators between items', () => {
    mockPathname = '/admin/products';
    render(<Breadcrumb />);

    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('returns null when only on /admin', () => {
    mockPathname = '/admin';
    const { container } = render(<Breadcrumb />);

    expect(container.innerHTML).toBe('');
  });

  it('maps settings to Configurações', () => {
    mockPathname = '/admin/settings';
    render(<Breadcrumb />);

    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });
});
