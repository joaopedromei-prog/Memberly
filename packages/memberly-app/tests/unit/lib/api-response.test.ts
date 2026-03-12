import { describe, it, expect } from 'vitest';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

describe('apiError', () => {
  it('returns error response with correct structure', async () => {
    const response = apiError('TEST_ERROR', 'Something went wrong', 400);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: { code: 'TEST_ERROR', message: 'Something went wrong' },
    });
  });

  it('includes details when provided', async () => {
    const response = apiError('VALIDATION_ERROR', 'Invalid input', 422, {
      field: 'title',
    });
    const body = await response.json();

    expect(body.error.details).toEqual({ field: 'title' });
  });

  it('excludes details when not provided', async () => {
    const response = apiError('TEST', 'msg', 500);
    const body = await response.json();

    expect(body.error.details).toBeUndefined();
  });
});

describe('apiSuccess', () => {
  it('returns success response with default 200 status', async () => {
    const response = apiSuccess({ id: '1', title: 'Test' });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: '1', title: 'Test' });
  });

  it('returns custom status code', async () => {
    const response = apiSuccess({ created: true }, 201);
    expect(response.status).toBe(201);
  });
});
