import { vi } from 'vitest';
import { checkFirstLesson } from '@/lib/gamification/criteria/first-lesson';

function createMockClient(count: number | null) {
  const eqCompleted = vi.fn().mockResolvedValue({ count });
  const eqProfile = vi.fn().mockReturnValue({ eq: eqCompleted });
  const select = vi.fn().mockReturnValue({ eq: eqProfile });
  const from = vi.fn().mockReturnValue({ select });

  return { from } as unknown as Parameters<typeof checkFirstLesson>[2];
}

describe('checkFirstLesson', () => {
  it('should return true when member has at least 1 completed lesson', async () => {
    const client = createMockClient(3);
    const result = await checkFirstLesson('profile-1', 1, client);
    expect(result).toBe(true);
  });

  it('should return true when member has exactly 1 completed lesson', async () => {
    const client = createMockClient(1);
    const result = await checkFirstLesson('profile-1', 1, client);
    expect(result).toBe(true);
  });

  it('should return false when member has 0 completed lessons', async () => {
    const client = createMockClient(0);
    const result = await checkFirstLesson('profile-1', 1, client);
    expect(result).toBe(false);
  });

  it('should return false when count is null', async () => {
    const client = createMockClient(null);
    const result = await checkFirstLesson('profile-1', 1, client);
    expect(result).toBe(false);
  });
});
