'use client';

import { useState, useRef, useEffect } from 'react';

interface InlineEditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  as?: 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function InlineEditableField({
  value,
  onChange,
  as: Tag = 'span',
  className = '',
  inputClassName = '',
  placeholder = 'Clique para editar',
  multiline = false,
}: InlineEditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    const trimmed = localValue.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setLocalValue(value);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setEditing(false);
    }
  }

  if (editing) {
    const sharedProps = {
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setLocalValue(e.target.value),
      onBlur: commit,
      onKeyDown: handleKeyDown,
      className: `w-full rounded border-2 border-blue-500 bg-white px-2 py-1 outline-none ${inputClassName}`,
      placeholder,
    };

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={3}
          {...sharedProps}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        {...sharedProps}
      />
    );
  }

  return (
    <Tag
      onClick={() => setEditing(true)}
      className={`cursor-pointer rounded px-2 py-0.5 transition-colors hover:bg-blue-50 hover:ring-1 hover:ring-blue-200 ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setEditing(true);
        }
      }}
      title="Clique para editar"
    >
      {value || <span className="italic text-gray-400">{placeholder}</span>}
    </Tag>
  );
}
