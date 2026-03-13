import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: bookmarks, error } = await supabase
    .from('lesson_bookmarks')
    .select(`
      id, created_at,
      lesson:lessons!inner (
        id, title, duration_minutes,
        module:modules!inner (
          title,
          product:products!inner ( title, slug )
        )
      )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  interface BookmarkRow {
    id: string;
    created_at: string;
    lesson: {
      id: string;
      title: string;
      duration_minutes: number | null;
      module: {
        title: string;
        product: { title: string; slug: string };
      };
    };
  }

  const result = (bookmarks as unknown as BookmarkRow[]).map((b) => ({
    id: b.id,
    lesson_id: b.lesson.id,
    lesson_title: b.lesson.title,
    module_title: b.lesson.module.title,
    product_title: b.lesson.module.product.title,
    product_slug: b.lesson.module.product.slug,
    duration_minutes: b.lesson.duration_minutes,
    created_at: b.created_at,
  }));

  return NextResponse.json(result);
}
