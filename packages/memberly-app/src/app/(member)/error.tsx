'use client';

import { useEffect } from 'react';

export default function MemberError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Member area error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-xl bg-dark-surface border border-dark-border p-8 max-w-md">
        <h2 className="text-xl font-bold text-white">
          Algo deu errado
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Ocorreu um erro ao carregar esta página. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:scale-95"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
