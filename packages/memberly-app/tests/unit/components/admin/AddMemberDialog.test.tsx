import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddMemberDialog } from '@/components/admin/AddMemberDialog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const mockAddToast = vi.fn();
vi.mock('@/stores/toast-store', () => ({
  useToastStore: (selector: (s: { addToast: typeof mockAddToast }) => unknown) =>
    selector({ addToast: mockAddToast }),
}));

const mockProducts = [
  { id: 'prod-1', title: 'Curso A' },
  { id: 'prod-2', title: 'Curso B' },
];

describe('AddMemberDialog', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders form fields correctly', () => {
    render(<AddMemberDialog products={mockProducts} onClose={onClose} />);

    expect(screen.getByText('Adicionar Membro')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/produto/i)).toBeInTheDocument();
    expect(screen.getByText('Curso A')).toBeInTheDocument();
    expect(screen.getByText('Curso B')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<AddMemberDialog products={mockProducts} onClose={onClose} />);

    fireEvent.click(screen.getByText('Criar membro'));

    expect(screen.getByText('Nome completo é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<AddMemberDialog products={mockProducts} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'João' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid' } });

    // Submit the form directly to bypass HTML5 email validation in jsdom
    const form = screen.getByText('Criar membro').closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Formato de email inválido')).toBeInTheDocument();
  });

  it('submits successfully and calls onClose', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 'new-1', full_name: 'João', email: 'joao@test.com' }),
    });

    render(<AddMemberDialog products={mockProducts} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'joao@test.com' } });
    fireEvent.click(screen.getByText('Criar membro'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/members', expect.objectContaining({
        method: 'POST',
      }));
    });

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Membro criado com sucesso!', 'success');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows duplicate email error on 409', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: { code: 'CONFLICT', message: 'Este email já está cadastrado' } }),
    });

    render(<AddMemberDialog products={mockProducts} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'João' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@test.com' } });
    fireEvent.click(screen.getByText('Criar membro'));

    await waitFor(() => {
      expect(screen.getByText('Este email já está cadastrado')).toBeInTheDocument();
    });
  });

  it('calls onClose when clicking backdrop', () => {
    render(<AddMemberDialog products={mockProducts} onClose={onClose} />);

    // Click the backdrop (outermost div)
    fireEvent.click(screen.getByText('Adicionar Membro').closest('.fixed')!);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking Cancel button', () => {
    render(<AddMemberDialog products={mockProducts} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });
});
