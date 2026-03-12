'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  onError?: (message: string) => void;
}

export function ImageUpload({ value, onChange, onError }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          onError?.(data.error?.message ?? 'Erro ao fazer upload');
          return;
        }

        onChange(data.url);
      } catch {
        onError?.('Erro ao fazer upload da imagem');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onError]
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

  return (
    <div>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Banner preview"
            className="h-40 w-full rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
          >
            Remover
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <p className="text-sm text-gray-500">Enviando...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-600">
                Clique ou arraste uma imagem
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPEG, PNG ou WebP (max. 5MB)
              </p>
            </>
          )}
        </label>
      )}
    </div>
  );
}
