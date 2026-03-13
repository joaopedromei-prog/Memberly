import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import {
  getTotalMembers,
  getActiveMembers,
  getAverageCompletion,
  getTopLessons,
  getRecentWebhooks,
  getNewMembersChart,
  getRecentProducts,
} from '@/lib/queries/admin-metrics';

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const results = await Promise.allSettled([
    getTotalMembers(supabase),
    getActiveMembers(supabase, 30),
    getAverageCompletion(supabase),
    getTopLessons(supabase, 5),
    getRecentWebhooks(supabase, 7),
    getNewMembersChart(supabase),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    getRecentProducts(supabase, 5),
  ]);

  const val = <T,>(r: PromiseSettledResult<T>, fallback: T): T =>
    r.status === 'fulfilled' ? r.value : fallback;

  const lessonsResult = results[6];
  const totalLessons = lessonsResult.status === 'fulfilled'
    ? (lessonsResult.value.count ?? 0)
    : 0;

  return (
    <AdminDashboardClient
      totalMembers={val(results[0], 0)}
      activeMembers30d={val(results[1], 0)}
      avgCompletion={val(results[2], 0)}
      totalLessons={totalLessons}
      chartData={val(results[5], [])}
      recentWebhooks={val(results[4], [])}
      topLessons={val(results[3], [])}
      recentProducts={val(results[7], [])}
    />
  );
}
