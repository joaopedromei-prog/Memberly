'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  lesson_id: string;
  lesson_title: string;
  module_title: string;
  product_title: string;
  product_slug: string;
  duration_minutes: number | null;
}

interface SearchOverlayProps {
  onClose: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);

  // Autofocus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Search on debounced query change
  useEffect(() => {
    let cancelled = false;

    if (debouncedQuery.length < 2) {
      queueMicrotask(() => { if (!cancelled) setResults([]); });
      return () => { cancelled = true; };
    }

    queueMicrotask(() => { if (!cancelled) setLoading(true); });

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setActiveIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const navigate = useCallback(
    (result: SearchResult) => {
      router.push(`/products/${result.product_slug}/lessons/${result.lesson_id}`);
      onClose();
    },
    [router, onClose]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-dark-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-neutral-700 px-4 py-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-neutral-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aulas e módulos..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <kbd className="hidden rounded border border-neutral-700 px-1.5 py-0.5 text-xs text-neutral-500 sm:inline">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="px-4 py-6 text-center text-sm text-neutral-500">
              Buscando...
            </div>
          )}

          {!loading && debouncedQuery.length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-neutral-500">
              Nenhum resultado para &ldquo;{debouncedQuery}&rdquo;
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul role="listbox">
              {results.map((result, index) => (
                <li
                  key={result.lesson_id}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    index === activeIndex
                      ? 'bg-primary/20 text-white'
                      : 'text-neutral-300 hover:bg-dark-card'
                  }`}
                  onClick={() => navigate(result)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-neutral-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">{result.lesson_title}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {result.module_title} &middot; {result.product_title}
                    </p>
                  </div>
                  {result.duration_minutes && (
                    <span className="flex-shrink-0 text-xs text-neutral-600">
                      {result.duration_minutes} min
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
