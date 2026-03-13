import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberDetail } from '@/components/admin/MemberDetail';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
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
      <MemberDetail profile={mockProfile} email="joao@email.com" access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('João Silva');
    expect(screen.getByText('member')).toBeInTheDocument();
  });

  it('renders initials when no avatar', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('renders email with copy button', () => {
    render(
      <MemberDetail profile={mockProfile} email="joao@email.com" access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('joao@email.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Copiar email')).toBeInTheDocument();
  });

  it('renders access list with products', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('Curso React')).toBeInTheDocument();
    expect(screen.getByText('Curso Node')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('renders granted_by badges', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('webhook')).toBeInTheDocument();
    expect(screen.getByText('manual')).toBeInTheDocument();
  });

  it('renders remove buttons for each access', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    const removeButtons = screen.getAllByText('Remover');
    expect(removeButtons).toHaveLength(2);
  });

  it('shows confirm dialog when remove is clicked', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    const removeButtons = screen.getAllByText('Remover');
    fireEvent.click(removeButtons[0]);

    expect(screen.getByText(/perderá acesso ao produto/)).toBeInTheDocument();
  });

  it('renders grant access button', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getAllByText('Atribuir Acesso').length).toBeGreaterThanOrEqual(1);
  });

  it('opens grant modal when button is clicked', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    const buttons = screen.getAllByText('Atribuir Acesso');
    fireEvent.click(buttons[0]);
    expect(screen.getByText('Selecione um produto para liberar acesso ao membro.')).toBeInTheDocument();
  });

  it('renders breadcrumb navigation', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('Membros')).toBeInTheDocument();
    const membrosLink = screen.getByText('Membros').closest('a');
    expect(membrosLink).toHaveAttribute('href', '/admin/members');
  });

  it('renders quick stats and actions sidebar', () => {
    render(
      <MemberDetail profile={mockProfile} email={null} access={mockAccess} allProducts={mockAllProducts} />
    );

    expect(screen.getByText('Resumo')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
    expect(screen.getByText('Atribuir Acesso a Produto')).toBeInTheDocument();
    expect(screen.getByText('Remover Membro')).toBeInTheDocument();
  });
});
