import { vi } from 'vitest';

const mockCreateNotification = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/notifications/create-notification', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

const mockCheckProductCompletion = vi.fn();

vi.mock('@/lib/certificates/completion-check', () => ({
  checkProductCompletion: (...args: unknown[]) => mockCheckProductCompletion(...args),
}));

// Mock admin client
const mockSingle = vi.fn();
const mockEqId = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelectLessons = vi.fn().mockReturnValue({ eq: mockEqId });

const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'lessons') {
    return { select: mockSelectLessons };
  }
  return {};
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { notifyCourseCompleted } from '@/lib/notifications/triggers/course-completed';

describe('notifyCourseCompleted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create notification when course is 100% completed', async () => {
    mockSingle.mockResolvedValue({
      data: {
        module: { product_id: 'prod-1', product: { title: 'Curso Full', slug: 'curso-full' } },
      },
      error: null,
    });

    mockCheckProductCompletion.mockResolvedValue({
      completed: true,
      totalLessons: 5,
      completedLessons: 5,
    });

    await notifyCourseCompleted('user-1', 'lesson-5');

    expect(mockCreateNotification).toHaveBeenCalledWith({
      profileId: 'user-1',
      type: 'COURSE_COMPLETED',
      title: 'Curso concluído!',
      body: 'Parabéns! Você completou Curso Full',
      data: { productId: 'prod-1', productSlug: 'curso-full' },
    });
  });

  it('should NOT create notification when course is NOT fully completed', async () => {
    mockSingle.mockResolvedValue({
      data: {
        module: { product_id: 'prod-1', product: { title: 'Curso', slug: 'curso' } },
      },
      error: null,
    });

    mockCheckProductCompletion.mockResolvedValue({
      completed: false,
      totalLessons: 5,
      completedLessons: 3,
    });

    await notifyCourseCompleted('user-1', 'lesson-3');

    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it('should not notify when lesson is not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    await notifyCourseCompleted('user-1', 'nonexistent');

    expect(mockCheckProductCompletion).not.toHaveBeenCalled();
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });
});
