import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from '@/hooks/useProgress';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('useProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ completed: true }),
    });
  });

  it('initializes with empty completed set', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.completedLessons.size).toBe(0);
  });

  it('initCompleted sets initial completed lessons', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.initCompleted(['l1', 'l2']);
    });

    expect(result.current.isCompleted('l1')).toBe(true);
    expect(result.current.isCompleted('l2')).toBe(true);
    expect(result.current.isCompleted('l3')).toBe(false);
  });

  it('toggleLessonComplete marks lesson as completed optimistically', async () => {
    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.toggleLessonComplete('l1');
    });

    expect(result.current.isCompleted('l1')).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('/api/progress/l1', {
      method: 'POST',
    });
  });

  it('toggleLessonComplete unmarks completed lesson', async () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.initCompleted(['l1']);
    });

    await act(async () => {
      await result.current.toggleLessonComplete('l1');
    });

    expect(result.current.isCompleted('l1')).toBe(false);
  });

  it('rolls back on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.toggleLessonComplete('l1');
    });

    // Should rollback — not completed
    expect(result.current.isCompleted('l1')).toBe(false);
  });

  it('calls onProgressChange callback on success', async () => {
    const onProgressChange = vi.fn();
    const { result } = renderHook(() =>
      useProgress({ onProgressChange })
    );

    await act(async () => {
      await result.current.toggleLessonComplete('l1');
    });

    expect(onProgressChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onProgressChange on error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const onProgressChange = vi.fn();
    const { result } = renderHook(() =>
      useProgress({ onProgressChange })
    );

    await act(async () => {
      await result.current.toggleLessonComplete('l1');
    });

    expect(onProgressChange).not.toHaveBeenCalled();
  });
});
