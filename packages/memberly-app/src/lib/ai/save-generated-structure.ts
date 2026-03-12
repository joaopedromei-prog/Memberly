import { createServerSupabaseClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slugify';
import type { GeneratedStructure } from '@/types/ai';

export interface SaveStructureOptions {
  structure: GeneratedStructure;
  bannerUrls?: {
    product: string | null;
    modules: (string | null)[];
  };
}

export async function saveGeneratedStructure(
  structure: GeneratedStructure,
  bannerUrls?: SaveStructureOptions['bannerUrls']
): Promise<{ productId: string }> {
  const supabase = await createServerSupabaseClient();

  const slug = slugify(structure.product.title);

  // 1. Create product (draft)
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      title: structure.product.title,
      description: structure.product.description,
      banner_url: bannerUrls?.product ?? null,
      slug,
      is_published: false,
    })
    .select('id')
    .single();

  if (productError) {
    throw new Error(`Erro ao criar produto: ${productError.message}`);
  }

  // 2. Create modules with lessons
  for (let moduleIndex = 0; moduleIndex < structure.modules.length; moduleIndex++) {
    const mod = structure.modules[moduleIndex];

    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .insert({
        product_id: product.id,
        title: mod.title,
        description: mod.description,
        banner_url: bannerUrls?.modules?.[moduleIndex] ?? null,
        sort_order: moduleIndex,
      })
      .select('id')
      .single();

    if (moduleError) {
      // Rollback: delete product (cascade should handle modules)
      await supabase.from('products').delete().eq('id', product.id);
      throw new Error(`Erro ao criar módulo "${mod.title}": ${moduleError.message}`);
    }

    // 3. Create lessons for this module
    const lessons = mod.lessons.map((lesson, lessonIndex) => ({
      module_id: moduleData.id,
      title: lesson.title,
      description: lesson.description,
      duration_minutes: lesson.durationMinutes,
      video_provider: 'youtube' as const,
      video_id: '',
      sort_order: lessonIndex,
    }));

    const { error: lessonsError } = await supabase.from('lessons').insert(lessons);

    if (lessonsError) {
      await supabase.from('products').delete().eq('id', product.id);
      throw new Error(`Erro ao criar aulas do módulo "${mod.title}": ${lessonsError.message}`);
    }
  }

  return { productId: product.id };
}
