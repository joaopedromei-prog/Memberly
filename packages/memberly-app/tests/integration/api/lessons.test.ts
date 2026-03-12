import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

const chainReturn = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
  order: mockOrder,
  limit: mockLimit,
};

// Make chainable
mockSelect.mockReturnValue(chainReturn);
mockEq.mockReturnValue(chainReturn);
mockOrder.mockReturnValue(chainReturn);
mockInsert.mockReturnValue(chainReturn);
mockUpdate.mockReturnValue(chainReturn);
mockDelete.mockReturnValue(chainReturn);
mockLimit.mockReturnValue(chainReturn);

const mockFrom = vi.fn(() => chainReturn);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    from: mockFrom,
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

describe('Lessons API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(chainReturn);
    mockSelect.mockReturnValue(chainReturn);
    mockEq.mockReturnValue(chainReturn);
    mockOrder.mockReturnValue(chainReturn);
    mockInsert.mockReturnValue(chainReturn);
    mockUpdate.mockReturnValue(chainReturn);
    mockDelete.mockReturnValue(chainReturn);
    mockLimit.mockReturnValue(chainReturn);
  });

  describe('GET /api/modules/[id]/lessons', () => {
    it('returns lessons list ordered by sort_order', async () => {
      const lessons = [
        { id: '1', title: 'Lesson 1', sort_order: 0, video_provider: 'youtube' },
        { id: '2', title: 'Lesson 2', sort_order: 1, video_provider: 'pandavideo' },
      ];

      mockOrder.mockResolvedValueOnce({ data: lessons, error: null });

      const { GET } = await import('@/app/api/modules/[id]/lessons/route');
      const request = new Request('http://localhost/api/modules/mod-1/lessons');
      const response = await GET(request as never, {
        params: Promise.resolve({ id: 'mod-1' }),
      });
      const data = await response.json();

      expect(data).toEqual(lessons);
      expect(mockFrom).toHaveBeenCalledWith('lessons');
    });
  });

  describe('POST /api/modules/[id]/lessons', () => {
    it('creates lesson with valid title', async () => {
      // Mock getting next sort_order
      mockLimit.mockResolvedValueOnce({ data: [{ sort_order: 2 }], error: null });
      // Mock insert
      const created = { id: '1', title: 'New Lesson', sort_order: 3 };
      mockSingle.mockResolvedValueOnce({ data: created, error: null });

      const { POST } = await import('@/app/api/modules/[id]/lessons/route');
      const request = new Request('http://localhost/api/modules/mod-1/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Lesson', video_provider: 'youtube' }),
      });

      const response = await POST(request as never, {
        params: Promise.resolve({ id: 'mod-1' }),
      });
      expect(response.status).toBe(201);
    });

    it('returns 400 when title is missing', async () => {
      const { POST } = await import('@/app/api/modules/[id]/lessons/route');
      const request = new Request('http://localhost/api/modules/mod-1/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request as never, {
        params: Promise.resolve({ id: 'mod-1' }),
      });
      expect(response.status).toBe(400);
    });

    it('returns 400 when video_provider is invalid', async () => {
      const { POST } = await import('@/app/api/modules/[id]/lessons/route');
      const request = new Request('http://localhost/api/modules/mod-1/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', video_provider: 'vimeo' }),
      });

      const response = await POST(request as never, {
        params: Promise.resolve({ id: 'mod-1' }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/lessons/[id]', () => {
    it('updates lesson with valid data', async () => {
      const updated = { id: 'lesson-1', title: 'Updated' };
      mockSingle.mockResolvedValueOnce({ data: updated, error: null });

      const { PATCH } = await import('@/app/api/lessons/[id]/route');
      const request = new Request('http://localhost/api/lessons/lesson-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });

      const response = await PATCH(request as never, {
        params: Promise.resolve({ id: 'lesson-1' }),
      });
      const data = await response.json();

      expect(data).toEqual(updated);
    });

    it('returns 400 when no fields to update', async () => {
      const { PATCH } = await import('@/app/api/lessons/[id]/route');
      const request = new Request('http://localhost/api/lessons/lesson-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await PATCH(request as never, {
        params: Promise.resolve({ id: 'lesson-1' }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/lessons/[id]', () => {
    it('deletes lesson successfully', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { DELETE } = await import('@/app/api/lessons/[id]/route');
      const request = new Request('http://localhost/api/lessons/lesson-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request as never, {
        params: Promise.resolve({ id: 'lesson-1' }),
      });
      const data = await response.json();

      expect(data).toEqual({ deleted: true });
    });
  });

  describe('PATCH /api/modules/[id]/lessons/reorder', () => {
    it('reorders lessons', async () => {
      mockEq.mockResolvedValue({ error: null });

      const { PATCH } = await import(
        '@/app/api/modules/[id]/lessons/reorder/route'
      );
      const request = new Request(
        'http://localhost/api/modules/mod-1/lessons/reorder',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              { id: 'lesson-2', sort_order: 0 },
              { id: 'lesson-1', sort_order: 1 },
            ],
          }),
        }
      );

      const response = await PATCH(request as never);
      const data = await response.json();

      expect(data).toEqual({ reordered: true });
    });

    it('returns 400 when items is empty', async () => {
      const { PATCH } = await import(
        '@/app/api/modules/[id]/lessons/reorder/route'
      );
      const request = new Request('http://localhost', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }),
      });

      const response = await PATCH(request as never);
      expect(response.status).toBe(400);
    });
  });
});
