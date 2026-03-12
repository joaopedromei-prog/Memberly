import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberHeader } from '@/components/member/MemberHeader';
import { useAuthStore } from '@/stores/auth-store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('MemberHeader', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: false });
    vi.restoreAllMocks();
  });

  it('renders logo text', () => {
    render(<MemberHeader />);
    expect(screen.getByText('Memberly')).toBeInTheDocument();
  });

  it('renders member name when user is set', () => {
    useAuthStore.setState({
      user: { id: '1', full_name: 'João Silva', avatar_url: null, role: 'member' },
      isLoading: false,
    });

    render(<MemberHeader />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<MemberHeader />);
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('calls logout API on button click', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

    render(<MemberHeader />);
    fireEvent.click(screen.getByText('Sair'));

    expect(fetchSpy).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
  });
});
