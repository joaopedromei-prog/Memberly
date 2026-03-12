import { describe, it, expect } from 'vitest';
import { findNextLesson } from '@/lib/utils/continue-watching';

describe('findNextLesson', () => {
  const lessons = [
    { id: 'l1', title: 'Lesson 1' },
    { id: 'l2', title: 'Lesson 2' },
    { id: 'l3', title: 'Lesson 3' },
  ];

  it('returns first uncompleted lesson', () => {
    const completed = new Set(['l1']);
    const result = findNextLesson(lessons, completed);
    expect(result).toEqual({ id: 'l2', title: 'Lesson 2' });
  });

  it('returns first lesson when none completed', () => {
    const completed = new Set<string>();
    const result = findNextLesson(lessons, completed);
    expect(result).toEqual({ id: 'l1', title: 'Lesson 1' });
  });

  it('returns null when all completed', () => {
    const completed = new Set(['l1', 'l2', 'l3']);
    const result = findNextLesson(lessons, completed);
    expect(result).toBeNull();
  });

  it('returns null for empty lessons array', () => {
    const result = findNextLesson([], new Set());
    expect(result).toBeNull();
  });

  it('skips completed lessons in order', () => {
    const completed = new Set(['l1', 'l2']);
    const result = findNextLesson(lessons, completed);
    expect(result).toEqual({ id: 'l3', title: 'Lesson 3' });
  });
});
