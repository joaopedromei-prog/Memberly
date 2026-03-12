'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentForm } from '@/components/shared/CommentForm';
import { CommentItem, type CommentData } from '@/components/shared/CommentItem';

interface CommentSectionProps {
  lessonId: string;
}

export function CommentSection({ lessonId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);

  const fetchComments = useCallback(
    async (cursorValue?: string) => {
      const url = new URL(`/api/lessons/${lessonId}/comments`, window.location.origin);
      if (cursorValue) url.searchParams.set('cursor', cursorValue);

      const res = await fetch(url.toString());
      if (!res.ok) return null;
      return res.json();
    },
    [lessonId]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await fetchComments();
      if (cancelled || !data) return;

      setComments(data.comments);
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
      setCount(data.comments.length);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [fetchComments]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);

    const data = await fetchComments(cursor);
    if (data) {
      setComments((prev) => [...prev, ...data.comments]);
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
      setCount((prev) => prev + data.comments.length);
    }

    setLoadingMore(false);
  }

  function handleNewComment(comment: CommentData) {
    setComments((prev) => [{ ...comment, replies: [] }, ...prev]);
    setCount((prev) => prev + 1);
  }

  function handleReplyAdded(parentId: string, reply: CommentData) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold text-white">
        Comentários ({count})
      </h2>

      <CommentForm
        lessonId={lessonId}
        onSuccess={handleNewComment}
      />

      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[#2A2A2A]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-[#2A2A2A]" />
                  <div className="h-3 w-full rounded bg-[#2A2A2A]" />
                  <div className="h-3 w-2/3 rounded bg-[#2A2A2A]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div role="list" className="mt-6 space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              lessonId={lessonId}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="mt-6 text-center text-sm text-[#808080]">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      )}

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="min-h-[44px] rounded border border-[#333333] px-6 py-2 text-sm text-[#B3B3B3] transition-colors hover:bg-[#1F1F1F] hover:text-white disabled:opacity-50"
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais comentários'}
          </button>
        </div>
      )}
    </section>
  );
}
