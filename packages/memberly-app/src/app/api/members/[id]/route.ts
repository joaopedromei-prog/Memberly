import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { supabase } = auth.data;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError || !profile) {
    return apiError('NOT_FOUND', 'Membro não encontrado', 404);
  }

  const { data: access } = await supabase
    .from('member_access')
    .select('*, products(id, title, slug, banner_url)')
    .eq('profile_id', id)
    .order('granted_at', { ascending: false });

  return apiSuccess({
    profile,
    access: access ?? [],
  });
}
