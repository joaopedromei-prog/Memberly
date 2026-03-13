import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '@/app/(auth)/login/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignInWithPassword = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mockSelect,
        }),
      }),
    }),
  }),
}));

function getEmailInput() {
  return screen.getByLabelText('Email');
}

function getPasswordInput() {
  return screen.getByLabelText('Senha');
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with email, password, and submit button', () => {
    render(<LoginPage />);

    expect(getEmailInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(<LoginPage />);

    const link = screen.getByText(/esqueci minha senha/i);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/forgot-password');
  });

  it('shows error message on invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    render(<LoginPage />);

    fireEvent.change(getEmailInput(), { target: { value: 'test@test.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email ou senha incorretos/i);
    });
  });

  it('redirects member to / after successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: {} },
      error: null,
    });
    mockSelect.mockResolvedValue({ data: { role: 'member' } });

    render(<LoginPage />);

    fireEvent.change(getEmailInput(), { target: { value: 'member@test.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('redirects admin to /admin after successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'admin-1' }, session: {} },
      error: null,
    });
    mockSelect.mockResolvedValue({ data: { role: 'admin' } });

    render(<LoginPage />);

    fireEvent.change(getEmailInput(), { target: { value: 'admin@test.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('shows loading state while submitting', async () => {
    mockSignInWithPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: null }, error: { message: 'error' } }), 100))
    );

    render(<LoginPage />);

    fireEvent.change(getEmailInput(), { target: { value: 'test@test.com' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });
});
