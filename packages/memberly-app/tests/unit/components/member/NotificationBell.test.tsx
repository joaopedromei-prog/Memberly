import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationBell } from '@/components/member/NotificationBell';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock next/link as a simple anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function mockFetch(unreadCount: number, notifications: unknown[] = []) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const urlStr = typeof url === 'string' ? url : (url as Request).url;
    if (urlStr.includes('/unread-count')) {
      return new Response(JSON.stringify({ data: { count: unreadCount } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (urlStr.includes('/mark-all-read')) {
      return new Response(JSON.stringify({ data: { updated: unreadCount } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (urlStr.includes('/notifications')) {
      return new Response(JSON.stringify({ data: { notifications } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('{}', { status: 200 });
  });
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders bell icon button', async () => {
    mockFetch(0);
    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: 'Notificações' })).toBeInTheDocument();
  });

  it('shows badge with unread count', async () => {
    mockFetch(5);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByTestId('notification-badge')).toHaveTextContent('5');
    });
  });

  it('shows 9+ when unread count exceeds 9', async () => {
    mockFetch(15);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByTestId('notification-badge')).toHaveTextContent('9+');
    });
  });

  it('hides badge when unread count is 0', async () => {
    mockFetch(0);
    render(<NotificationBell />);
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
    });
  });

  it('opens dropdown on click', async () => {
    mockFetch(2, [
      {
        id: '1',
        type: 'NEW_LESSON',
        title: 'Nova aula disponível',
        body: 'Aula de React Hooks',
        read: false,
        data: { productSlug: 'react', lessonId: 'l1' },
        created_at: new Date().toISOString(),
        read_at: null,
      },
    ]);
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Notificações' }));

    await waitFor(() => {
      expect(screen.getByText('Notificações')).toBeInTheDocument();
      expect(screen.getByText('Nova aula disponível')).toBeInTheDocument();
    });
  });

  it('closes dropdown on Escape key', async () => {
    mockFetch(1, [
      {
        id: '1',
        type: 'NEW_LESSON',
        title: 'Nova aula',
        body: 'Body',
        read: false,
        data: { productSlug: 'react', lessonId: 'l1' },
        created_at: new Date().toISOString(),
        read_at: null,
      },
    ]);
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Notificações' }));

    await waitFor(() => {
      expect(screen.getByText('Nova aula')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Nova aula')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown on click outside', async () => {
    mockFetch(1, [
      {
        id: '1',
        type: 'NEW_LESSON',
        title: 'Nova aula',
        body: 'Body',
        read: false,
        data: { productSlug: 'react', lessonId: 'l1' },
        created_at: new Date().toISOString(),
        read_at: null,
      },
    ]);
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Notificações' }));

    await waitFor(() => {
      expect(screen.getByText('Nova aula')).toBeInTheDocument();
    });

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Nova aula')).not.toBeInTheDocument();
    });
  });

  it('polls unread count every 30 seconds', async () => {
    const fetchSpy = mockFetch(3);
    render(<NotificationBell />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    const initialCallCount = fetchSpy.mock.calls.filter((c) =>
      String(c[0]).includes('/unread-count')
    ).length;

    // Advance 30 seconds
    vi.advanceTimersByTime(30_000);

    await waitFor(() => {
      const newCallCount = fetchSpy.mock.calls.filter((c) =>
        String(c[0]).includes('/unread-count')
      ).length;
      expect(newCallCount).toBeGreaterThan(initialCallCount);
    });
  });
});
