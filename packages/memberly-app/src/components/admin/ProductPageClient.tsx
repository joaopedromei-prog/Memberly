'use client';

import { useState, useEffect } from 'react';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductMappings } from '@/components/admin/ProductMappings';
import { ProductContentManager } from '@/components/admin/ProductContentManager';
import { PreviewButton } from '@/components/admin/PreviewButton';
import { ProductStatusBadge } from '@/components/admin/ProductStatusBadge';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui-store';
import type { Product } from '@/types/database';
import type { ModuleWithLessons } from '@/types/api';

interface ProductPageClientProps {
  product: Product;
  modules: ModuleWithLessons[];
}

const tabs = [
  { id: 'content' as const, label: 'Conteúdo' },
  { id: 'details' as const, label: 'Detalhes' },
  { id: 'integrations' as const, label: 'Integrações' },
];

type TabId = (typeof tabs)[number]['id'];

export function ProductPageClient({
  product,
  modules,
}: ProductPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('content');
  const setBreadcrumbLabel = useUIStore((s) => s.setBreadcrumbLabel);
  const clearBreadcrumbLabels = useUIStore((s) => s.clearBreadcrumbLabels);

  useEffect(() => {
    setBreadcrumbLabel(product.id, product.title);
    return () => clearBreadcrumbLabels();
  }, [product.id, product.title, setBreadcrumbLabel, clearBreadcrumbLabels]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          <ProductStatusBadge isPublished={product.is_published} />
        </div>
        {product.slug && <PreviewButton slug={product.slug} />}
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'border-b-2 pb-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && (
        <ProductContentManager productId={product.id} modules={modules} />
      )}

      {activeTab === 'details' && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <ProductForm product={product} embedded />
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <ProductMappings productId={product.id} />
        </div>
      )}
    </div>
  );
}
