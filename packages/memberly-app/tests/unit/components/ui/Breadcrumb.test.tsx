import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

describe('Breadcrumb', () => {
  it('renders items with links and separators', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Produtos', href: '/admin/products' },
          { label: 'Meu Produto', href: '/admin/products/1' },
          { label: 'Módulos' },
        ]}
      />
    );

    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Meu Produto')).toBeInTheDocument();
    expect(screen.getByText('Módulos')).toBeInTheDocument();

    // Links for non-last items
    const produtosLink = screen.getByText('Produtos').closest('a');
    expect(produtosLink).toHaveAttribute('href', '/admin/products');

    const productLink = screen.getByText('Meu Produto').closest('a');
    expect(productLink).toHaveAttribute('href', '/admin/products/1');
  });

  it('renders last item without link', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Current Page' },
        ]}
      />
    );

    const currentPage = screen.getByText('Current Page');
    expect(currentPage.closest('a')).toBeNull();
    expect(currentPage).toHaveClass('font-medium');
  });

  it('renders separators between items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'A', href: '/a' },
          { label: 'B', href: '/b' },
          { label: 'C' },
        ]}
      />
    );

    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2);
  });

  it('renders single item without separator', () => {
    render(<Breadcrumb items={[{ label: 'Only' }]} />);

    expect(screen.getByText('Only')).toBeInTheDocument();
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<Breadcrumb items={[{ label: 'Test' }]} />);

    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });
});
