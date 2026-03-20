import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsPage } from '@/components/member/NotificationsPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function makeNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: `notif-${Math.random().toString(36).slice(2)}`,
    type: 'NEW_LESSON',
    title: 'Nova aula disponível',
    body: 'A aula foi publicada.',
    read: false,
    data: { productSlug: 'curso', lessonId: 'lesson-1' },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    read_at: null,
    ...overrides,
  };
}

function mockFetchSuccess(notifications: unknown[], nextCursor: string | null = null) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { notifications, nextCursor } }),
  });
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<NotificationsPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders notifications after loading', async () => {
    const notifications = [
      makeNotification({ id: '1', title: 'Aula 1' }),
      makeNotification({ id: '2', title: 'Aula 2', type: 'COMMENT_REPLY' }),
    ];
    global.fetch = mockFetchSuccess(notifications);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Aula 1')).toBeInTheDocument();
      expect(screen.getByText('Aula 2')).toBeInTheDocument();
    });
  });

  it('renders empty state when no notifications', async () => {
    global.fetch = mockFetchSuccess([]);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Você não tem notificações')).toBeInTheDocument();
    });
  });

  it('filters notifications by type', async () => {
    const notifications = [
      makeNotification({ id: '1', title: 'Nova aula', type: 'NEW_LESSON' }),
      makeNotification({ id: '2', title: 'Resposta', type: 'COMMENT_REPLY' }),
      makeNotification({ id: '3', title: 'Concluído', type: 'COURSE_COMPLETED' }),
    ];
    global.fetch = mockFetchSuccess(notifications);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Nova aula')).toBeInTheDocument();
    });

    // Click "Respostas" filter
    fireEvent.click(screen.getByText('Respostas'));

    expect(screen.getByText('Resposta')).toBeInTheDocument();
    expect(screen.queryByText('Nova aula')).not.toBeInTheDocument();
    expect(screen.queryByText('Concluído')).not.toBeInTheDocument();
  });

  it('shows filtered empty state when filter has no matches', async () => {
    const notifications = [
      makeNotification({ id: '1', title: 'Nova aula', type: 'NEW_LESSON' }),
    ];
    global.fetch = mockFetchSuccess(notifications);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Nova aula')).toBeInTheDocument();
    });

    // Click "Concluídos" filter — no COURSE_COMPLETED notifications
    fireEvent.click(screen.getByText('Concluídos'));

    expect(screen.getByText('Nenhuma notificação deste tipo')).toBeInTheDocument();
  });

  it('shows "Marcar todas como lidas" button when unread exist', async () => {
    const notifications = [
      makeNotification({ id: '1', read: false }),
    ];
    global.fetch = mockFetchSuccess(notifications);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument();
    });
  });

  it('does not show "Marcar todas como lidas" when all are read', async () => {
    const notifications = [
      makeNotification({ id: '1', read: true }),
    ];
    global.fetch = mockFetchSuccess(notifications);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText(notifications[0].title)).toBeInTheDocument();
    });

    expect(screen.queryByText('Marcar todas como lidas')).not.toBeInTheDocument();
  });

  it('renders "Carregar mais" button when hasMore is true', async () => {
    const notifications = Array.from({ length: 20 }, (_, i) =>
      makeNotification({ id: String(i), title: `Notif ${i}` })
    );
    global.fetch = mockFetchSuccess(notifications, '2026-01-01T00:00:00Z');

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Carregar mais')).toBeInTheDocument();
    });
  });

  it('does not render "Carregar mais" when hasMore is false', async () => {
    const notifications = [makeNotification({ id: '1' })];
    global.fetch = mockFetchSuccess(notifications, null);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText(notifications[0].title)).toBeInTheDocument();
    });

    expect(screen.queryByText('Carregar mais')).not.toBeInTheDocument();
  });

  it('marks all as read optimistically', async () => {
    const notifications = [
      makeNotification({ id: '1', read: false, title: 'Unread 1' }),
      makeNotification({ id: '2', read: false, title: 'Unread 2' }),
    ];
    global.fetch = mockFetchSuccess(notifications);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument();
    });

    // Mock the mark-all-read API call
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { updated: 2 } }),
    });

    fireEvent.click(screen.getByText('Marcar todas como lidas'));

    // After marking all, the button should disappear
    await waitFor(() => {
      expect(screen.queryByText('Marcar todas como lidas')).not.toBeInTheDocument();
    });
  });

  it('deletes notification optimistically', async () => {
    const notifications = [
      makeNotification({ id: '1', title: 'To Delete' }),
      makeNotification({ id: '2', title: 'Keep This' }),
    ];
    global.fetch = mockFetchSuccess(notifications);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('To Delete')).toBeInTheDocument();
    });

    // Mock delete API call
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { deleted: true } }),
    });

    const deleteButtons = screen.getAllByLabelText('Deletar notificação');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
      expect(screen.getByText('Keep This')).toBeInTheDocument();
    });
  });

  it('renders all four filter tabs', async () => {
    global.fetch = mockFetchSuccess([makeNotification({ id: '1' })]);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Todas')).toBeInTheDocument();
      expect(screen.getByText('Novas aulas')).toBeInTheDocument();
      expect(screen.getByText('Respostas')).toBeInTheDocument();
      expect(screen.getByText('Concluídos')).toBeInTheDocument();
    });
  });
});
