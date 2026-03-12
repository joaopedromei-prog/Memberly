import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from '@/components/admin/Sidebar';
import { useUIStore } from '@/stores/ui-store';

let mockPathname = '/admin';

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

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname = '/admin';
    useUIStore.setState({ sidebarOpen: false });
  });

  it('renders all navigation items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Membros')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  it('renders Memberly Admin logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('Memberly Admin')).toBeInTheDocument();
  });

  it('highlights Dashboard when on /admin', () => {
    mockPathname = '/admin';
    render(<Sidebar />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-blue-50');
  });

  it('highlights Produtos when on /admin/products', () => {
    mockPathname = '/admin/products';
    render(<Sidebar />);

    const productLink = screen.getByText('Produtos').closest('a');
    expect(productLink).toHaveClass('bg-blue-50');
  });

  it('shows backdrop when sidebar is open', () => {
    useUIStore.setState({ sidebarOpen: true });
    render(<Sidebar />);

    const backdrop = document.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
  });

  it('closes sidebar when backdrop is clicked', () => {
    useUIStore.setState({ sidebarOpen: true });
    render(<Sidebar />);

    const backdrop = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop!);

    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });
});
