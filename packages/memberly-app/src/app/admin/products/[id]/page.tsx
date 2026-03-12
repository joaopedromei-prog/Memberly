import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductMappings } from '@/components/admin/ProductMappings';
import { PreviewButton } from '@/components/admin/PreviewButton';
import type { ModuleWithLessonCount } from '@/types/api';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(count)')
    .eq('product_id', id)
    .order('sort_order');

  const moduleList = (modules as ModuleWithLessonCount[]) ?? [];
  const moduleCount = moduleList.length;
  const lessonCount = moduleList.reduce(
    (sum, m) => sum + (m.lessons?.[0]?.count ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Editar Produto</h2>
        {product.slug && (
          <PreviewButton slug={product.slug} />
        )}
      </div>
      <div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <ProductForm product={product} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Conteúdo do Curso
        </h3>

        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
          <span>{moduleCount} módulo{moduleCount !== 1 ? 's' : ''}</span>
          <span aria-hidden="true">·</span>
          <span>{lessonCount} aula{lessonCount !== 1 ? 's' : ''}</span>
        </div>

        <Link
          href={`/admin/products/${id}/modules`}
          className="group block rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6 text-center transition-colors hover:border-blue-500 hover:bg-blue-100"
        >
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl group-hover:bg-blue-200">
            📚
          </div>
          <p className="text-lg font-semibold text-blue-700 group-hover:text-blue-800">
            Gerenciar Módulos
          </p>
          <p className="mt-1 text-sm text-blue-500">
            {moduleCount > 0
              ? `${moduleCount} módulo${moduleCount !== 1 ? 's' : ''} · ${lessonCount} aula${lessonCount !== 1 ? 's' : ''}`
              : 'Adicione módulos e aulas ao seu curso'}
          </p>
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ProductMappings productId={product.id} />
      </div>
    </div>
  );
}
