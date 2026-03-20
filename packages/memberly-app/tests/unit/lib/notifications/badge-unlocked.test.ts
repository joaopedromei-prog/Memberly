import { vi } from 'vitest';

const mockCreateNotification = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/notifications/create-notification', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

// Mock admin client
const mockSingle = vi.fn();
const mockEqId = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEqId });

const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'badges') {
    return { select: mockSelect };
  }
  return {};
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { notifyBadgeUnlocked } from '@/lib/notifications/triggers/badge-unlocked';

describe('notifyBadgeUnlocked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create notification with badge name when badge exists', async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Primeira Aula', description: 'Completou a primeira aula' },
      error: null,
    });

    await notifyBadgeUnlocked('user-1', 'badge-1');

    expect(mockFrom).toHaveBeenCalledWith('badges');
    expect(mockSelect).toHaveBeenCalledWith('name, description');
    expect(mockEqId).toHaveBeenCalledWith('id', 'badge-1');
    expect(mockCreateNotification).toHaveBeenCalledWith({
      profileId: 'user-1',
      type: 'BADGE_UNLOCKED',
      title: 'Nova conquista desbloqueada!',
      body: 'Voce conquistou: Primeira Aula',
      data: { badgeId: 'badge-1', badgeName: 'Primeira Aula' },
    });
  });

  it('should NOT create notification when badge is not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    await notifyBadgeUnlocked('user-1', 'nonexistent-badge');

    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it('should pass correct profileId to createNotification', async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Maratonista', description: 'Completou 10 aulas' },
      error: null,
    });

    await notifyBadgeUnlocked('user-42', 'badge-marathon');

    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: 'user-42',
        data: { badgeId: 'badge-marathon', badgeName: 'Maratonista' },
      })
    );
  });
});
