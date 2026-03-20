import { vi } from 'vitest';

// Mock admin client before imports
const mockMaybeSingle = vi.fn();
const mockInsert = vi.fn();
const mockEqType = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
const mockEqProfile = vi.fn().mockReturnValue({ eq: mockEqType });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEqProfile });

const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'notification_preferences') {
    return { select: mockSelect };
  }
  if (table === 'notifications') {
    return { insert: mockInsert };
  }
  return {};
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { createNotification } from '@/lib/notifications/create-notification';

describe('createNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  it('should create notification when no preference exists (default enabled)', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    await createNotification({
      profileId: 'user-1',
      type: 'NEW_LESSON',
      title: 'Nova aula disponível',
      body: 'Aula 1 em Curso X',
      data: { lessonId: 'l1' },
    });

    expect(mockFrom).toHaveBeenCalledWith('notification_preferences');
    expect(mockFrom).toHaveBeenCalledWith('notifications');
    expect(mockInsert).toHaveBeenCalledWith({
      profile_id: 'user-1',
      type: 'NEW_LESSON',
      title: 'Nova aula disponível',
      body: 'Aula 1 em Curso X',
      data: { lessonId: 'l1' },
    });
  });

  it('should create notification when preference is enabled', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { enabled: true }, error: null });

    await createNotification({
      profileId: 'user-1',
      type: 'COMMENT_REPLY',
      title: 'Resposta',
      body: 'Alguém respondeu',
    });

    expect(mockInsert).toHaveBeenCalledWith({
      profile_id: 'user-1',
      type: 'COMMENT_REPLY',
      title: 'Resposta',
      body: 'Alguém respondeu',
      data: null,
    });
  });

  it('should NOT create notification when preference is disabled', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { enabled: false }, error: null });

    await createNotification({
      profileId: 'user-1',
      type: 'NEW_LESSON',
      title: 'Nova aula',
      body: 'Teste',
    });

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should set data to null when not provided', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    await createNotification({
      profileId: 'user-1',
      type: 'COURSE_COMPLETED',
      title: 'Concluído',
      body: 'Parabéns',
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ data: null })
    );
  });
});
