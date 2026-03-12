import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id, productId } = await params;
  const { supabase } = auth.data;

  const { error } = await supabase
    .from('member_access')
    .delete()
    .eq('profile_id', id)
    .eq('product_id', productId);

  if (error) {
    return apiError('DELETE_ERROR', error.message, 500);
  }

  return apiSuccess({ message: 'Acesso removido com sucesso' });
}
