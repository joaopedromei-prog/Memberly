'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PdfViewerProps {
  pdfUrl: string;
}

export function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [showModal, setShowModal] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    setShowModal(false);
    triggerRef.current?.focus();
  }, []);

  // Escape key handler + focus trap
  useEffect(() => {
    if (!showModal) return;

    // Focus close button on open
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, closeModal]);

  return (
    <>
      <div className="flex gap-2">
        <button
          ref={triggerRef}
          onClick={() => setShowModal(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded border border-dark-border bg-dark-surface px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-dark-card hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Material da Aula (PDF)
        </button>
        <a
          href={pdfUrl}
          download
          className="inline-flex min-h-[44px] items-center gap-2 rounded border border-dark-border bg-dark-surface px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-dark-card hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar
        </a>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar PDF"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div ref={modalRef} className="relative h-full w-full max-w-5xl lg:h-[90vh] lg:w-[80%]">
            <button
              ref={closeButtonRef}
              onClick={closeModal}
              className="absolute -top-10 right-0 min-h-[44px] min-w-[44px] rounded bg-dark-surface px-3 py-1 text-sm text-white hover:bg-dark-card"
              aria-label="Fechar PDF"
            >
              ✕ Fechar
            </button>
            <iframe
              src={pdfUrl}
              className="h-full w-full rounded-lg"
              title="Material da Aula"
            />
          </div>
        </div>
      )}
    </>
  );
}
