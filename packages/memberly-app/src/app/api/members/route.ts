import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth.data;
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search') || '';
  const productId = searchParams.get('product_id') || '';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // If filtering by product, get profile IDs with access first
  let profileIdsWithAccess: string[] | null = null;
  if (productId) {
    const { data: accessRows } = await supabase
      .from('member_access')
      .select('profile_id')
      .eq('product_id', productId);

    profileIdsWithAccess = accessRows?.map((r) => r.profile_id) ?? [];

    if (profileIdsWithAccess.length === 0) {
      return apiSuccess({ data: [], total: 0, page, limit, totalPages: 0 });
    }
  }

  let query = supabase
    .from('profiles')
    .select('*, member_access(count)', { count: 'exact' })
    .eq('role', 'member')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }

  if (profileIdsWithAccess) {
    query = query.in('id', profileIdsWithAccess);
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError('FETCH_ERROR', error.message, 500);
  }

  return apiSuccess({
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
