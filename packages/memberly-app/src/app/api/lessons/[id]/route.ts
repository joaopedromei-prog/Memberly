import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';

const VALID_PROVIDERS = ['youtube', 'pandavideo'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const supabase = await createServerSupabaseClient();
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.video_provider !== undefined) {
    if (!VALID_PROVIDERS.includes(body.video_provider)) {
      return apiError(
        'VALIDATION_ERROR',
        'video_provider must be youtube or pandavideo',
        400
      );
    }
    updates.video_provider = body.video_provider;
  }
  if (body.video_id !== undefined) updates.video_id = body.video_id;
  if (body.pdf_url !== undefined) updates.pdf_url = body.pdf_url;
  if (body.attachments !== undefined) updates.attachments = body.attachments;
  if (body.duration_minutes !== undefined)
    updates.duration_minutes = body.duration_minutes;
  if (body.is_published !== undefined) updates.is_published = body.is_published;

  if (Object.keys(updates).length === 0) {
    return apiError('VALIDATION_ERROR', 'No fields to update', 400);
  }

  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) return apiError('UPDATE_ERROR', error.message, 500);
  return apiSuccess(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) return apiError('DELETE_ERROR', error.message, 500);
  return apiSuccess({ deleted: true });
}
