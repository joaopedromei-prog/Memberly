import type { SupabaseClient } from '@supabase/supabase-js';

export interface ContinueWatchingItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  productBannerUrl: string | null;
  nextLessonId: string;
  nextLessonTitle: string;
  progressPercent: number;
}

export async function getContinueWatching(
  supabase: SupabaseClient,
  userId: string
): Promise<ContinueWatchingItem[]> {
  // Get member's accessible products
  const { data: memberAccess } = await supabase
    .from('member_access')
    .select('product_id')
    .eq('profile_id', userId);

  if (!memberAccess || memberAccess.length === 0) return [];

  const productIds = memberAccess.map((a) => a.product_id);

  // Get products with their modules and lessons
  const { data: products } = await supabase
    .from('products')
    .select(`
      id, title, slug, banner_url,
      modules (
        id, sort_order,
        lessons ( id, title, sort_order )
      )
    `)
    .eq('is_published', true)
    .in('id', productIds)
    .order('sort_order');

  if (!products || products.length === 0) return [];

  // Get all user progress
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('profile_id', userId)
    .eq('completed', true);

  const completedIds = new Set(
    (progressData || []).map((p) => p.lesson_id)
  );

  const items: ContinueWatchingItem[] = [];

  for (const product of products) {
    const modules = (product.modules || []) as {
      id: string;
      sort_order: number;
      lessons: { id: string; title: string; sort_order: number }[];
    }[];

    // Sort modules and lessons by sort_order
    const sortedModules = [...modules].sort(
      (a, b) => a.sort_order - b.sort_order
    );

    const allLessons: { id: string; title: string }[] = [];
    for (const mod of sortedModules) {
      const sortedLessons = [...(mod.lessons || [])].sort(
        (a, b) => a.sort_order - b.sort_order
      );
      allLessons.push(...sortedLessons);
    }

    if (allLessons.length === 0) continue;

    const completedCount = allLessons.filter((l) =>
      completedIds.has(l.id)
    ).length;

    // Only include if started but not finished
    if (completedCount === 0 || completedCount === allLessons.length) continue;

    const percent = Math.round(
      (completedCount / allLessons.length) * 100
    );

    // Find next uncompleted lesson
    const nextLesson = allLessons.find((l) => !completedIds.has(l.id));
    if (!nextLesson) continue;

    items.push({
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      productBannerUrl: product.banner_url,
      nextLessonId: nextLesson.id,
      nextLessonTitle: nextLesson.title,
      progressPercent: percent,
    });
  }

  return items;
}

/**
 * Pure function: find next uncompleted lesson from ordered list
 */
export function findNextLesson(
  lessons: { id: string; title: string }[],
  completedIds: Set<string>
): { id: string; title: string } | null {
  return lessons.find((l) => !completedIds.has(l.id)) ?? null;
}
