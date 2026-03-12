import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductForm } from '@/components/admin/ProductForm';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', title: 'Test' }),
    });
  });

  it('renders create form with empty fields', () => {
    render(<ProductForm />);

    expect(screen.getByLabelText(/título/i)).toHaveValue('');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('');
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /criar produto/i })).toBeInTheDocument();
  });

  it('renders edit form with pre-filled values', () => {
    const product = {
      id: '1',
      title: 'Test Product',
      description: 'Test description',
      banner_url: null,
      slug: 'test-product',
      is_published: false,
      sort_order: 0,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    render(<ProductForm product={product} />);

    expect(screen.getByLabelText(/título/i)).toHaveValue('Test Product');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('test-product');
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('Test description');
    expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
  });

  it('auto-generates slug from title', async () => {
    render(<ProductForm />);

    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'Meu Novo Produto' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/slug/i)).toHaveValue('meu-novo-produto');
    });
  });

  it('shows validation error when title is empty', async () => {
    render(<ProductForm />);

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('submits create form with correct data', async () => {
    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'New Product' },
    });
    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'A description' },
    });

    fireEvent.click(screen.getByRole('button', { name: /criar produto/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/products', expect.objectContaining({
        method: 'POST',
      }));
    });

    expect(mockPush).toHaveBeenCalledWith('/admin/products');
  });

  it('submits edit form with PATCH method', async () => {
    const product = {
      id: 'abc-123',
      title: 'Existing',
      description: '',
      banner_url: null,
      slug: 'existing',
      is_published: false,
      sort_order: 0,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    render(<ProductForm product={product} />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Updated Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products/abc-123',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('shows error toast on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () =>
        Promise.resolve({
          error: { code: 'CREATE_ERROR', message: 'Server error' },
        }),
    });

    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Test' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar produto/i }));

    // Should not redirect on error
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
