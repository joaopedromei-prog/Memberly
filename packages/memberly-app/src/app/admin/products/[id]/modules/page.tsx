import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ModuleList, type ModuleListItem } from '@/components/admin/ModuleList';
import { CourseCompletionWidget } from '@/components/admin/CourseCompletionWidget';

interface ModulesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModulesPage({ params }: ModulesPageProps) {
  const { id: productId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, title')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    notFound();
  }

  const { data: rawModules } = await supabase
    .from('modules')
    .select('id, title, description, banner_url, sort_order, product_id, drip_days, created_at, lessons(id, is_published, duration_minutes)')
    .eq('product_id', productId)
    .order('sort_order');

  interface RawLesson {
    id: string;
    is_published: boolean;
    duration_minutes: number | null;
  }

  const modules: ModuleListItem[] = (rawModules ?? []).map((m) => {
    const lessons = (m.lessons ?? []) as RawLesson[];
    const publishedCount = lessons.filter((l) => l.is_published).length;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      banner_url: m.banner_url,
      sort_order: m.sort_order,
      product_id: m.product_id,
      drip_days: m.drip_days,
      created_at: m.created_at,
      lessonCount: lessons.length,
      publishedCount,
      draftCount: lessons.length - publishedCount,
    };
  });

  // Compute stats for the completion widget
  const totalLessons = modules.reduce((s, m) => s + m.lessonCount, 0);
  const publishedLessons = modules.reduce((s, m) => s + m.publishedCount, 0);
  const totalDurationMinutes = (rawModules ?? []).reduce((s, m) => {
    const lessons = (m.lessons ?? []) as RawLesson[];
    return s + lessons.reduce((ls, l) => ls + (l.duration_minutes ?? 0), 0);
  }, 0);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Produtos', href: '/admin/products' },
          { label: product.title, href: `/admin/products/${product.id}` },
          { label: 'Módulos' },
        ]}
      />

      <CourseCompletionWidget
        totalModules={modules.length}
        totalLessons={totalLessons}
        publishedLessons={publishedLessons}
        totalDurationMinutes={totalDurationMinutes}
      />

      <ModuleList productId={productId} modules={modules} />
    </div>
  );
}
