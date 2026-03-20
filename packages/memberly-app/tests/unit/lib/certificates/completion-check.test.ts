import { checkProductCompletion } from '@/lib/certificates/completion-check';
import { vi } from 'vitest';

function createMockSupabase(overrides: {
  modules?: { lessons: { id: string }[] }[] | null;
  modulesError?: { message: string } | null;
  progress?: { lesson_id: string }[] | null;
  progressError?: { message: string } | null;
}) {
  const inFn = vi.fn().mockResolvedValue({
    data: overrides.progress ?? [],
    error: overrides.progressError ?? null,
  });

  const progressEqCompleted = vi.fn().mockReturnValue({ in: inFn });
  const progressEqProfile = vi.fn().mockReturnValue({ eq: progressEqCompleted });
  const progressSelect = vi.fn().mockReturnValue({ eq: progressEqProfile });

  const modulesEqPublished = vi.fn().mockResolvedValue({
    data: overrides.modules ?? [],
    error: overrides.modulesError ?? null,
  });
  const modulesEqProduct = vi.fn().mockReturnValue({ eq: modulesEqPublished });
  const modulesSelect = vi.fn().mockReturnValue({ eq: modulesEqProduct });

  let callCount = 0;
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'modules') {
      return { select: modulesSelect };
    }
    if (table === 'lesson_progress') {
      return { select: progressSelect };
    }
    callCount++;
    return { select: vi.fn() };
  });

  return { from } as unknown as Parameters<typeof checkProductCompletion>[0];
}

describe('checkProductCompletion', () => {
  it('should return completed=true when all lessons are completed', async () => {
    const supabase = createMockSupabase({
      modules: [
        { lessons: [{ id: 'l1' }, { id: 'l2' }] },
        { lessons: [{ id: 'l3' }] },
      ],
      progress: [{ lesson_id: 'l1' }, { lesson_id: 'l2' }, { lesson_id: 'l3' }],
    });

    const result = await checkProductCompletion(supabase, 'profile-1', 'product-1');

    expect(result.completed).toBe(true);
    expect(result.totalLessons).toBe(3);
    expect(result.completedLessons).toBe(3);
  });

  it('should return completed=false when not all lessons are completed', async () => {
    const supabase = createMockSupabase({
      modules: [
        { lessons: [{ id: 'l1' }, { id: 'l2' }] },
      ],
      progress: [{ lesson_id: 'l1' }],
    });

    const result = await checkProductCompletion(supabase, 'profile-1', 'product-1');

    expect(result.completed).toBe(false);
    expect(result.totalLessons).toBe(2);
    expect(result.completedLessons).toBe(1);
  });

  it('should return completed=false with totalLessons=0 when no published lessons exist', async () => {
    const supabase = createMockSupabase({
      modules: [{ lessons: [] }],
    });

    const result = await checkProductCompletion(supabase, 'profile-1', 'product-1');

    expect(result.completed).toBe(false);
    expect(result.totalLessons).toBe(0);
    expect(result.completedLessons).toBe(0);
  });

  it('should return completed=false when modules is empty', async () => {
    const supabase = createMockSupabase({
      modules: [],
    });

    const result = await checkProductCompletion(supabase, 'profile-1', 'product-1');

    expect(result.completed).toBe(false);
    expect(result.totalLessons).toBe(0);
    expect(result.completedLessons).toBe(0);
  });

  it('should throw when modules query fails', async () => {
    const supabase = createMockSupabase({
      modulesError: { message: 'DB error' },
    });

    await expect(
      checkProductCompletion(supabase, 'profile-1', 'product-1')
    ).rejects.toThrow('Failed to fetch product lessons: DB error');
  });

  it('should throw when progress query fails', async () => {
    const supabase = createMockSupabase({
      modules: [{ lessons: [{ id: 'l1' }] }],
      progressError: { message: 'Progress error' },
    });

    await expect(
      checkProductCompletion(supabase, 'profile-1', 'product-1')
    ).rejects.toThrow('Failed to fetch lesson progress: Progress error');
  });
});
