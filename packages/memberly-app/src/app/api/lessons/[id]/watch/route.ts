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

  // Upsert: create or update last_watched_at
  const { error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        profile_id: user.id,
        lesson_id: lessonId,
        last_watched_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,lesson_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
