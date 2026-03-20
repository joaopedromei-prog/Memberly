import { vi } from 'vitest';

// Mock completion-check before importing
const mockCheckProductCompletion = vi.fn();
vi.mock('@/lib/certificates/completion-check', () => ({
  checkProductCompletion: (...args: unknown[]) => mockCheckProductCompletion(...args),
}));

import { checkCourseComplete } from '@/lib/gamification/criteria/course-complete';

function createMockClient(accessList: { product_id: string }[] | null) {
  const eqProfile = vi.fn().mockResolvedValue({ data: accessList });
  const select = vi.fn().mockReturnValue({ eq: eqProfile });
  const from = vi.fn().mockReturnValue({ select });

  return { from } as unknown as Parameters<typeof checkCourseComplete>[2];
}

describe('checkCourseComplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when member completed at least 1 product', async () => {
    const client = createMockClient([
      { product_id: 'p1' },
      { product_id: 'p2' },
    ]);
    mockCheckProductCompletion
      .mockResolvedValueOnce({ completed: false, totalLessons: 5, completedLessons: 2 })
      .mockResolvedValueOnce({ completed: true, totalLessons: 3, completedLessons: 3 });

    const result = await checkCourseComplete('profile-1', 1, client);
    expect(result).toBe(true);
    // Should stop after finding the first completed product
    expect(mockCheckProductCompletion).toHaveBeenCalledTimes(2);
  });

  it('should return false when no products are completed', async () => {
    const client = createMockClient([{ product_id: 'p1' }]);
    mockCheckProductCompletion.mockResolvedValueOnce({
      completed: false,
      totalLessons: 5,
      completedLessons: 2,
    });

    const result = await checkCourseComplete('profile-1', 1, client);
    expect(result).toBe(false);
  });

  it('should return false when member has no product access', async () => {
    const client = createMockClient([]);
    const result = await checkCourseComplete('profile-1', 1, client);
    expect(result).toBe(false);
    expect(mockCheckProductCompletion).not.toHaveBeenCalled();
  });

  it('should return false when access list is null', async () => {
    const client = createMockClient(null);
    const result = await checkCourseComplete('profile-1', 1, client);
    expect(result).toBe(false);
  });

  it('should short-circuit on first completed product', async () => {
    const client = createMockClient([
      { product_id: 'p1' },
      { product_id: 'p2' },
      { product_id: 'p3' },
    ]);
    mockCheckProductCompletion.mockResolvedValueOnce({
      completed: true,
      totalLessons: 3,
      completedLessons: 3,
    });

    const result = await checkCourseComplete('profile-1', 1, client);
    expect(result).toBe(true);
    expect(mockCheckProductCompletion).toHaveBeenCalledTimes(1);
  });
});
