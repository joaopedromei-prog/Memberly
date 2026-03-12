import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Novo Produto</h2>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ProductForm />
      </div>
    </div>
  );
}
