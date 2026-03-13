import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RecentProduct {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  module_count: number;
  lesson_count: number;
}

interface RecentProductsTableProps {
  products: RecentProduct[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function RecentProductsTable({ products }: RecentProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-[18px] font-semibold text-slate-900 mb-4">
          Produtos Recentes
        </h2>
        <p className="text-sm text-slate-500">Nenhum produto cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[18px] font-semibold text-slate-900">
          Produtos Recentes
        </h2>
        <Link
          href="/admin/products"
          className="text-[14px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          Ver todos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-[12px] font-semibold text-slate-500 uppercase tracking-[0.05em]">
                Produto
              </th>
              <th className="pb-3 text-[12px] font-semibold text-slate-500 uppercase tracking-[0.05em]">
                Módulos
              </th>
              <th className="pb-3 text-[12px] font-semibold text-slate-500 uppercase tracking-[0.05em]">
                Aulas
              </th>
              <th className="pb-3 text-[12px] font-semibold text-slate-500 uppercase tracking-[0.05em]">
                Status
              </th>
              <th className="pb-3 text-[12px] font-semibold text-slate-500 uppercase tracking-[0.05em]">
                Criado em
              </th>
              <th className="pb-3 text-[12px] font-semibold text-slate-500 uppercase tracking-[0.05em] text-right">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-150"
              >
                <td className="py-4 text-[14px] font-medium text-slate-900">
                  {product.title}
                </td>
                <td className="py-4 text-[14px] text-slate-700">
                  {product.module_count} módulos
                </td>
                <td className="py-4 text-[14px] text-slate-700">
                  {product.lesson_count} aulas
                </td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium ring-1 ring-inset ${
                      product.is_published
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-slate-100 text-slate-600 ring-slate-200'
                    }`}
                  >
                    {product.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="py-4 text-[14px] text-slate-700">
                  {formatDate(product.created_at)}
                </td>
                <td className="py-4 text-right">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-[14px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
