'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface PdfUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function PdfUpload({ value, onChange }: PdfUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('O arquivo deve ser um PDF');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 20MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'pdfs');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Erro ao fazer upload');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <svg className="h-6 w-6 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12a2 2 0 002-2V6l-4-4H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="flex-1 truncate text-sm text-gray-700">
            {fileName || 'PDF anexado'}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Remover
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <Button
            type="button"
            variant="outline"
            isLoading={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? 'Enviando...' : 'Selecionar PDF'}
          </Button>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
