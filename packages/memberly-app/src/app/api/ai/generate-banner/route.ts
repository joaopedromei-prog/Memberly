import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { generateBanner } from '@/lib/ai/gemini-client';
import { uploadBannerFromBase64 } from '@/lib/storage/banner-upload';
import { slugify } from '@/lib/utils/slugify';
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'Request body must be valid JSON', 400);
  }

  const description = body.description as string | undefined;
  const entityType = body.entityType as string | undefined;
  const entityName = body.entityName as string | undefined;
  const productSlug = body.productSlug as string | undefined;
  const index = body.index as number | undefined;

  if (!description || !entityType || !entityName) {
    return apiError('VALIDATION_ERROR', 'description, entityType e entityName são obrigatórios', 400);
  }

  if (entityType !== 'product' && entityType !== 'module') {
    return apiError('VALIDATION_ERROR', 'entityType deve ser "product" ou "module"', 400);
  }

  try {
    const banner = await generateBanner(description);

    const slug = productSlug ?? slugify(entityName);
    const fileName = entityType === 'product'
      ? `${slug}/product.png`
      : `${slug}/module-${index ?? 0}.png`;

    const publicUrl = await uploadBannerFromBase64(
      banner.base64Data,
      fileName,
      banner.mimeType
    );

    return apiSuccess({ bannerUrl: publicUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao gerar banner';
    return apiError('BANNER_GENERATION_ERROR', message, 502);
  }
}
