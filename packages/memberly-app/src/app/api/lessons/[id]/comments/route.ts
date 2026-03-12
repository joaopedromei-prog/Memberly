import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError('UNAUTHORIZED', 'Autenticação necessária', 401);
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = 10;

  let query = supabase
    .from('comments')
    .select(`
      id, content, parent_id, created_at,
      profile:profiles!comments_profile_id_fkey ( id, full_name, avatar_url, role ),
      replies:comments (
        id, content, created_at,
        profile:profiles!comments_profile_id_fkey ( id, full_name, avatar_url, role )
      )
    `)
    .eq('lesson_id', lessonId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    return apiError('DATABASE_ERROR', 'Erro ao buscar comentários', 500);
  }

  const hasMore = data.length === limit;
  const nextCursor = hasMore ? data[data.length - 1].created_at : null;

  return apiSuccess({ comments: data, nextCursor });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError('UNAUTHORIZED', 'Autenticação necessária', 401);
  }

  // Verify member access to this lesson's product
  const { data: lesson } = await supabase
    .from('lessons')
    .select('module:modules!inner ( product_id )')
    .eq('id', lessonId)
    .single();

  if (!lesson) {
    return apiError('NOT_FOUND', 'Aula não encontrada', 404);
  }

  const productId = (lesson.module as unknown as { product_id: string }).product_id;

  const { data: access } = await supabase
    .from('member_access')
    .select('id')
    .eq('profile_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (!access) {
    return apiError('FORBIDDEN', 'Sem acesso a este produto', 403);
  }

  let body: { content?: string; parent_id?: string };
  try {
    body = await request.json();
  } catch {
    return apiError('VALIDATION_ERROR', 'Body inválido', 400);
  }

  const content = body.content?.trim();

  if (!content) {
    return apiError('VALIDATION_ERROR', 'Comentário não pode ser vazio', 400);
  }

  if (content.length > 2000) {
    return apiError('VALIDATION_ERROR', 'Limite de 2000 caracteres', 400);
  }

  // If parent_id provided, verify it exists and belongs to same lesson
  if (body.parent_id) {
    const { data: parent } = await supabase
      .from('comments')
      .select('id, lesson_id, parent_id')
      .eq('id', body.parent_id)
      .single();

    if (!parent || parent.lesson_id !== lessonId) {
      return apiError('VALIDATION_ERROR', 'Comentário pai inválido', 400);
    }

    // Only 1 level of nesting
    if (parent.parent_id !== null) {
      return apiError('VALIDATION_ERROR', 'Replies não podem ser aninhados', 400);
    }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      lesson_id: lessonId,
      profile_id: user.id,
      content,
      parent_id: body.parent_id || null,
    })
    .select('id, content, parent_id, created_at, profile:profiles!comments_profile_id_fkey ( id, full_name, avatar_url, role )')
    .single();

  if (error) {
    return apiError('DATABASE_ERROR', 'Erro ao criar comentário', 500);
  }

  return apiSuccess(data, 201);
}
