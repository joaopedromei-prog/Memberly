import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, ApiRequestError } from '@/lib/utils/api';

describe('apiRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns data on successful request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1', title: 'Test' }),
      })
    );

    const result = await apiRequest<{ id: string; title: string }>('/api/test');
    expect(result).toEqual({ id: '1', title: 'Test' });
  });

  it('throws ApiRequestError on error response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: { code: 'VALIDATION_ERROR', message: 'Title is required' },
          }),
      })
    );

    await expect(apiRequest('/api/test')).rejects.toThrow(ApiRequestError);

    try {
      await apiRequest('/api/test');
    } catch (err) {
      const error = err as ApiRequestError;
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Title is required');
      expect(error.status).toBe(400);
    }
  });

  it('handles unknown error format gracefully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    );

    try {
      await apiRequest('/api/test');
    } catch (err) {
      const error = err as ApiRequestError;
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.status).toBe(500);
    }
  });

  it('sets Content-Type header to JSON by default', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    await apiRequest('/api/test');

    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      headers: { 'Content-Type': 'application/json' },
    });
  });
});

describe('ApiRequestError', () => {
  it('has correct properties', () => {
    const error = new ApiRequestError('TEST_CODE', 'Test message', 422, {
      field: 'title',
    });

    expect(error.name).toBe('ApiRequestError');
    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.status).toBe(422);
    expect(error.details).toEqual({ field: 'title' });
    expect(error instanceof Error).toBe(true);
  });
});
