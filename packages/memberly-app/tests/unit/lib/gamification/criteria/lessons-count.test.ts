import { vi } from 'vitest';
import { checkLessonsCount } from '@/lib/gamification/criteria/lessons-count';

function createMockClient(count: number | null) {
  const eqCompleted = vi.fn().mockResolvedValue({ count });
  const eqProfile = vi.fn().mockReturnValue({ eq: eqCompleted });
  const select = vi.fn().mockReturnValue({ eq: eqProfile });
  const from = vi.fn().mockReturnValue({ select });

  return { from } as unknown as Parameters<typeof checkLessonsCount>[2];
}

describe('checkLessonsCount', () => {
  it('should return true when member has >= 50 completed lessons', async () => {
    const client = createMockClient(75);
    const result = await checkLessonsCount('profile-1', 50, client);
    expect(result).toBe(true);
  });

  it('should return true when member has exactly 50 completed lessons', async () => {
    const client = createMockClient(50);
    const result = await checkLessonsCount('profile-1', 50, client);
    expect(result).toBe(true);
  });

  it('should return false when member has < 50 completed lessons', async () => {
    const client = createMockClient(30);
    const result = await checkLessonsCount('profile-1', 50, client);
    expect(result).toBe(false);
  });

  it('should return false when count is null', async () => {
    const client = createMockClient(null);
    const result = await checkLessonsCount('profile-1', 50, client);
    expect(result).toBe(false);
  });
});
