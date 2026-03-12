import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { supabase } = auth.data;

  const body = await request.json();
  const { product_id } = body;

  if (!product_id) {
    return apiError('VALIDATION_ERROR', 'product_id é obrigatório', 400);
  }

  const { data, error } = await supabase
    .from('member_access')
    .insert({
      profile_id: id,
      product_id,
      granted_by: 'manual',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return apiError('CONFLICT', 'Membro já tem acesso a este produto', 409);
    }
    return apiError('INSERT_ERROR', error.message, 500);
  }

  return apiSuccess(data, 201);
}
