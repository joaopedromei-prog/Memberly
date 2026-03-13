import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from('lesson_bookmarks')
    .select('id')
    .eq('profile_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (existing) {
    // Remove bookmark
    await supabase.from('lesson_bookmarks').delete().eq('id', existing.id);
    return NextResponse.json({ bookmarked: false });
  } else {
    // Add bookmark
    const { error } = await supabase
      .from('lesson_bookmarks')
      .insert({ profile_id: user.id, lesson_id: lessonId });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ bookmarked: true });
  }
}
