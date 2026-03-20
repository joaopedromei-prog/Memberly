import { vi } from 'vitest';

// Track createNotification calls
const mockCreateNotification = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/notifications/create-notification', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

// Mock admin client
const mockSingle = vi.fn();
const mockEqId = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelectLessons = vi.fn().mockReturnValue({ eq: mockEqId });

const mockMembersEqProduct = vi.fn();
const mockSelectMembers = vi.fn().mockReturnValue({ eq: mockMembersEqProduct });

const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'lessons') {
    return { select: mockSelectLessons };
  }
  if (table === 'member_access') {
    return { select: mockSelectMembers };
  }
  return {};
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { notifyNewLesson } from '@/lib/notifications/triggers/new-lesson';

describe('notifyNewLesson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create notifications for all members with access', async () => {
    mockSingle.mockResolvedValue({
      data: {
        title: 'Aula Nova',
        module: { product_id: 'prod-1', product: { title: 'Curso A', slug: 'curso-a' } },
      },
      error: null,
    });

    mockMembersEqProduct.mockResolvedValue({
      data: [{ profile_id: 'user-1' }, { profile_id: 'user-2' }],
      error: null,
    });

    await notifyNewLesson('lesson-1');

    expect(mockCreateNotification).toHaveBeenCalledTimes(2);
    expect(mockCreateNotification).toHaveBeenCalledWith({
      profileId: 'user-1',
      type: 'NEW_LESSON',
      title: 'Nova aula disponível',
      body: 'Aula Nova em Curso A',
      data: { lessonId: 'lesson-1', productSlug: 'curso-a', moduleId: 'prod-1' },
    });
    expect(mockCreateNotification).toHaveBeenCalledWith({
      profileId: 'user-2',
      type: 'NEW_LESSON',
      title: 'Nova aula disponível',
      body: 'Aula Nova em Curso A',
      data: { lessonId: 'lesson-1', productSlug: 'curso-a', moduleId: 'prod-1' },
    });
  });

  it('should not create notifications when lesson is not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    await notifyNewLesson('nonexistent');

    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it('should not create notifications when no members have access', async () => {
    mockSingle.mockResolvedValue({
      data: {
        title: 'Aula',
        module: { product_id: 'prod-1', product: { title: 'Curso', slug: 'curso' } },
      },
      error: null,
    });

    mockMembersEqProduct.mockResolvedValue({ data: [], error: null });

    await notifyNewLesson('lesson-1');

    expect(mockCreateNotification).not.toHaveBeenCalled();
  });
});
