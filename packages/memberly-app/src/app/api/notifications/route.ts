import type { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 10, 1), 50);

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    return apiError('DATABASE_ERROR', 'Erro ao buscar notificações', 500);
  }

  const notifications = data ?? [];
  const hasMore = notifications.length === limit;
  const nextCursor = hasMore ? notifications[notifications.length - 1].created_at : null;

  return apiSuccess({ notifications, nextCursor });
}
