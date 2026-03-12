import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch original lesson
  const { data: original, error: fetchError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (fetchError || !original) {
    return apiError('NOT_FOUND', 'Lesson not found', 404);
  }

  // Get next sort_order in the same module
  const { data: existing } = await supabase
    .from('lessons')
    .select('sort_order')
    .eq('module_id', original.module_id)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder =
    existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  // Create duplicated lesson as draft
  const { data: newLesson, error: createError } = await supabase
    .from('lessons')
    .insert({
      module_id: original.module_id,
      title: `Cópia de ${original.title}`,
      description: original.description,
      video_provider: original.video_provider,
      video_id: original.video_id,
      pdf_url: original.pdf_url,
      attachments: original.attachments ?? [],
      sort_order: nextOrder,
      duration_minutes: original.duration_minutes,
      is_published: false,
    })
    .select()
    .single();

  if (createError || !newLesson) {
    return apiError('CREATE_ERROR', createError?.message ?? 'Failed to duplicate lesson', 500);
  }

  return apiSuccess(newLesson, 201);
}
