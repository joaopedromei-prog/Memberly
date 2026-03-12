import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';

const mockResetPasswordForEmail = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders forgot password form with email and submit button', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar link/i })).toBeInTheDocument();
  });

  it('renders back to login link', () => {
    render(<ForgotPasswordPage />);

    const link = screen.getByText(/voltar ao login/i);
    expect(link).toHaveAttribute('href', '/login');
  });

  it('shows success message after submit', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar link/i }));

    await waitFor(() => {
      expect(screen.getByText(/se o email estiver cadastrado/i)).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'Rate limit exceeded' },
    });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar link/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/erro ao enviar email/i);
    });
  });
});
