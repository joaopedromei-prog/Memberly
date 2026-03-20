import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationSettings } from '@/components/admin/NotificationSettings';

// Mock toast store
vi.mock('@/stores/toast-store', () => ({
  useToastStore: () => vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const DEFAULT_CONFIG = {
  NEW_LESSON: true,
  COMMENT_REPLY: true,
  COURSE_COMPLETED: true,
};

describe('NotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it('renders all 3 notification toggles', () => {
    render(
      <NotificationSettings productId="prod-1" initialConfig={DEFAULT_CONFIG} />
    );

    expect(screen.getByText('Nova aula publicada')).toBeInTheDocument();
    expect(screen.getByText('Resposta a comentário')).toBeInTheDocument();
    expect(screen.getByText('Curso concluído')).toBeInTheDocument();
  });

  it('renders header with bell icon and title', () => {
    render(
      <NotificationSettings productId="prod-1" initialConfig={DEFAULT_CONFIG} />
    );

    expect(screen.getByText('Notificações')).toBeInTheDocument();
  });

  it('renders all toggles as enabled when initialConfig is all true', () => {
    render(
      <NotificationSettings productId="prod-1" initialConfig={DEFAULT_CONFIG} />
    );

    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);
    switches.forEach((sw) => {
      expect(sw).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('renders toggles with mixed states', () => {
    render(
      <NotificationSettings
        productId="prod-1"
        initialConfig={{ NEW_LESSON: false, COMMENT_REPLY: true, COURSE_COMPLETED: false }}
      />
    );

    const switches = screen.getAllByRole('switch');
    expect(switches[0]).toHaveAttribute('aria-checked', 'false'); // NEW_LESSON
    expect(switches[1]).toHaveAttribute('aria-checked', 'true');  // COMMENT_REPLY
    expect(switches[2]).toHaveAttribute('aria-checked', 'false'); // COURSE_COMPLETED
  });

  it('toggles state and calls API on click', async () => {
    render(
      <NotificationSettings productId="prod-1" initialConfig={DEFAULT_CONFIG} />
    );

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]); // Toggle NEW_LESSON off

    expect(switches[0]).toHaveAttribute('aria-checked', 'false');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/products/prod-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications_config: {
            NEW_LESSON: false,
            COMMENT_REPLY: true,
            COURSE_COMPLETED: true,
          },
        }),
      });
    });
  });

  it('disables buttons while saving', async () => {
    // Make fetch hang
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(
      <NotificationSettings productId="prod-1" initialConfig={DEFAULT_CONFIG} />
    );

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);

    // All switches should be disabled while saving
    switches.forEach((sw) => {
      expect(sw).toBeDisabled();
    });
  });

  it('reverts state on API failure', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    render(
      <NotificationSettings productId="prod-1" initialConfig={DEFAULT_CONFIG} />
    );

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]); // Toggle NEW_LESSON off (optimistic)

    // Wait for the revert
    await waitFor(() => {
      expect(switches[0]).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('renders description texts', () => {
    render(
      <NotificationSettings productId="prod-1" initialConfig={DEFAULT_CONFIG} />
    );

    expect(
      screen.getByText('Notificar membros quando uma nova aula é publicada')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Notificar quando alguém responde a um comentário')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Notificar quando o membro completa 100% do curso')
    ).toBeInTheDocument();
  });
});
