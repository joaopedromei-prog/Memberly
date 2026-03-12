import { describe, it, expect } from 'vitest';
import { calculatePercent } from '@/lib/utils/progress';

describe('calculatePercent', () => {
  it('returns 0 when total is 0', () => {
    expect(calculatePercent(0, 0)).toBe(0);
  });

  it('returns 0 when nothing completed', () => {
    expect(calculatePercent(0, 10)).toBe(0);
  });

  it('returns 100 when all completed', () => {
    expect(calculatePercent(10, 10)).toBe(100);
  });

  it('calculates correct percentage', () => {
    expect(calculatePercent(3, 10)).toBe(30);
  });

  it('rounds to nearest integer', () => {
    expect(calculatePercent(1, 3)).toBe(33);
    expect(calculatePercent(2, 3)).toBe(67);
  });

  it('handles single lesson', () => {
    expect(calculatePercent(1, 1)).toBe(100);
    expect(calculatePercent(0, 1)).toBe(0);
  });
});
