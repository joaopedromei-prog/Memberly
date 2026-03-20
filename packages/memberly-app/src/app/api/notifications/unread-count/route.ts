import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET() {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('read', false);

  if (error) {
    return apiError('DATABASE_ERROR', 'Erro ao contar notificações não lidas', 500);
  }

  return apiSuccess({ count: count ?? 0 });
}
