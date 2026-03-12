'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

export function MemberHeader() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-dark-bg/80 px-4 backdrop-blur-sm md:px-8 lg:px-16">
      <span className="text-xl font-bold text-white">Memberly</span>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-neutral-300">{user.full_name}</span>
        )}
        <button
          onClick={handleLogout}
          className="min-h-[44px] min-w-[44px] rounded px-3 text-sm text-neutral-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
