'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

export function AdminHeader() {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        {/* Hamburger (mobile only) */}
        <button
          type="button"
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-700">{user.full_name}</span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
