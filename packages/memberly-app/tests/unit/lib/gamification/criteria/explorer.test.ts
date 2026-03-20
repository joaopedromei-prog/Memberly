import { vi } from 'vitest';
import { checkExplorer } from '@/lib/gamification/criteria/explorer';

function createMockClient(count: number | null) {
  const eqProfile = vi.fn().mockResolvedValue({ count });
  const select = vi.fn().mockReturnValue({ eq: eqProfile });
  const from = vi.fn().mockReturnValue({ select });

  return { from } as unknown as Parameters<typeof checkExplorer>[2];
}

describe('checkExplorer', () => {
  it('should return true when member has >= 3 product accesses', async () => {
    const client = createMockClient(5);
    const result = await checkExplorer('profile-1', 3, client);
    expect(result).toBe(true);
  });

  it('should return true when member has exactly 3 product accesses', async () => {
    const client = createMockClient(3);
    const result = await checkExplorer('profile-1', 3, client);
    expect(result).toBe(true);
  });

  it('should return false when member has < 3 product accesses', async () => {
    const client = createMockClient(2);
    const result = await checkExplorer('profile-1', 3, client);
    expect(result).toBe(false);
  });

  it('should return false when count is null', async () => {
    const client = createMockClient(null);
    const result = await checkExplorer('profile-1', 3, client);
    expect(result).toBe(false);
  });
});
