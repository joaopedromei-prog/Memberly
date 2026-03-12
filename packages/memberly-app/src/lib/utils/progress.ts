import type { SupabaseClient } from '@supabase/supabase-js';

export async function calculateModuleProgress(
  supabase: SupabaseClient,
  moduleId: string,
  userId: string
): Promise<{ total: number; completed: number; percent: number }> {
  // Total published lessons in module
  const { count: total } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('module_id', moduleId)
    .eq('is_published', true);

  if (!total || total === 0) {
    return { total: 0, completed: 0, percent: 0 };
  }

  // Get published lesson IDs in this module
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('module_id', moduleId)
    .eq('is_published', true);

  const lessonIds = (lessons || []).map((l) => l.id);

  if (lessonIds.length === 0) {
    return { total: 0, completed: 0, percent: 0 };
  }

  // Completed lessons by user
  const { count: completed } = await supabase
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .eq('completed', true)
    .in('lesson_id', lessonIds);

  const completedCount = completed || 0;
  const percent = Math.round((completedCount / total) * 100);

  return { total, completed: completedCount, percent };
}

export async function calculateProductProgress(
  supabase: SupabaseClient,
  productId: string,
  userId: string
): Promise<{ total: number; completed: number; percent: number }> {
  // Get all modules for this product
  const { data: modules } = await supabase
    .from('modules')
    .select('id')
    .eq('product_id', productId);

  if (!modules || modules.length === 0) {
    return { total: 0, completed: 0, percent: 0 };
  }

  const moduleIds = modules.map((m) => m.id);

  // Total published lessons across all modules
  const { count: total } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .in('module_id', moduleIds)
    .eq('is_published', true);

  if (!total || total === 0) {
    return { total: 0, completed: 0, percent: 0 };
  }

  // Get all published lesson IDs
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds)
    .eq('is_published', true);

  const lessonIds = (lessons || []).map((l) => l.id);

  // Completed lessons
  const { count: completed } = await supabase
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .eq('completed', true)
    .in('lesson_id', lessonIds);

  const completedCount = completed || 0;
  const percent = Math.round((completedCount / total) * 100);

  return { total, completed: completedCount, percent };
}

/**
 * Pure calculation function (no DB dependency) for testing
 */
export function calculatePercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
