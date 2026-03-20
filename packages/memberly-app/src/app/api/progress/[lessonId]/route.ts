import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { notifyCourseCompleted } from '@/lib/notifications/triggers/course-completed';
import type { NextRequest } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError('UNAUTHORIZED', 'Não autenticado', 401);
  }

  // Verify lesson exists and get its product via module
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, module:modules!inner(id, product_id)')
    .eq('id', lessonId)
    .single();

  if (!lesson) {
    return apiError('NOT_FOUND', 'Aula não encontrada', 404);
  }

  // Verify member has access to the product containing this lesson
  const productId = (lesson.module as unknown as { id: string; product_id: string }).product_id;
  const { data: access } = await supabase
    .from('member_access')
    .select('id')
    .eq('profile_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (!access) {
    return apiError('FORBIDDEN', 'Sem acesso a este produto', 403);
  }

  // Check existing progress
  const { data: existing } = await supabase
    .from('lesson_progress')
    .select('id, completed')
    .eq('profile_id', user.id)
    .eq('lesson_id', lessonId)
    .single();

  if (existing) {
    // Toggle
    const newCompleted = !existing.completed;
    const { data, error } = await supabase
      .from('lesson_progress')
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return apiError('UPDATE_ERROR', error.message, 500);

    // Fire-and-forget: check course completion when toggling to completed (AC5, AC6)
    if (newCompleted) {
      notifyCourseCompleted(user.id, lessonId).catch(() => {/* silent */});
    }

    return apiSuccess(data);
  }

  // Create new progress record
  const { data, error } = await supabase
    .from('lesson_progress')
    .insert({
      profile_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return apiError('CREATE_ERROR', error.message, 500);

  // Fire-and-forget: check course completion on first completion (AC5, AC6)
  notifyCourseCompleted(user.id, lessonId).catch(() => {/* silent */});

  return apiSuccess(data, 201);
}
