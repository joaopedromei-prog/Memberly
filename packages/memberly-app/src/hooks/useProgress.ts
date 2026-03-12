'use client';

import { useState, useCallback } from 'react';

interface UseProgressOptions {
  onProgressChange?: () => void;
}

export function useProgress(options?: UseProgressOptions) {
  const [loadingLessons, setLoadingLessons] = useState<Set<string>>(
    new Set()
  );
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );

  const initCompleted = useCallback((lessonIds: string[]) => {
    setCompletedLessons(new Set(lessonIds));
  }, []);

  const isCompleted = useCallback(
    (lessonId: string) => completedLessons.has(lessonId),
    [completedLessons]
  );

  const isLoading = useCallback(
    (lessonId: string) => loadingLessons.has(lessonId),
    [loadingLessons]
  );

  const toggleLessonComplete = useCallback(
    async (lessonId: string) => {
      const wasCompleted = completedLessons.has(lessonId);

      // Optimistic update
      setCompletedLessons((prev) => {
        const next = new Set(prev);
        if (wasCompleted) {
          next.delete(lessonId);
        } else {
          next.add(lessonId);
        }
        return next;
      });

      setLoadingLessons((prev) => new Set(prev).add(lessonId));

      try {
        const response = await fetch(`/api/progress/${lessonId}`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to update progress');
        }

        options?.onProgressChange?.();
      } catch {
        // Rollback optimistic update
        setCompletedLessons((prev) => {
          const next = new Set(prev);
          if (wasCompleted) {
            next.add(lessonId);
          } else {
            next.delete(lessonId);
          }
          return next;
        });
      } finally {
        setLoadingLessons((prev) => {
          const next = new Set(prev);
          next.delete(lessonId);
          return next;
        });
      }
    },
    [completedLessons, options]
  );

  return {
    completedLessons,
    initCompleted,
    isCompleted,
    isLoading,
    toggleLessonComplete,
  };
}
