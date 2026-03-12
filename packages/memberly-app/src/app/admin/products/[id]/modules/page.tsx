import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ModuleList } from '@/components/admin/ModuleList';
import { CourseCompletionWidget } from '@/components/admin/CourseCompletionWidget';
import type { ModuleWithLessonCount } from '@/types/api';
import type { Lesson } from '@/types/database';

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

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(count)')
    .eq('product_id', productId)
    .order('sort_order');

  // Fetch all lessons for course completion widget
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('*')
    .in(
      'module_id',
      (modules ?? []).map((m: ModuleWithLessonCount) => m.id)
    );

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Produtos', href: '/admin/products' },
          { label: product.title, href: `/admin/products/${product.id}` },
          { label: 'Módulos' },
        ]}
      />
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Módulos — {product.title}
      </h2>

      <div className="mb-6">
        <CourseCompletionWidget lessons={(allLessons as Lesson[]) ?? []} />
      </div>

      <ModuleList
        productId={productId}
        modules={(modules as ModuleWithLessonCount[]) ?? []}
      />
    </div>
  );
}
