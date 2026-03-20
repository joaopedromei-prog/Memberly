import { vi } from 'vitest';
import { checkComments } from '@/lib/gamification/criteria/comments';

function createMockClient(count: number | null) {
  const eqProfile = vi.fn().mockResolvedValue({ count });
  const select = vi.fn().mockReturnValue({ eq: eqProfile });
  const from = vi.fn().mockReturnValue({ select });

  return { from } as unknown as Parameters<typeof checkComments>[2];
}

describe('checkComments', () => {
  it('should return true when member has >= 10 comments', async () => {
    const client = createMockClient(15);
    const result = await checkComments('profile-1', 10, client);
    expect(result).toBe(true);
  });

  it('should return true when member has exactly 10 comments', async () => {
    const client = createMockClient(10);
    const result = await checkComments('profile-1', 10, client);
    expect(result).toBe(true);
  });

  it('should return false when member has < 10 comments', async () => {
    const client = createMockClient(5);
    const result = await checkComments('profile-1', 10, client);
    expect(result).toBe(false);
  });

  it('should return false when count is null', async () => {
    const client = createMockClient(null);
    const result = await checkComments('profile-1', 10, client);
    expect(result).toBe(false);
  });
});
