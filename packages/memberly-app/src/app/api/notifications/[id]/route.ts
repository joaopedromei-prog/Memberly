import type { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;
  const { id } = await params;

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('profile_id', user.id)
    .select()
    .single();

  if (error || !data) {
    return apiError('NOT_FOUND', 'Notificação não encontrada', 404);
  }

  return apiSuccess({ notification: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user, supabase } = auth.data;
  const { id } = await params;

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('profile_id', user.id)
    .select('id')
    .single();

  if (error || !data) {
    return apiError('NOT_FOUND', 'Notificação não encontrada', 404);
  }

  return apiSuccess({ deleted: true });
}
