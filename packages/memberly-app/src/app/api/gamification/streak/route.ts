import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiSuccess, apiError } from '@/lib/utils/api-response';

export async function GET() {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;

  const { data: streak, error } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (error) {
    return apiError('DATABASE_ERROR', 'Erro ao buscar streak', 500);
  }

  return apiSuccess(streak ?? {
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
  });
}
