import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatRelativeDate } from '@/lib/utils/format';

describe('formatRelativeDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "agora" for dates less than 1 minute ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-11T12:00:30Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('agora');
  });

  it('returns "há 1 minuto" for 1 minute ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-11T12:01:00Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('há 1 minuto');
  });

  it('returns "há 5 minutos" for 5 minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-11T12:05:00Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('há 5 minutos');
  });

  it('returns "há 1 hora" for 1 hour ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-11T13:00:00Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('há 1 hora');
  });

  it('returns "há 3 horas" for 3 hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-11T15:00:00Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('há 3 horas');
  });

  it('returns "há 1 dia" for 1 day ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T12:00:00Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('há 1 dia');
  });

  it('returns "há 3 dias" for 3 days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-14T12:00:00Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('há 3 dias');
  });

  it('returns "há 1 semana" for 7 days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('há 1 semana');
  });

  it('returns "há 2 semanas" for 14 days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-25T12:00:00Z'));
    expect(formatRelativeDate('2026-03-11T12:00:00Z')).toBe('há 2 semanas');
  });

  it('returns formatted date for > 30 days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    const result = formatRelativeDate('2026-03-11T12:00:00Z');
    expect(result).toMatch(/11\/03\/2026/);
  });
});
