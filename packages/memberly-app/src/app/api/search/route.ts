import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get products the member has access to
  const { data: memberAccess } = await supabase
    .from('member_access')
    .select('product_id')
    .eq('profile_id', user.id);

  if (!memberAccess || memberAccess.length === 0) {
    return NextResponse.json([]);
  }

  const productIds = memberAccess.map((a) => a.product_id);
  const pattern = `%${q}%`;

  // Search lessons by title OR module title, filtered by member access
  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id, title, duration_minutes,
      module:modules!inner (
        title, product_id,
        product:products!inner ( title, slug )
      )
    `)
    .eq('is_published', true)
    .in('module.product_id', productIds)
    .or(`title.ilike.${pattern},module.title.ilike.${pattern}`)
    .limit(20);

  if (!lessons) {
    return NextResponse.json([]);
  }

  interface SearchRow {
    id: string;
    title: string;
    duration_minutes: number | null;
    module: {
      title: string;
      product_id: string;
      product: { title: string; slug: string };
    };
  }

  const results = (lessons as unknown as SearchRow[]).map((l) => ({
    lesson_id: l.id,
    lesson_title: l.title,
    module_title: l.module.title,
    product_title: l.module.product.title,
    product_slug: l.module.product.slug,
    duration_minutes: l.duration_minutes,
  }));

  return NextResponse.json(results);
}
