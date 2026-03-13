'use client';

import { useState, useEffect } from 'react';
import { getDripCountdown } from '@/lib/utils/drip';

interface DripCountdownToastProps {
  grantedAt: string;
  dripDays: number;
  onClose: () => void;
}

export function DripCountdownToast({
  grantedAt,
  dripDays,
  onClose,
}: DripCountdownToastProps) {
  const [countdown, setCountdown] = useState(() =>
    getDripCountdown(grantedAt, dripDays)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getDripCountdown(grantedAt, dripDays));
    }, 60_000);
    return () => clearInterval(interval);
  }, [grantedAt, dripDays]);

  const parts: string[] = [];
  if (countdown.days > 0) parts.push(`${countdown.days} dia${countdown.days !== 1 ? 's' : ''}`);
  if (countdown.hours > 0) parts.push(`${countdown.hours} hora${countdown.hours !== 1 ? 's' : ''}`);
  parts.push(`${countdown.minutes} minuto${countdown.minutes !== 1 ? 's' : ''}`);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-neutral-700 bg-dark-surface p-4 shadow-lg">
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">Conteúdo bloqueado</p>
        <p className="mt-1 text-xs text-neutral-400">
          Este conteúdo estará disponível em {parts.join(', ')}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="flex-shrink-0 rounded p-1 text-neutral-500 hover:text-neutral-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
