import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModuleForm } from '@/components/admin/ModuleForm';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockOnSuccess = vi.fn();
const mockOnCancel = vi.fn();

describe('ModuleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', title: 'Test Module' }),
    });
  });

  it('renders create form with empty fields', () => {
    render(
      <ModuleForm
        productId="prod-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/título/i)).toHaveValue('');
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /criar módulo/i })).toBeInTheDocument();
  });

  it('renders edit form with pre-filled values', () => {
    const existingModule = {
      id: 'mod-1',
      product_id: 'prod-1',
      title: 'Existing Module',
      description: 'A description',
      banner_url: null,
      sort_order: 0,
      created_at: '2026-01-01T00:00:00Z',
    };

    render(
      <ModuleForm
        productId="prod-1"
        module={existingModule}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/título/i)).toHaveValue('Existing Module');
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('A description');
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(
      <ModuleForm
        productId="prod-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /criar módulo/i }));

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('submits create form to correct endpoint', async () => {
    render(
      <ModuleForm
        productId="prod-123"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'New Module' },
    });

    fireEvent.click(screen.getByRole('button', { name: /criar módulo/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products/prod-123/modules',
        expect.objectContaining({ method: 'POST' })
      );
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('submits edit form to correct endpoint', async () => {
    const existingModule = {
      id: 'mod-456',
      product_id: 'prod-1',
      title: 'Old Title',
      description: '',
      banner_url: null,
      sort_order: 0,
      created_at: '2026-01-01T00:00:00Z',
    };

    render(
      <ModuleForm
        productId="prod-1"
        module={existingModule}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Updated Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/modules/mod-456',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('calls onCancel when cancel button clicked', () => {
    render(
      <ModuleForm
        productId="prod-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
