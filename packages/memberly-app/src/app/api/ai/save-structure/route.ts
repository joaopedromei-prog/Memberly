import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { generatedStructureSchema } from '@/types/ai';
import { saveGeneratedStructure } from '@/lib/ai/save-generated-structure';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', 'Autenticação necessária', 401);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return apiError('FORBIDDEN', 'Apenas administradores podem usar esta funcionalidade', 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'Request body must be valid JSON', 400);
  }

  const payload = body as { structure?: unknown; bannerUrls?: unknown };
  const structureData = payload.structure ?? body;
  const validation = generatedStructureSchema.safeParse(structureData);
  if (!validation.success) {
    return apiError('VALIDATION_ERROR', 'Estrutura inválida', 400);
  }

  const bannerUrls = payload.structure
    ? (payload.bannerUrls as { product: string | null; modules: (string | null)[] } | undefined)
    : undefined;

  try {
    const result = await saveGeneratedStructure(validation.data, bannerUrls);
    return apiSuccess(result, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao salvar estrutura';
    return apiError('SAVE_ERROR', message, 500);
  }
}
