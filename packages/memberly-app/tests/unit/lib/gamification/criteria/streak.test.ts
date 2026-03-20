import { vi } from 'vitest';
import { checkStreak } from '@/lib/gamification/criteria/streak';

function createMockClient(data: { current_streak: number } | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data });
  const eqProfile = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq: eqProfile });
  const from = vi.fn().mockReturnValue({ select });

  return { from } as unknown as Parameters<typeof checkStreak>[2];
}

describe('checkStreak', () => {
  it('should return true when current_streak meets threshold (STREAK_7)', async () => {
    const client = createMockClient({ current_streak: 10 });
    const result = await checkStreak('profile-1', 7, client);
    expect(result).toBe(true);
  });

  it('should return true when current_streak equals threshold exactly', async () => {
    const client = createMockClient({ current_streak: 30 });
    const result = await checkStreak('profile-1', 30, client);
    expect(result).toBe(true);
  });

  it('should return false when current_streak below threshold', async () => {
    const client = createMockClient({ current_streak: 5 });
    const result = await checkStreak('profile-1', 7, client);
    expect(result).toBe(false);
  });

  it('should return false when no streak record exists', async () => {
    const client = createMockClient(null);
    const result = await checkStreak('profile-1', 7, client);
    expect(result).toBe(false);
  });
});
