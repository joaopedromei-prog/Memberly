'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils/cn';

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

export function SearchInput({
  value: controlledValue,
  onChange,
  placeholder = 'Buscar...',
  className,
  delay = 300,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(controlledValue ?? '');
  const debouncedValue = useDebounce(inputValue, delay);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== inputValue) {
      setInputValue(controlledValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue]);

  return (
    <div className={cn('relative', className)}>
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => setInputValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Limpar busca"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
