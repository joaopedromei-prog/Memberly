import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockIn = vi.fn();

const mockMaybeSingle = vi.fn();

const chainReturn: Record<string, ReturnType<typeof vi.fn>> = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  in: mockIn,
};

mockSelect.mockReturnValue(chainReturn);
mockEq.mockReturnValue(chainReturn);
mockInsert.mockReturnValue(chainReturn);
mockUpdate.mockReturnValue(chainReturn);
mockIn.mockReturnValue(chainReturn);

const mockFrom = vi.fn(() => chainReturn);

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      status: init?.status ?? 200,
    }),
  },
}));

describe('Progress API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(chainReturn);
    mockSelect.mockReturnValue(chainReturn);
    mockEq.mockReturnValue(chainReturn);
    mockInsert.mockReturnValue(chainReturn);
    mockUpdate.mockReturnValue(chainReturn);
    mockMaybeSingle.mockReturnValue(chainReturn);
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const { POST } = await import('@/app/api/progress/[lessonId]/route');
    const request = new Request('http://localhost/api/progress/lesson-1', {
      method: 'POST',
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ lessonId: 'lesson-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('returns 404 when lesson not found', async () => {
    // Lesson lookup returns null
    mockSingle.mockResolvedValueOnce({ data: null });

    const { POST } = await import('@/app/api/progress/[lessonId]/route');
    const request = new Request('http://localhost/api/progress/invalid', {
      method: 'POST',
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ lessonId: 'invalid' }),
    });

    expect(response.status).toBe(404);
  });

  it('returns 403 when member has no access to the product', async () => {
    // Lesson exists with module/product
    mockSingle.mockResolvedValueOnce({
      data: { id: 'lesson-1', module: { id: 'mod-1', product_id: 'prod-1' } },
    });
    // Access check returns null (no access) — uses maybeSingle
    mockMaybeSingle.mockResolvedValueOnce({ data: null });

    const { POST } = await import('@/app/api/progress/[lessonId]/route');
    const request = new Request('http://localhost/api/progress/lesson-1', {
      method: 'POST',
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ lessonId: 'lesson-1' }),
    });

    expect(response.status).toBe(403);
  });

  it('creates new progress record when none exists', async () => {
    // Lesson exists with module/product
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'lesson-1', module: { id: 'mod-1', product_id: 'prod-1' } },
      })
      // No existing progress
      .mockResolvedValueOnce({ data: null })
      // Insert result
      .mockResolvedValueOnce({
        data: { id: 'prog-1', completed: true, completed_at: '2026-01-01' },
        error: null,
      });
    // Access check passes — uses maybeSingle
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'access-1' } });

    const { POST } = await import('@/app/api/progress/[lessonId]/route');
    const request = new Request('http://localhost/api/progress/lesson-1', {
      method: 'POST',
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ lessonId: 'lesson-1' }),
    });

    expect(response.status).toBe(201);
  });

  it('toggles existing progress to incomplete', async () => {
    // Lesson exists with module/product
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'lesson-1', module: { id: 'mod-1', product_id: 'prod-1' } },
      })
      // Existing progress is completed
      .mockResolvedValueOnce({ data: { id: 'prog-1', completed: true } })
      // Update result
      .mockResolvedValueOnce({
        data: { id: 'prog-1', completed: false, completed_at: null },
        error: null,
      });
    // Access check passes — uses maybeSingle
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'access-1' } });

    const { POST } = await import('@/app/api/progress/[lessonId]/route');
    const request = new Request('http://localhost/api/progress/lesson-1', {
      method: 'POST',
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ lessonId: 'lesson-1' }),
    });
    const data = await response.json();

    expect(data.completed).toBe(false);
  });

  it('toggles existing progress to complete', async () => {
    // Lesson exists with module/product
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'lesson-1', module: { id: 'mod-1', product_id: 'prod-1' } },
      })
      // Existing progress is NOT completed
      .mockResolvedValueOnce({ data: { id: 'prog-1', completed: false } })
      // Update result
      .mockResolvedValueOnce({
        data: { id: 'prog-1', completed: true, completed_at: '2026-01-01' },
        error: null,
      });
    // Access check passes — uses maybeSingle
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'access-1' } });

    const { POST } = await import('@/app/api/progress/[lessonId]/route');
    const request = new Request('http://localhost/api/progress/lesson-1', {
      method: 'POST',
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ lessonId: 'lesson-1' }),
    });
    const data = await response.json();

    expect(data.completed).toBe(true);
  });
});
