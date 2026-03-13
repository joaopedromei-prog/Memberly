import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { createAdminClient } from '@/lib/supabase/admin';
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

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: { full_name?: string; email?: string; product_id?: string };
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_BODY', 'Body JSON inválido', 400);
  }

  const { full_name, email, product_id } = body;

  if (!full_name || !full_name.trim()) {
    return apiError('VALIDATION_ERROR', 'Nome completo é obrigatório', 400);
  }

  if (!email || !email.trim()) {
    return apiError('VALIDATION_ERROR', 'Email é obrigatório', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return apiError('VALIDATION_ERROR', 'Formato de email inválido', 400);
  }

  const supabaseAdmin = createAdminClient();

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: crypto.randomUUID(),
    email_confirm: true,
  });

  if (authError) {
    if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
      return apiError('CONFLICT', 'Este email já está cadastrado', 409);
    }
    return apiError('AUTH_ERROR', authError.message, 500);
  }

  // Create profile
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: authData.user.id,
    full_name: full_name.trim(),
    role: 'member',
  });

  if (profileError) {
    return apiError('PROFILE_ERROR', profileError.message, 500);
  }

  // Grant product access if product selected
  if (product_id) {
    await supabaseAdmin.from('member_access').insert({
      profile_id: authData.user.id,
      product_id,
      granted_by: 'manual',
    });
  }

  // Send password recovery email
  await supabaseAdmin.auth.resetPasswordForEmail(email.trim());

  return apiSuccess(
    {
      id: authData.user.id,
      full_name: full_name.trim(),
      email: email.trim(),
      product_id: product_id || null,
    },
    201
  );
}
