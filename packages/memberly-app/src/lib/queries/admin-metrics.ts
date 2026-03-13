import type { SupabaseClient } from '@supabase/supabase-js';

export async function getTotalMembers(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'member');

  return count ?? 0;
}

export async function getRecentProducts(
  supabase: SupabaseClient,
  limit: number
): Promise<
  Array<{
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    module_count: number;
    lesson_count: number;
  }>
> {
  const { data: products } = await supabase
    .from('products')
    .select('id, title, slug, is_published, created_at, modules(id, lessons(id))')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!products) return [];

  return products.map((p) => {
    const modules = (p.modules ?? []) as unknown as Array<{ id: string; lessons: Array<{ id: string }> }>;
    const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      is_published: p.is_published,
      created_at: p.created_at,
      module_count: modules.length,
      lesson_count: lessonCount,
    };
  });
}

export async function getActiveMembers(supabase: SupabaseClient, days: number): Promise<number> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const { count } = await supabase
    .from('lesson_progress')
    .select('profile_id', { count: 'exact', head: true })
    .or(`completed_at.gte.${since},created_at.gte.${since}`);

  return count ?? 0;
}

export async function getAverageCompletion(supabase: SupabaseClient): Promise<number> {
  // Get all products with their total lessons and member progress
  const { data: products } = await supabase
    .from('products')
    .select('id, lessons:modules(lessons(id))')
    .eq('is_published', true);

  if (!products || products.length === 0) return 0;

  let totalCompletion = 0;
  let productCount = 0;

  for (const product of products) {
    // Count total lessons in this product
    const allLessons: string[] = [];
    const modules = product.lessons as unknown as Array<{ lessons: Array<{ id: string }> }>;
    for (const mod of modules ?? []) {
      for (const lesson of mod.lessons ?? []) {
        allLessons.push(lesson.id);
      }
    }
    if (allLessons.length === 0) continue;

    // Get members with access
    const { data: access } = await supabase
      .from('member_access')
      .select('profile_id')
      .eq('product_id', product.id);

    if (!access || access.length === 0) continue;

    // Get completed lessons for these members in this product's lessons
    const { count: completedCount } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true)
      .in('profile_id', access.map((a) => a.profile_id))
      .in('lesson_id', allLessons);

    const maxPossible = access.length * allLessons.length;
    if (maxPossible > 0) {
      totalCompletion += ((completedCount ?? 0) / maxPossible) * 100;
      productCount++;
    }
  }

  return productCount > 0 ? Math.round(totalCompletion / productCount) : 0;
}

export async function getTopLessons(
  supabase: SupabaseClient,
  limit: number
): Promise<Array<{ lesson_title: string; product_title: string; count: number }>> {
  // Use RPC or manual join — Supabase doesn't support GROUP BY directly
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('completed', true);

  if (!progress || progress.length === 0) return [];

  // Count per lesson_id
  const counts = new Map<string, number>();
  for (const p of progress) {
    counts.set(p.lesson_id, (counts.get(p.lesson_id) ?? 0) + 1);
  }

  // Sort and get top N
  const topIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (topIds.length === 0) return [];

  // Fetch lesson + product info
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, module:modules(product:products(title))')
    .in('id', topIds.map(([id]) => id));

  return topIds.map(([id, count]) => {
    const lesson = lessons?.find((l) => l.id === id);
    const lessonModule = lesson?.module as unknown as { product: { title: string } } | null;
    return {
      lesson_title: lesson?.title ?? 'Unknown',
      product_title: lessonModule?.product?.title ?? 'Unknown',
      count,
    };
  });
}

export async function getRecentWebhooks(
  supabase: SupabaseClient,
  limit: number
): Promise<Array<{ id: string; event_type: string; status: string; created_at: string; error_message: string | null }>> {
  const { data } = await supabase
    .from('webhook_logs')
    .select('id, event_type, status, created_at, error_message')
    .order('created_at', { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getNewMembersChart(
  supabase: SupabaseClient
): Promise<Array<{ date: string; count: number }>> {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('role', 'member')
    .gte('created_at', since);

  // Group by date
  const dateCounts = new Map<string, number>();

  // Initialize all 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    dateCounts.set(d.toISOString().split('T')[0], 0);
  }

  for (const p of profiles ?? []) {
    const date = p.created_at.split('T')[0];
    dateCounts.set(date, (dateCounts.get(date) ?? 0) + 1);
  }

  return [...dateCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}
