import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationDropdown } from '@/components/member/NotificationDropdown';
import type { Notification } from '@/hooks/useNotifications';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseNotification: Notification = {
  id: '1',
  profile_id: 'user-1',
  type: 'NEW_LESSON',
  title: 'Nova aula disponível',
  body: 'Aula sobre React Hooks foi publicada',
  read: false,
  data: { productSlug: 'react-completo', lessonId: 'lesson-1' },
  created_at: new Date(Date.now() - 5 * 60_000).toISOString(), // 5 min ago
  read_at: null,
};

const readNotification: Notification = {
  id: '2',
  profile_id: 'user-1',
  type: 'COMMENT_REPLY',
  title: 'Resposta ao seu comentário',
  body: 'Maria respondeu: "Ótima observação!"',
  read: true,
  data: { productSlug: 'react-completo', lessonId: 'lesson-2' },
  created_at: new Date(Date.now() - 2 * 3600_000).toISOString(), // 2h ago
  read_at: new Date().toISOString(),
};

const completedNotification: Notification = {
  id: '3',
  profile_id: 'user-1',
  type: 'COURSE_COMPLETED',
  title: 'Curso concluído!',
  body: 'Parabéns por concluir React Completo',
  read: false,
  data: { productSlug: 'react-completo' },
  created_at: new Date(Date.now() - 24 * 3600_000).toISOString(), // 1 day ago
  read_at: null,
};

describe('NotificationDropdown', () => {
  const defaultProps = {
    notifications: [baseNotification, readNotification, completedNotification],
    isLoading: false,
    onMarkRead: vi.fn().mockResolvedValue(undefined),
    onMarkAllRead: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };

  it('renders notification list', () => {
    render(<NotificationDropdown {...defaultProps} />);
    expect(screen.getByText('Nova aula disponível')).toBeInTheDocument();
    expect(screen.getByText('Resposta ao seu comentário')).toBeInTheDocument();
    expect(screen.getByText('Curso concluído!')).toBeInTheDocument();
  });

  it('renders body text for each notification', () => {
    render(<NotificationDropdown {...defaultProps} />);
    expect(screen.getByText('Aula sobre React Hooks foi publicada')).toBeInTheDocument();
    expect(screen.getByText('Maria respondeu: "Ótima observação!"')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<NotificationDropdown {...defaultProps} isLoading={true} notifications={[]} />);
    expect(screen.getByTestId('notification-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    render(<NotificationDropdown {...defaultProps} notifications={[]} />);
    expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument();
  });

  it('shows "Marcar todas como lidas" when there are unread notifications', () => {
    render(<NotificationDropdown {...defaultProps} />);
    expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument();
  });

  it('hides "Marcar todas como lidas" when all are read', () => {
    render(
      <NotificationDropdown
        {...defaultProps}
        notifications={[readNotification]}
      />
    );
    expect(screen.queryByText('Marcar todas como lidas')).not.toBeInTheDocument();
  });

  it('calls onMarkAllRead when button is clicked', () => {
    render(<NotificationDropdown {...defaultProps} />);
    fireEvent.click(screen.getByText('Marcar todas como lidas'));
    expect(defaultProps.onMarkAllRead).toHaveBeenCalled();
  });

  it('renders "Ver todas" link pointing to /notifications', () => {
    render(<NotificationDropdown {...defaultProps} />);
    const link = screen.getByText('Ver todas');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/notifications');
  });

  it('calls onClose when "Ver todas" is clicked', () => {
    render(<NotificationDropdown {...defaultProps} />);
    fireEvent.click(screen.getByText('Ver todas'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('generates correct URL for NEW_LESSON notification', () => {
    render(<NotificationDropdown {...defaultProps} />);
    const link = screen.getByText('Nova aula disponível').closest('a');
    expect(link).toHaveAttribute('href', '/products/react-completo/lessons/lesson-1');
  });

  it('generates correct URL for COMMENT_REPLY notification', () => {
    render(<NotificationDropdown {...defaultProps} />);
    const link = screen.getByText('Resposta ao seu comentário').closest('a');
    expect(link).toHaveAttribute('href', '/products/react-completo/lessons/lesson-2');
  });

  it('generates correct URL for COURSE_COMPLETED notification', () => {
    render(<NotificationDropdown {...defaultProps} />);
    const link = screen.getByText('Curso concluído!').closest('a');
    expect(link).toHaveAttribute('href', '/products/react-completo');
  });

  it('differentiates read/unread styling via border-l-primary class', () => {
    render(<NotificationDropdown {...defaultProps} />);
    const unreadLink = screen.getByText('Nova aula disponível').closest('a');
    const readLink = screen.getByText('Resposta ao seu comentário').closest('a');

    expect(unreadLink?.className).toContain('border-l-primary');
    expect(readLink?.className).toContain('border-l-transparent');
  });

  it('calls onMarkRead and onClose when clicking an unread notification', () => {
    render(<NotificationDropdown {...defaultProps} />);
    fireEvent.click(screen.getByText('Nova aula disponível'));
    expect(defaultProps.onMarkRead).toHaveBeenCalledWith('1');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose but not onMarkRead when clicking a read notification', () => {
    const props = {
      ...defaultProps,
      onMarkRead: vi.fn().mockResolvedValue(undefined),
      onClose: vi.fn(),
    };
    render(<NotificationDropdown {...props} />);
    fireEvent.click(screen.getByText('Resposta ao seu comentário'));
    expect(props.onMarkRead).not.toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });
});
