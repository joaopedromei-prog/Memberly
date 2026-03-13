import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { requireAdmin } from '@/lib/utils/auth-guard';
import { slugify } from '@/lib/utils/slugify';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const admin = createAdminClient();

  // Parse body
  const body = await request.json();
  const newTitle = (body as { title?: string }).title ?? '';
  if (!newTitle.trim()) return apiError('VALIDATION_ERROR', 'Title is required', 400);

  // Fetch original product with modules and lessons
  const { data: product, error: productError } = await admin
    .from('products')
    .select('*, modules(*, lessons(*))')
    .eq('id', id)
    .single();

  if (productError || !product) {
    return apiError('NOT_FOUND', 'Product not found', 404);
  }

  // Generate unique slug
  const baseSlug = slugify(newTitle);
  let slug = `${baseSlug}-copy`;
  let counter = 1;
  while (true) {
    const { data: existing } = await admin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!existing) break;
    counter++;
    slug = `${baseSlug}-copy-${counter}`;
  }

  // Insert new product (draft)
  const { data: newProduct, error: insertError } = await admin
    .from('products')
    .insert({
      title: newTitle,
      description: product.description,
      banner_url: product.banner_url,
      slug,
      is_published: false,
      sort_order: product.sort_order,
    })
    .select('id, slug')
    .single();

  if (insertError || !newProduct) {
    return apiError('SERVER_ERROR', `Failed to create product: ${insertError?.message}`, 500);
  }

  // Copy modules and lessons
  const modules = (product.modules ?? []) as Array<{
    id: string;
    title: string;
    description: string;
    banner_url: string | null;
    sort_order: number;
    lessons: Array<{
      title: string;
      description: string;
      video_provider: string;
      video_id: string;
      pdf_url: string | null;
      attachments: unknown;
      sort_order: number;
      duration_minutes: number | null;
      is_published: boolean;
    }>;
  }>;

  for (const mod of modules) {
    const { data: newModule } = await admin
      .from('modules')
      .insert({
        product_id: newProduct.id,
        title: mod.title,
        description: mod.description,
        banner_url: mod.banner_url,
        sort_order: mod.sort_order,
      })
      .select('id')
      .single();

    if (!newModule) continue;

    for (const lesson of mod.lessons ?? []) {
      await admin.from('lessons').insert({
        module_id: newModule.id,
        title: lesson.title,
        description: lesson.description,
        video_provider: lesson.video_provider as 'youtube' | 'pandavideo',
        video_id: lesson.video_id,
        pdf_url: lesson.pdf_url,
        attachments: lesson.attachments as unknown[],
        sort_order: lesson.sort_order,
        duration_minutes: lesson.duration_minutes,
        is_published: lesson.is_published,
      });
    }
  }

  return apiSuccess({ id: newProduct.id, slug: newProduct.slug });
}
