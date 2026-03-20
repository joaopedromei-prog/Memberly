import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiSuccess, apiError } from '@/lib/utils/api-response';

export async function GET() {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;

  // Get all active badges
  const { data: badges, error: badgesError } = await supabase
    .from('badges')
    .select('*')
    .eq('active', true)
    .order('created_at');

  if (badgesError) {
    return apiError('DATABASE_ERROR', 'Erro ao buscar badges', 500);
  }

  // Get member's unlocked badges
  const { data: unlocked, error: unlockedError } = await supabase
    .from('member_badges')
    .select('badge_id, unlocked_at')
    .eq('profile_id', user.id);

  if (unlockedError) {
    return apiError('DATABASE_ERROR', 'Erro ao buscar badges desbloqueados', 500);
  }

  const unlockedMap = new Map(
    unlocked?.map((u) => [u.badge_id, u.unlocked_at]) ?? []
  );

  const result = badges?.map((badge) => ({
    ...badge,
    unlocked: unlockedMap.has(badge.id),
    unlocked_at: unlockedMap.get(badge.id) ?? null,
  })) ?? [];

  return apiSuccess(result);
}
