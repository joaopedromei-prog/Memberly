import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiSuccess, apiError } from '@/lib/utils/api-response';

export async function GET() {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;

  // Fetch badges and streak in parallel
  const [badgesResult, unlockedResult, streakResult] = await Promise.all([
    supabase
      .from('badges')
      .select('*')
      .eq('active', true)
      .order('created_at'),
    supabase
      .from('member_badges')
      .select('badge_id, unlocked_at')
      .eq('profile_id', user.id),
    supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('profile_id', user.id)
      .maybeSingle(),
  ]);

  if (badgesResult.error || unlockedResult.error || streakResult.error) {
    return apiError('DATABASE_ERROR', 'Erro ao buscar perfil de gamificação', 500);
  }

  const unlockedMap = new Map(
    unlockedResult.data?.map((u) => [u.badge_id, u.unlocked_at]) ?? []
  );

  const badges = badgesResult.data?.map((badge) => ({
    ...badge,
    unlocked: unlockedMap.has(badge.id),
    unlocked_at: unlockedMap.get(badge.id) ?? null,
  })) ?? [];

  const streak = streakResult.data ?? {
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
  };

  return apiSuccess({ badges, streak });
}
