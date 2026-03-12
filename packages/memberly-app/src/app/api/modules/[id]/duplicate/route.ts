import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: moduleId } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch original module
  const { data: original, error: fetchError } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .single();

  if (fetchError || !original) {
    return apiError('NOT_FOUND', 'Module not found', 404);
  }

  // Get next sort_order
  const { data: existing } = await supabase
    .from('modules')
    .select('sort_order')
    .eq('product_id', original.product_id)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder =
    existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  // Create duplicated module
  const { data: newModule, error: createError } = await supabase
    .from('modules')
    .insert({
      product_id: original.product_id,
      title: `Cópia de ${original.title}`,
      description: original.description,
      banner_url: original.banner_url,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (createError || !newModule) {
    return apiError('CREATE_ERROR', createError?.message ?? 'Failed to duplicate module', 500);
  }

  // Fetch lessons from original module
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('sort_order');

  // Duplicate all lessons as drafts
  if (lessons && lessons.length > 0) {
    const newLessons = lessons.map((lesson) => ({
      module_id: newModule.id,
      title: lesson.title,
      description: lesson.description,
      video_provider: lesson.video_provider,
      video_id: lesson.video_id,
      pdf_url: lesson.pdf_url,
      attachments: lesson.attachments ?? [],
      sort_order: lesson.sort_order,
      duration_minutes: lesson.duration_minutes,
      is_published: false,
    }));

    const { error: lessonsError } = await supabase
      .from('lessons')
      .insert(newLessons);

    if (lessonsError) {
      return apiError('CREATE_ERROR', lessonsError.message, 500);
    }
  }

  // Return the new module with lesson count
  const { data: result } = await supabase
    .from('modules')
    .select('*, lessons(count)')
    .eq('id', newModule.id)
    .single();

  return apiSuccess(result, 201);
}
