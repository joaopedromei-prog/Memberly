'use client';

import Link from 'next/link';

interface PreviewBannerProps {
  adminUrl: string;
}

export function PreviewBanner({ adminUrl }: PreviewBannerProps) {
  return (
    <div className="fixed left-0 right-0 top-0 z-[9999] flex h-11 items-center justify-between bg-amber-400 px-4 text-sm font-medium text-amber-950 shadow-md">
      <span>Modo Preview — Visualizando como membro</span>
      <Link
        href={adminUrl}
        className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
      >
        Voltar ao Admin
      </Link>
    </div>
  );
}
