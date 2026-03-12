import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentForm } from '@/components/shared/CommentForm';

vi.mock('@/stores/toast-store', () => ({
  useToastStore: (selector: (s: { addToast: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ addToast: mockAddToast }),
}));

const mockAddToast = vi.fn();
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockOnSuccess = vi.fn();

describe('CommentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea with placeholder', () => {
    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} />);
    expect(screen.getByPlaceholderText('Escreva sua dúvida...')).toBeInTheDocument();
  });

  it('renders reply placeholder when isReply', () => {
    render(<CommentForm lessonId="les-1" parentId="c-1" onSuccess={mockOnSuccess} isReply />);
    expect(screen.getByPlaceholderText('Escreva sua resposta...')).toBeInTheDocument();
  });

  it('shows character counter', () => {
    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} />);
    expect(screen.getByText('0/2000')).toBeInTheDocument();
  });

  it('disables submit button when empty', () => {
    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} />);
    expect(screen.getByLabelText('Enviar comentário')).toBeDisabled();
  });

  it('enables submit button when content is entered', () => {
    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('Escreva sua dúvida...'), {
      target: { value: 'Meu comentário' },
    });
    expect(screen.getByLabelText('Enviar comentário')).not.toBeDisabled();
  });

  it('disables submit when content exceeds 2000 chars', () => {
    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} />);
    const longText = 'a'.repeat(2001);
    fireEvent.change(screen.getByPlaceholderText('Escreva sua dúvida...'), {
      target: { value: longText },
    });
    expect(screen.getByLabelText('Enviar comentário')).toBeDisabled();
  });

  it('shows warning style near character limit', () => {
    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} />);
    const text = 'a'.repeat(1801);
    fireEvent.change(screen.getByPlaceholderText('Escreva sua dúvida...'), {
      target: { value: text },
    });
    const counter = screen.getByText('1801/2000');
    expect(counter.className).toContain('yellow');
  });

  it('submits comment and clears textarea on success', async () => {
    const mockComment = { id: 'c-1', content: 'Test', created_at: '2026-03-11T12:00:00Z', profile: { id: 'p-1', full_name: 'User', avatar_url: null, role: 'member' } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockComment),
    });

    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('Escreva sua dúvida...'), {
      target: { value: 'Meu comentário' },
    });
    fireEvent.click(screen.getByLabelText('Enviar comentário'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lessons/les-1/comments', expect.objectContaining({
        method: 'POST',
      }));
      expect(mockOnSuccess).toHaveBeenCalledWith(mockComment);
    });
  });

  it('shows toast on error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Erro teste' } }),
    });

    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('Escreva sua dúvida...'), {
      target: { value: 'Meu comentário' },
    });
    fireEvent.click(screen.getByLabelText('Enviar comentário'));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Erro teste', 'error');
    });
  });

  it('shows cancel button when onCancel provided', () => {
    const mockCancel = vi.fn();
    render(<CommentForm lessonId="les-1" onSuccess={mockOnSuccess} onCancel={mockCancel} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockCancel).toHaveBeenCalled();
  });
});
