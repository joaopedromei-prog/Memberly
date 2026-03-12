import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentItem, type CommentData } from '@/components/shared/CommentItem';

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: () => 'há 2 horas',
}));

vi.mock('@/stores/toast-store', () => ({
  useToastStore: (selector: (s: { addToast: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ addToast: vi.fn() }),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const baseComment: CommentData = {
  id: 'c-1',
  content: 'Posso substituir o arroz por quinoa?',
  parent_id: null,
  created_at: '2026-03-11T10:00:00Z',
  profile: {
    id: 'p-1',
    full_name: 'Maria Silva',
    avatar_url: null,
    role: 'member',
  },
  replies: [],
};

const adminComment: CommentData = {
  ...baseComment,
  id: 'c-2',
  content: 'Sim, quinoa é excelente!',
  profile: {
    id: 'p-2',
    full_name: 'Admin User',
    avatar_url: null,
    role: 'admin',
  },
};

describe('CommentItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders author name and content', () => {
    render(<CommentItem comment={baseComment} lessonId="les-1" onReplyAdded={vi.fn()} />);
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('Posso substituir o arroz por quinoa?')).toBeInTheDocument();
  });

  it('renders avatar initial when no avatar_url', () => {
    render(<CommentItem comment={baseComment} lessonId="les-1" onReplyAdded={vi.fn()} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders relative date', () => {
    render(<CommentItem comment={baseComment} lessonId="les-1" onReplyAdded={vi.fn()} />);
    expect(screen.getByText('há 2 horas')).toBeInTheDocument();
  });

  it('renders Admin badge for admin users', () => {
    render(<CommentItem comment={adminComment} lessonId="les-1" onReplyAdded={vi.fn()} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByLabelText('Administrador')).toBeInTheDocument();
  });

  it('does NOT render Admin badge for regular members', () => {
    render(<CommentItem comment={baseComment} lessonId="les-1" onReplyAdded={vi.fn()} />);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('shows "Responder" button for top-level comments', () => {
    render(<CommentItem comment={baseComment} lessonId="les-1" onReplyAdded={vi.fn()} />);
    expect(screen.getByText('Responder')).toBeInTheDocument();
  });

  it('does NOT show "Responder" button for replies', () => {
    const reply: CommentData = { ...baseComment, parent_id: 'c-parent' };
    render(<CommentItem comment={reply} lessonId="les-1" onReplyAdded={vi.fn()} />);
    expect(screen.queryByText('Responder')).not.toBeInTheDocument();
  });

  it('shows reply form when "Responder" is clicked', () => {
    render(<CommentItem comment={baseComment} lessonId="les-1" onReplyAdded={vi.fn()} />);
    fireEvent.click(screen.getByText('Responder'));
    expect(screen.getByPlaceholderText('Escreva sua resposta...')).toBeInTheDocument();
  });

  it('renders replies indented below parent', () => {
    const commentWithReplies: CommentData = {
      ...baseComment,
      replies: [
        {
          id: 'r-1',
          content: 'Concordo!',
          parent_id: 'c-1',
          created_at: '2026-03-11T11:00:00Z',
          profile: { id: 'p-3', full_name: 'João', avatar_url: null, role: 'member' },
        },
      ],
    };
    render(<CommentItem comment={commentWithReplies} lessonId="les-1" onReplyAdded={vi.fn()} />);
    expect(screen.getByText('Concordo!')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
  });

  it('renders avatar image when avatar_url provided', () => {
    const commentWithAvatar: CommentData = {
      ...baseComment,
      profile: { ...baseComment.profile, avatar_url: 'https://example.com/avatar.jpg' },
    };
    render(<CommentItem comment={commentWithAvatar} lessonId="les-1" onReplyAdded={vi.fn()} />);
    const img = screen.getByAltText('Maria Silva');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });
});
