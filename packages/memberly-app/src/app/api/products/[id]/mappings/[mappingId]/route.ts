import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; mappingId: string }> }
) {
  const { id, mappingId } = await params;
  const supabase = await createServerSupabaseClient();

  // Admin auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', 'Authentication required', 401);
  }
  if (user.user_metadata?.role !== 'admin') {
    return apiError('FORBIDDEN', 'Admin access required', 403);
  }

  const { error } = await supabase
    .from('product_mappings')
    .delete()
    .eq('id', mappingId)
    .eq('product_id', id);

  if (error) {
    return apiError('SERVER_ERROR', 'Failed to delete mapping', 500);
  }

  return apiSuccess({ deleted: true });
}
