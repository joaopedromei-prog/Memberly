'use client';

import { useState } from 'react';
import { useToastStore } from '@/stores/toast-store';

interface CertificateDownloadButtonProps {
  productId: string;
  productSlug: string;
  isComplete: boolean;
  certificateEnabled: boolean;
  completedLessons: number;
  totalLessons: number;
  isPreview?: boolean;
}

export function CertificateDownloadButton({
  productId,
  isComplete,
  certificateEnabled,
  totalLessons,
  isPreview = false,
}: CertificateDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  // Don't render if product has no published lessons
  if (totalLessons === 0) return null;

  // Don't render if certificates are disabled for this product
  if (!certificateEnabled) return null;

  // Don't render if member hasn't completed all lessons
  if (!isComplete) return null;

  const handleDownload = async () => {
    if (isPreview) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Erro ao gerar certificado');
      }

      // Trigger download
      window.open(data.certificate.certificate_url, '_blank');
    } catch {
      addToast('Erro ao gerar certificado. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading || isPreview}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold px-6 h-11 w-full sm:w-auto transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-primary/20 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      {isLoading ? (
        <>
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Gerando certificado...</span>
        </>
      ) : (
        <>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <span>
            Baixar Certificado{isPreview ? ' (Preview)' : ''}
          </span>
        </>
      )}
    </button>
  );
}
