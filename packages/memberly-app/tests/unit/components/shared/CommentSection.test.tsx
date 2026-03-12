import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentSection } from '@/components/shared/CommentSection';

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: () => 'há 2 horas',
}));

vi.mock('@/stores/toast-store', () => ({
  useToastStore: (selector: (s: { addToast: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ addToast: vi.fn() }),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockComments = [
  {
    id: 'c-1',
    content: 'Ótima aula!',
    parent_id: null,
    created_at: '2026-03-11T10:00:00Z',
    profile: { id: 'p-1', full_name: 'Maria', avatar_url: null, role: 'member' },
    replies: [],
  },
  {
    id: 'c-2',
    content: 'Concordo!',
    parent_id: null,
    created_at: '2026-03-11T09:00:00Z',
    profile: { id: 'p-2', full_name: 'João', avatar_url: null, role: 'member' },
    replies: [],
  },
];

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading with comment count', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ comments: mockComments, nextCursor: null }),
    });

    render(<CommentSection lessonId="les-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Comentários (2)');
    });
  });

  it('renders comment form', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ comments: [], nextCursor: null }),
    });

    render(<CommentSection lessonId="les-1" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Escreva sua dúvida...')).toBeInTheDocument();
    });
  });

  it('renders comments after loading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ comments: mockComments, nextCursor: null }),
    });

    render(<CommentSection lessonId="les-1" />);

    await waitFor(() => {
      expect(screen.getByText('Ótima aula!')).toBeInTheDocument();
      expect(screen.getByText('Concordo!')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton initially', () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // Never resolves
    render(<CommentSection lessonId="les-1" />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows empty state when no comments', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ comments: [], nextCursor: null }),
    });

    render(<CommentSection lessonId="les-1" />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum comentário ainda. Seja o primeiro!')).toBeInTheDocument();
    });
  });

  it('shows "Carregar mais" button when hasMore', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ comments: mockComments, nextCursor: '2026-03-11T09:00:00Z' }),
    });

    render(<CommentSection lessonId="les-1" />);

    await waitFor(() => {
      expect(screen.getByText('Carregar mais comentários')).toBeInTheDocument();
    });
  });

  it('loads more comments on click', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ comments: mockComments, nextCursor: '2026-03-11T09:00:00Z' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          comments: [{
            id: 'c-3',
            content: 'Mais um!',
            parent_id: null,
            created_at: '2026-03-11T08:00:00Z',
            profile: { id: 'p-3', full_name: 'Carlos', avatar_url: null, role: 'member' },
            replies: [],
          }],
          nextCursor: null,
        }),
      });

    render(<CommentSection lessonId="les-1" />);

    await waitFor(() => {
      expect(screen.getByText('Carregar mais comentários')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Carregar mais comentários'));

    await waitFor(() => {
      expect(screen.getByText('Mais um!')).toBeInTheDocument();
    });
  });
});
