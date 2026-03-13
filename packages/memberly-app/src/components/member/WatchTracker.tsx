'use client';

import { useEffect } from 'react';

interface WatchTrackerProps {
  lessonId: string;
}

/**
 * Fire-and-forget component that tracks lesson access.
 * Calls POST /api/lessons/[id]/watch on mount.
 */
export function WatchTracker({ lessonId }: WatchTrackerProps) {
  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/watch`, { method: 'POST' }).catch(() => {
      // Silently ignore tracking errors
    });
  }, [lessonId]);

  return null;
}
