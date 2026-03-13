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

  const [
    totalMembers,
    activeMembers30d,
    avgCompletion,
    topLessons,
    recentWebhooks,
    chartData,
    { count: totalLessons },
    recentProducts,
  ] = await Promise.all([
    getTotalMembers(supabase),
    getActiveMembers(supabase, 30),
    getAverageCompletion(supabase),
    getTopLessons(supabase, 5),
    getRecentWebhooks(supabase, 7),
    getNewMembersChart(supabase),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    getRecentProducts(supabase, 5),
  ]);

  return (
    <AdminDashboardClient
      totalMembers={totalMembers}
      activeMembers30d={activeMembers30d}
      avgCompletion={avgCompletion}
      totalLessons={totalLessons ?? 0}
      chartData={chartData}
      recentWebhooks={recentWebhooks}
      topLessons={topLessons}
      recentProducts={recentProducts}
    />
  );
}
