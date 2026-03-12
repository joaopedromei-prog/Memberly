'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface BannerGeneratorProps {
  currentBannerUrl?: string;
  defaultPrompt?: string;
  onBannerGenerated: (url: string) => void;
  onBannerRemoved?: () => void;
  /** Entity info for the API (product or module) */
  entityType: 'product' | 'module';
  entityName: string;
  productSlug?: string;
  moduleIndex?: number;
}

export function BannerGenerator({
  currentBannerUrl,
  defaultPrompt,
  onBannerGenerated,
  onBannerRemoved,
  entityType,
  entityName,
  productSlug,
  moduleIndex,
}: BannerGeneratorProps) {
  const [prompt, setPrompt] = useState(
    defaultPrompt ?? ''
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateBanner = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Informe uma descrição para gerar o banner');
      return;
    }

    setIsGenerating(true);
    setError('');
    setPreviewUrl(null);

    try {
      const res = await fetch('/api/ai/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: prompt,
          entityType,
          entityName,
          productSlug,
          index: moduleIndex,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message ?? 'Erro ao gerar banner');
      }

      setPreviewUrl(data.bannerUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar banner');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, entityType, entityName, productSlug, moduleIndex]);

  const acceptBanner = () => {
    if (previewUrl) {
      onBannerGenerated(previewUrl);
      setPreviewUrl(null);
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
  };

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError('');
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.error?.message ?? 'Erro ao fazer upload');
          return;
        }

        onBannerGenerated(data.url);
      } catch {
        setError('Erro ao fazer upload da imagem');
      } finally {
        setIsUploading(false);
      }
    },
    [onBannerGenerated]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  // If there's a generated preview awaiting confirmation
  if (previewUrl) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">
          Banner gerado — confirme ou regenere:
        </p>
        <img
          src={previewUrl}
          alt="Banner gerado por IA"
          className="h-44 w-full rounded-lg object-cover"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={acceptBanner}
            className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Usar
          </button>
          <button
            type="button"
            onClick={generateBanner}
            disabled={isGenerating}
            className={cn(
              'inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700',
              isGenerating && 'cursor-not-allowed opacity-50'
            )}
          >
            {isGenerating ? 'Gerando...' : 'Regenerar'}
          </button>
          <button
            type="button"
            onClick={cancelPreview}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // If there's an existing banner already saved
  if (currentBannerUrl) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="relative">
          <img
            src={currentBannerUrl}
            alt="Banner atual"
            className="h-44 w-full rounded-lg object-cover"
          />
          {onBannerRemoved && (
            <button
              type="button"
              onClick={onBannerRemoved}
              className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
            >
              Remover
            </button>
          )}
        </div>

        {/* AI regeneration section below existing banner */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-medium text-gray-500">
            Gerar novo banner com IA
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="block flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Descreva o banner..."
            />
            <button
              type="button"
              onClick={generateBanner}
              disabled={isGenerating}
              className={cn(
                'inline-flex shrink-0 items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700',
                isGenerating && 'cursor-not-allowed opacity-50'
              )}
            >
              {isGenerating ? 'Gerando...' : 'Gerar com IA'}
            </button>
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  // Default state: no banner yet
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {/* AI Generation */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          Gerar banner com IA
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="block flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Descreva o banner desejado..."
          />
          <button
            type="button"
            onClick={generateBanner}
            disabled={isGenerating}
            className={cn(
              'inline-flex shrink-0 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700',
              isGenerating && 'cursor-not-allowed opacity-50'
            )}
          >
            {isGenerating ? 'Gerando...' : 'Gerar Banner com IA'}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {isGenerating && (
          <p className="mt-2 text-xs text-gray-400">
            Isso pode levar alguns segundos...
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">ou</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Manual upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          {isUploading ? (
            <p className="text-sm text-gray-500">Enviando...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-600">
                Fazer upload manual
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Clique ou arraste — JPEG, PNG ou WebP (max. 5MB)
              </p>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
