'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { WizardInputs, GeneratedStructure, WizardBanners } from '@/types/ai';
import { slugify } from '@/lib/utils/slugify';

interface AiWizardStep2Props {
  inputs: WizardInputs;
  onSuccess: (structure: GeneratedStructure, banners: WizardBanners | null) => void;
  onError: (message: string) => void;
}

export function AiWizardStep2({ inputs, onSuccess, onError }: AiWizardStep2Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Gerando sua area de membros...');

  async function generateBannerForEntity(
    description: string,
    entityType: 'product' | 'module',
    entityName: string,
    productSlug: string,
    index: number
  ): Promise<string | null> {
    try {
      const response = await fetch('/api/ai/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, entityType, entityName, productSlug, index }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.bannerUrl ?? null;
    } catch {
      return null;
    }
  }

  async function generateBanners(structure: GeneratedStructure): Promise<WizardBanners> {
    const productSlug = slugify(structure.product.title);
    const totalBanners = 1 + structure.modules.length;

    // Generate product banner
    setStatusMessage(`Gerando banner 1 de ${totalBanners}...`);
    const productUrl = await generateBannerForEntity(
      structure.product.bannerSuggestion,
      'product',
      structure.product.title,
      productSlug,
      0
    );

    // Generate module banners sequentially (rate limit)
    const moduleBanners = [];
    for (let i = 0; i < structure.modules.length; i++) {
      setStatusMessage(`Gerando banner ${i + 2} de ${totalBanners}...`);
      const mod = structure.modules[i];
      const url = await generateBannerForEntity(
        mod.bannerSuggestion,
        'module',
        mod.title,
        productSlug,
        i
      );
      moduleBanners.push({
        status: url ? 'generated' as const : 'failed' as const,
        url,
      });
    }

    return {
      product: {
        status: productUrl ? 'generated' : 'failed',
        url: productUrl,
      },
      modules: moduleBanners,
    };
  }

  async function generate() {
    setErrorMessage(null);
    setStatusMessage('Gerando sua area de membros...');

    try {
      const response = await fetch('/api/ai/generate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message ?? 'Erro ao gerar estrutura');
      }

      const structure: GeneratedStructure = await response.json();

      // Generate banners if enabled
      let banners: WizardBanners | null = null;
      if (inputs.generateBanners) {
        banners = await generateBanners(structure);
      }

      onSuccess(structure, banners);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao gerar estrutura';
      setErrorMessage(message);
      onError(message);
    }
  }

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Ops! Algo deu errado</h3>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
        </div>
        <Button
          onClick={() => generate()}
          className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
        <svg className="h-7 w-7 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{statusMessage}</h3>
        <p className="mt-2 text-sm text-gray-500">
          {inputs.generateBanners
            ? 'A IA esta criando a estrutura e os banners. Isso pode levar um pouco mais.'
            : 'A IA esta criando a estrutura completa do seu produto. Isso pode levar alguns segundos.'}
        </p>
      </div>
    </div>
  );
}
