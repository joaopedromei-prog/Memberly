import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberDetail } from '@/components/admin/MemberDetail';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/lib/utils/api', () => ({
  apiRequest: vi.fn().mockResolvedValue({}),
}));

const mockProfile = {
  id: 'user-1',
  full_name: 'João Silva',
  avatar_url: null,
  role: 'member' as const,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
};

const mockAccess = [
  {
    id: 'access-1',
    profile_id: 'user-1',
    product_id: 'prod-1',
    granted_at: '2026-02-01T10:00:00Z',
    granted_by: 'webhook' as const,
    transaction_id: 'txn-123',
    products: { id: 'prod-1', title: 'Curso React', slug: 'curso-react', banner_url: null },
  },
  {
    id: 'access-2',
    profile_id: 'user-1',
    product_id: 'prod-2',
    granted_at: '2026-03-01T10:00:00Z',
    granted_by: 'manual' as const,
    transaction_id: null,
    products: { id: 'prod-2', title: 'Curso Node', slug: 'curso-node', banner_url: null },
  },
];

const mockAllProducts = [
  { id: 'prod-1', title: 'Curso React' },
  { id: 'prod-2', title: 'Curso Node' },
  { id: 'prod-3', title: 'Curso TypeScript' },
];

describe('MemberDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders member profile information', () => {
    render(
      <MemberDetail profile={mockProfile} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
  });

  it('renders initial letter when no avatar', () => {
    render(
      <MemberDetail profile={mockProfile} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders access list with products', () => {
    render(
      <MemberDetail profile={mockProfile} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('Curso React')).toBeInTheDocument();
    expect(screen.getByText('Curso Node')).toBeInTheDocument();
    expect(screen.getByText('Produtos com Acesso (2)')).toBeInTheDocument();
  });

  it('renders granted_by badges', () => {
    render(
      <MemberDetail profile={mockProfile} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('webhook')).toBeInTheDocument();
    expect(screen.getByText('manual')).toBeInTheDocument();
  });

  it('renders remove buttons for each access', () => {
    render(
      <MemberDetail profile={mockProfile} access={mockAccess} allProducts={mockAllProducts} />
    );

    const removeButtons = screen.getAllByText('Remover');
    expect(removeButtons).toHaveLength(2);
  });

  it('shows confirm dialog when remove is clicked', () => {
    render(
      <MemberDetail profile={mockProfile} access={mockAccess} allProducts={mockAllProducts} />
    );

    const removeButtons = screen.getAllByText('Remover');
    fireEvent.click(removeButtons[0]);

    expect(screen.getByText(/perderá acesso ao produto/)).toBeInTheDocument();
  });

  it('renders grant access button', () => {
    render(
      <MemberDetail profile={mockProfile} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('Atribuir Acesso')).toBeInTheDocument();
  });

  it('opens grant modal when button is clicked', () => {
    render(
      <MemberDetail profile={mockProfile} access={mockAccess} allProducts={mockAllProducts} />
    );

    fireEvent.click(screen.getByText('Atribuir Acesso'));
    expect(screen.getByText('Selecione um produto para liberar acesso ao membro.')).toBeInTheDocument();
  });
});
