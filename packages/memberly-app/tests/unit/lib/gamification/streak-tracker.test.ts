import { vi } from 'vitest';

// Mock admin client
const mockMaybeSingle = vi.fn();
const mockEqSelect = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    }),
  }),
}));

import { updateStreak } from '@/lib/gamification/streak-tracker';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0];
}

function getDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
}

describe('updateStreak', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new streak record when none exists (AC7)', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    await updateStreak('profile-1');

    expect(mockInsert).toHaveBeenCalledWith({
      profile_id: 'profile-1',
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: getToday(),
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should no-op when last_activity_date is today (AC2)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        profile_id: 'profile-1',
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: getToday(),
      },
    });

    await updateStreak('profile-1');

    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should increment streak when last_activity_date is yesterday (AC3)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        profile_id: 'profile-1',
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: getYesterday(),
      },
    });

    await updateStreak('profile-1');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        current_streak: 6,
        longest_streak: 10,
        last_activity_date: getToday(),
      })
    );
  });

  it('should reset streak to 1 when last_activity_date is older than yesterday (AC4)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        profile_id: 'profile-1',
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: getDaysAgo(3),
      },
    });

    await updateStreak('profile-1');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        current_streak: 1,
        longest_streak: 10,
        last_activity_date: getToday(),
      })
    );
  });

  it('should update longest_streak when current exceeds it (AC5)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        profile_id: 'profile-1',
        current_streak: 10,
        longest_streak: 8,
        last_activity_date: getYesterday(),
      },
    });

    await updateStreak('profile-1');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        current_streak: 11,
        longest_streak: 11,
      })
    );
  });

  it('should preserve longest_streak when reset occurs (AC5)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        profile_id: 'profile-1',
        current_streak: 3,
        longest_streak: 15,
        last_activity_date: getDaysAgo(5),
      },
    });

    await updateStreak('profile-1');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        current_streak: 1,
        longest_streak: 15,
      })
    );
  });

  it('should always set last_activity_date to today and updated_at (AC6)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        profile_id: 'profile-1',
        current_streak: 2,
        longest_streak: 5,
        last_activity_date: getYesterday(),
      },
    });

    await updateStreak('profile-1');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        last_activity_date: getToday(),
        updated_at: expect.any(String),
      })
    );
  });

  it('should reset streak to 1 when last_activity_date is null (AC4)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        profile_id: 'profile-1',
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      },
    });

    await updateStreak('profile-1');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: getToday(),
      })
    );
  });
});
