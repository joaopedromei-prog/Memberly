import { vi } from 'vitest';

// Mock criteria checkers
const mockCheckerFirstLesson = vi.fn();
const mockCheckerCourseComplete = vi.fn();
const mockCheckerStreak = vi.fn();
const mockCheckerComments = vi.fn();
const mockCheckerExplorer = vi.fn();
const mockCheckerLessonsCount = vi.fn();

vi.mock('@/lib/gamification/criteria', () => ({
  criteriaCheckers: {
    FIRST_LESSON: (...args: unknown[]) => mockCheckerFirstLesson(...args),
    COURSE_COMPLETE: (...args: unknown[]) => mockCheckerCourseComplete(...args),
    STREAK_7: (...args: unknown[]) => mockCheckerStreak(...args),
    STREAK_30: (...args: unknown[]) => mockCheckerStreak(...args),
    COMMENTS_10: (...args: unknown[]) => mockCheckerComments(...args),
    EXPLORER_3: (...args: unknown[]) => mockCheckerExplorer(...args),
    LESSONS_50: (...args: unknown[]) => mockCheckerLessonsCount(...args),
  },
}));

// Mock admin client
const mockInsert = vi.fn();
const mockEqProfile = vi.fn();
const mockSelectBadges = vi.fn();
const mockSelectMemberBadges = vi.fn();

const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'badges') {
    return {
      select: vi.fn().mockReturnValue({
        eq: mockSelectBadges,
      }),
    };
  }
  if (table === 'member_badges') {
    return {
      select: vi.fn().mockReturnValue({
        eq: mockSelectMemberBadges,
      }),
      insert: mockInsert,
    };
  }
  return {};
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { evaluateBadges } from '@/lib/gamification/badge-engine';

describe('evaluateBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it('should return empty array when no active badges exist', async () => {
    mockSelectBadges.mockResolvedValue({ data: [] });

    const result = await evaluateBadges('profile-1');
    expect(result).toEqual([]);
  });

  it('should return empty array when badges data is null', async () => {
    mockSelectBadges.mockResolvedValue({ data: null });

    const result = await evaluateBadges('profile-1');
    expect(result).toEqual([]);
  });

  it('should return empty array when member already has all badges', async () => {
    mockSelectBadges.mockResolvedValue({
      data: [
        { id: 'badge-1', criteria: { type: 'FIRST_LESSON', threshold: 1 } },
      ],
    });
    mockSelectMemberBadges.mockResolvedValue({
      data: [{ badge_id: 'badge-1' }],
    });

    const result = await evaluateBadges('profile-1');
    expect(result).toEqual([]);
  });

  it('should unlock badge when criteria is met', async () => {
    mockSelectBadges.mockResolvedValue({
      data: [
        { id: 'badge-1', criteria: { type: 'FIRST_LESSON', threshold: 1 } },
      ],
    });
    mockSelectMemberBadges.mockResolvedValue({ data: [] });
    mockCheckerFirstLesson.mockResolvedValue(true);

    const result = await evaluateBadges('profile-1');

    expect(result).toEqual(['badge-1']);
    expect(mockInsert).toHaveBeenCalledWith({
      profile_id: 'profile-1',
      badge_id: 'badge-1',
    });
  });

  it('should NOT unlock badge when criteria is not met', async () => {
    mockSelectBadges.mockResolvedValue({
      data: [
        { id: 'badge-1', criteria: { type: 'STREAK_7', threshold: 7 } },
      ],
    });
    mockSelectMemberBadges.mockResolvedValue({ data: [] });
    mockCheckerStreak.mockResolvedValue(false);

    const result = await evaluateBadges('profile-1');
    expect(result).toEqual([]);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should unlock multiple badges in single evaluation', async () => {
    mockSelectBadges.mockResolvedValue({
      data: [
        { id: 'badge-1', criteria: { type: 'FIRST_LESSON', threshold: 1 } },
        { id: 'badge-2', criteria: { type: 'COMMENTS_10', threshold: 10 } },
        { id: 'badge-3', criteria: { type: 'STREAK_7', threshold: 7 } },
      ],
    });
    mockSelectMemberBadges.mockResolvedValue({ data: [] });
    mockCheckerFirstLesson.mockResolvedValue(true);
    mockCheckerComments.mockResolvedValue(true);
    mockCheckerStreak.mockResolvedValue(false);

    const result = await evaluateBadges('profile-1');
    expect(result).toEqual(['badge-1', 'badge-2']);
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it('should skip badges with unknown criteria type', async () => {
    mockSelectBadges.mockResolvedValue({
      data: [
        { id: 'badge-1', criteria: { type: 'UNKNOWN_TYPE', threshold: 1 } },
      ],
    });
    mockSelectMemberBadges.mockResolvedValue({ data: [] });

    const result = await evaluateBadges('profile-1');
    expect(result).toEqual([]);
  });

  it('should handle unique_violation gracefully (race condition)', async () => {
    mockSelectBadges.mockResolvedValue({
      data: [
        { id: 'badge-1', criteria: { type: 'FIRST_LESSON', threshold: 1 } },
      ],
    });
    mockSelectMemberBadges.mockResolvedValue({ data: [] });
    mockCheckerFirstLesson.mockResolvedValue(true);
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'duplicate' } });

    const result = await evaluateBadges('profile-1');
    // Not added to unlocked since it was a duplicate
    expect(result).toEqual([]);
  });

  it('should throw on non-unique-violation insert errors', async () => {
    mockSelectBadges.mockResolvedValue({
      data: [
        { id: 'badge-1', criteria: { type: 'FIRST_LESSON', threshold: 1 } },
      ],
    });
    mockSelectMemberBadges.mockResolvedValue({ data: [] });
    mockCheckerFirstLesson.mockResolvedValue(true);
    mockInsert.mockResolvedValue({ error: { code: '42000', message: 'DB error' } });

    await expect(evaluateBadges('profile-1')).rejects.toEqual({
      code: '42000',
      message: 'DB error',
    });
  });

  it('should only evaluate badges member does not already have', async () => {
    mockSelectBadges.mockResolvedValue({
      data: [
        { id: 'badge-1', criteria: { type: 'FIRST_LESSON', threshold: 1 } },
        { id: 'badge-2', criteria: { type: 'COMMENTS_10', threshold: 10 } },
      ],
    });
    mockSelectMemberBadges.mockResolvedValue({
      data: [{ badge_id: 'badge-1' }],
    });
    mockCheckerComments.mockResolvedValue(true);

    const result = await evaluateBadges('profile-1');
    expect(result).toEqual(['badge-2']);
    // FIRST_LESSON checker should NOT be called since member already has badge-1
    expect(mockCheckerFirstLesson).not.toHaveBeenCalled();
  });
});
