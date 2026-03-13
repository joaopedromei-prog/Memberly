'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin area error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-xl bg-white border border-slate-200 p-8 max-w-md shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Erro no painel
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Ocorreu um erro ao carregar o dashboard. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
