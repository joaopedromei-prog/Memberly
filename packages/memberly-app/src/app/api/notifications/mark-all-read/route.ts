import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function POST() {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;

  // First count unread, then update
  const { count: unreadCount, error: countError } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('read', false);

  if (countError) {
    return apiError('DATABASE_ERROR', 'Erro ao marcar notificações como lidas', 500);
  }

  const toUpdate = unreadCount ?? 0;

  if (toUpdate > 0) {
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('profile_id', user.id)
      .eq('read', false);

    if (updateError) {
      return apiError('DATABASE_ERROR', 'Erro ao marcar notificações como lidas', 500);
    }
  }

  return apiSuccess({ updated: toUpdate });
}
