import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LessonList } from '@/components/admin/LessonList';
import type { Lesson } from '@/types/database';

interface LessonsPageProps {
  params: Promise<{ id: string; moduleId: string }>;
}

export default async function LessonsPage({ params }: LessonsPageProps) {
  const { id: productId, moduleId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, title')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    notFound();
  }

  const { data: module, error: moduleError } = await supabase
    .from('modules')
    .select('id, title')
    .eq('id', moduleId)
    .single();

  if (moduleError || !module) {
    notFound();
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('sort_order');

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Produtos', href: '/admin/products' },
          { label: product.title, href: `/admin/products/${product.id}` },
          {
            label: 'Módulos',
            href: `/admin/products/${product.id}/modules`,
          },
          { label: module.title },
          { label: 'Aulas' },
        ]}
      />
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Aulas — {module.title}
      </h2>
      <LessonList
        moduleId={moduleId}
        lessons={(lessons as Lesson[]) ?? []}
      />
    </div>
  );
}
