import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuthStore } from '@/stores/auth-store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}));

describe('AdminHeader', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: false });
  });

  it('renders logout button', () => {
    render(<AdminHeader />);
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('renders admin name when user is set', () => {
    useAuthStore.setState({
      user: { id: '1', full_name: 'Admin User', avatar_url: null, role: 'admin' },
      isLoading: false,
    });

    render(<AdminHeader />);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('renders hamburger button for mobile', () => {
    render(<AdminHeader />);
    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
  });
});
