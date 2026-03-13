import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { profile_ids, product_id, action } = body as {
    profile_ids: string[];
    product_id: string;
    action: 'grant' | 'revoke';
  };

  if (!Array.isArray(profile_ids) || profile_ids.length === 0 || !product_id || !action) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const admin = createAdminClient();
  let affected = 0;

  if (action === 'grant') {
    const rows = profile_ids.map((pid) => ({
      profile_id: pid,
      product_id,
      granted_by: 'manual' as const,
    }));

    const { error } = await admin
      .from('member_access')
      .upsert(rows, { onConflict: 'profile_id,product_id', ignoreDuplicates: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    affected = profile_ids.length;
  } else if (action === 'revoke') {
    const { error, count } = await admin
      .from('member_access')
      .delete({ count: 'exact' })
      .eq('product_id', product_id)
      .in('profile_id', profile_ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    affected = count ?? 0;
  }

  return NextResponse.json({ affected, action });
}
