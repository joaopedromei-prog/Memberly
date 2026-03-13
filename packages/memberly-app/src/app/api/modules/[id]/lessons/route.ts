import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { requireAdmin } from '@/lib/utils/auth-guard';
import type { NextRequest } from 'next/server';

const VALID_PROVIDERS = ['youtube', 'pandavideo'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id: moduleId } = await params;
  const supabase = auth.data.supabase;

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('sort_order');

  if (error) return apiError('FETCH_ERROR', error.message, 500);
  return apiSuccess(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id: moduleId } = await params;
  const supabase = auth.data.supabase;
  const body = await request.json();

  if (!body.title) {
    return apiError('VALIDATION_ERROR', 'Title is required', 400);
  }

  if (body.video_provider && !VALID_PROVIDERS.includes(body.video_provider)) {
    return apiError(
      'VALIDATION_ERROR',
      'video_provider must be youtube or pandavideo',
      400
    );
  }

  const { data: existing } = await supabase
    .from('lessons')
    .select('sort_order')
    .eq('module_id', moduleId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder =
    existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      module_id: moduleId,
      title: body.title,
      description: body.description || '',
      video_provider: body.video_provider || 'youtube',
      video_id: body.video_id || '',
      pdf_url: body.pdf_url || null,
      attachments: body.attachments || [],
      sort_order: nextOrder,
      duration_minutes: body.duration_minutes || null,
      is_published: body.is_published ?? false,
    })
    .select()
    .single();

  if (error) return apiError('CREATE_ERROR', error.message, 500);
  return apiSuccess(data, 201);
}
