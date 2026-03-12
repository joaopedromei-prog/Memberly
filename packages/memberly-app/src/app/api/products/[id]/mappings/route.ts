import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: apiError('UNAUTHORIZED', 'Authentication required', 401) };
  }

  const role = user.user_metadata?.role;
  if (role !== 'admin') {
    return { error: apiError('FORBIDDEN', 'Admin access required', 403) };
  }

  return { user };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const adminCheck = await verifyAdmin(supabase);
  if (adminCheck.error) {
    return adminCheck.error;
  }

  const { data, error } = await supabase
    .from('product_mappings')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return apiError('SERVER_ERROR', 'Failed to fetch mappings', 500);
  }

  return apiSuccess(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const adminCheck = await verifyAdmin(supabase);
  if (adminCheck.error) {
    return adminCheck.error;
  }

  const body = await request.json();
  const externalProductId = body.external_product_id?.trim();

  if (!externalProductId) {
    return apiError('VALIDATION_ERROR', 'external_product_id é obrigatório', 400);
  }

  const gateway = body.gateway || 'payt';
  if (gateway !== 'payt') {
    return apiError('VALIDATION_ERROR', 'Gateway deve ser "payt"', 400);
  }

  const { data, error } = await supabase
    .from('product_mappings')
    .insert({
      external_product_id: externalProductId,
      product_id: id,
      gateway,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return apiError(
        'DUPLICATE_MAPPING',
        'Este ID externo já está mapeado para este gateway',
        409
      );
    }
    return apiError('SERVER_ERROR', 'Failed to create mapping', 500);
  }

  return apiSuccess(data, 201);
}
