import type { SupabaseClient } from '@supabase/supabase-js';

export interface CompletionResult {
  completed: boolean;
  totalLessons: number;
  completedLessons: number;
}

/**
 * Check if a member has completed 100% of published lessons for a product.
 * Returns completion status with lesson counts.
 *
 * Edge case: if no published lessons exist, completed = false (cannot complete empty product).
 */
export async function checkProductCompletion(
  supabase: SupabaseClient,
  profileId: string,
  productId: string
): Promise<CompletionResult> {
  // 1. Get all published lessons for the product via modules
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('lessons(id)')
    .eq('product_id', productId)
    .eq('lessons.is_published', true);

  if (modulesError) {
    throw new Error(`Failed to fetch product lessons: ${modulesError.message}`);
  }

  const allLessonIds: string[] = modules?.flatMap(
    (m: { lessons: { id: string }[] }) => m.lessons.map((l) => l.id)
  ) ?? [];

  // Edge case: no published lessons = not completable
  if (allLessonIds.length === 0) {
    return { completed: false, totalLessons: 0, completedLessons: 0 };
  }

  // 2. Get completed lessons for this member
  const { data: progress, error: progressError } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('profile_id', profileId)
    .eq('completed', true)
    .in('lesson_id', allLessonIds);

  if (progressError) {
    throw new Error(`Failed to fetch lesson progress: ${progressError.message}`);
  }

  const completedCount = progress?.length ?? 0;

  return {
    completed: completedCount === allLessonIds.length,
    totalLessons: allLessonIds.length,
    completedLessons: completedCount,
  };
}
