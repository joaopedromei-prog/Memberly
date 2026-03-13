'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { SearchOverlay } from '@/components/member/SearchOverlay';

export function MemberHeader() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 px-4 md:px-8 lg:px-16 flex items-center justify-between ${
          scrolled
            ? 'bg-dark-bg/80 backdrop-blur-md border-b border-dark-border'
            : 'bg-transparent'
        }`}
      >
        <span className="text-xl font-bold text-white">Memberly</span>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Buscar conteúdo (Ctrl+K)"
            className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            <Search size={20} />
          </button>
          {user && (
            <span className="text-sm text-neutral-300 hidden sm:block px-2">
              {user.full_name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="p-2 text-sm text-neutral-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            Sair
          </button>
        </div>
      </header>
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
