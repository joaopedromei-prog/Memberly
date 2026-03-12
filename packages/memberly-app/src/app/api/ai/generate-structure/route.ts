import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { wizardInputsSchema } from '@/types/ai';
import { generateStructure } from '@/lib/ai/claude-client';
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

  const validation = wizardInputsSchema.safeParse(body);
  if (!validation.success) {
    return apiError('VALIDATION_ERROR', 'Dados inválidos', 400, {
      issues: validation.error.issues,
    });
  }

  try {
    const structure = await generateStructure(validation.data);
    return apiSuccess(structure);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao gerar estrutura';
    return apiError('AI_GENERATION_ERROR', message, 502);
  }
}
