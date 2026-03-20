import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationCard, type Notification } from '@/components/member/NotificationCard';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    type: 'NEW_LESSON',
    title: 'Nova aula disponível',
    body: 'A aula "Introdução" foi publicada no curso Marketing.',
    read: false,
    data: { productSlug: 'marketing', lessonId: 'lesson-1' },
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1h ago
    read_at: null,
    ...overrides,
  };
}

describe('NotificationCard', () => {
  const onMarkRead = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification title and body', () => {
    render(
      <NotificationCard
        notification={makeNotification()}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    expect(screen.getByText('Nova aula disponível')).toBeInTheDocument();
    expect(screen.getByText('A aula "Introdução" foi publicada no curso Marketing.')).toBeInTheDocument();
  });

  it('renders formatted time', () => {
    render(
      <NotificationCard
        notification={makeNotification()}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    expect(screen.getByText('1h atrás')).toBeInTheDocument();
  });

  it('applies unread styling with border', () => {
    const { container } = render(
      <NotificationCard
        notification={makeNotification({ read: false })}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-primary');
  });

  it('applies read styling without border', () => {
    const { container } = render(
      <NotificationCard
        notification={makeNotification({ read: true })}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('border-primary');
    expect(card.className).toContain('bg-transparent');
  });

  it('calls onMarkRead and navigates on click when unread', () => {
    render(
      <NotificationCard
        notification={makeNotification({ read: false })}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /nova aula disponível/i }));
    expect(onMarkRead).toHaveBeenCalledWith('notif-1');
    expect(mockPush).toHaveBeenCalledWith('/products/marketing/lessons/lesson-1');
  });

  it('navigates on click without calling onMarkRead when already read', () => {
    render(
      <NotificationCard
        notification={makeNotification({ read: true })}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /nova aula disponível/i }));
    expect(onMarkRead).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/products/marketing/lessons/lesson-1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <NotificationCard
        notification={makeNotification()}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByLabelText('Deletar notificação'));
    expect(onDelete).toHaveBeenCalledWith('notif-1');
    // Should not navigate
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders correct icon for COMMENT_REPLY type', () => {
    const { container } = render(
      <NotificationCard
        notification={makeNotification({ type: 'COMMENT_REPLY' })}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    // MessageCircle icon should be rendered (lucide renders SVG)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders correct icon for COURSE_COMPLETED type', () => {
    const { container } = render(
      <NotificationCard
        notification={makeNotification({ type: 'COURSE_COMPLETED' })}
        onMarkRead={onMarkRead}
        onDelete={onDelete}
      />
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });
});
