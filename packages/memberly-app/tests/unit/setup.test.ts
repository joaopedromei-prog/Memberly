import { describe, it, expect } from 'vitest';

describe('Environment Setup', () => {
  it('should run tests in jsdom environment', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });

  it('should have correct Node.js environment', () => {
    expect(typeof process).toBe('object');
  });

  it('should support TypeScript', () => {
    const value: string = 'test';
    expect(value).toBe('test');
  });
});
