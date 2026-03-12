'use client';

import { useState, useRef } from 'react';
import { useToastStore } from '@/stores/toast-store';
import type { CommentData } from '@/components/shared/CommentItem';

interface CommentFormProps {
  lessonId: string;
  parentId?: string;
  onSuccess: (comment: CommentData) => void;
  onCancel?: () => void;
  isReply?: boolean;
}

const MAX_CHARS = 2000;
const WARN_CHARS = 1800;

export function CommentForm({
  lessonId,
  parentId,
  onSuccess,
  onCancel,
  isReply = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  const trimmed = content.trim();
  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > WARN_CHARS;
  const canSubmit = trimmed.length > 0 && !isOverLimit && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          ...(parentId && { parent_id: parentId }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Erro ao enviar comentário');
      }

      const comment = await res.json();
      setContent('');
      onSuccess(comment);
      textareaRef.current?.focus();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Erro ao enviar comentário',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={`comment-${parentId || 'new'}`} className="sr-only">
        {isReply ? 'Escreva sua resposta' : 'Escreva seu comentário'}
      </label>
      <textarea
        ref={textareaRef}
        id={`comment-${parentId || 'new'}`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReply ? 'Escreva sua resposta...' : 'Escreva sua dúvida...'}
        className={`w-full resize-none rounded border bg-[#1F1F1F] px-3 py-2 text-base text-white placeholder-[#B3B3B3] transition-colors focus:border-[#E50914] focus:outline-none ${
          isOverLimit ? 'border-red-500' : 'border-[#333333]'
        } ${isReply ? 'min-h-[60px]' : 'min-h-[60px] sm:min-h-[60px]'}`}
        style={{ minHeight: isReply ? undefined : undefined }}
        disabled={submitting}
      />

      <div className="mt-2 flex items-center justify-between">
        {/* Character counter */}
        <span
          aria-live="polite"
          className={`text-sm ${
            isOverLimit
              ? 'font-semibold text-red-500'
              : isNearLimit
                ? 'text-yellow-500'
                : 'text-[#808080]'
          }`}
        >
          {charCount}/{MAX_CHARS}
        </span>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] rounded px-4 py-2 text-sm text-[#B3B3B3] transition-colors hover:text-white"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Enviar comentário"
            className="min-h-[44px] rounded bg-[#E50914] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B2070F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </form>
  );
}
