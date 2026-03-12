import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductMappings } from '@/components/admin/ProductMappings';
import { PreviewButton } from '@/components/admin/PreviewButton';

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

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ProductMappings productId={product.id} />
      </div>
    </div>
  );
}
