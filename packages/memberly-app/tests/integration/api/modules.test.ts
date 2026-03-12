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

describe('Modules API Routes', () => {
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

  describe('GET /api/products/[id]/modules', () => {
    it('returns modules list ordered by sort_order', async () => {
      const modules = [
        { id: '1', title: 'Module 1', sort_order: 0, lessons: [{ count: 3 }] },
        { id: '2', title: 'Module 2', sort_order: 1, lessons: [{ count: 0 }] },
      ];

      mockOrder.mockResolvedValueOnce({ data: modules, error: null });

      const { GET } = await import('@/app/api/products/[id]/modules/route');
      const request = new Request('http://localhost/api/products/prod-1/modules');
      const response = await GET(request as never, {
        params: Promise.resolve({ id: 'prod-1' }),
      });
      const data = await response.json();

      expect(data).toEqual(modules);
      expect(mockFrom).toHaveBeenCalledWith('modules');
    });
  });

  describe('POST /api/products/[id]/modules', () => {
    it('creates module with valid title', async () => {
      // Mock getting next sort_order
      mockLimit.mockResolvedValueOnce({ data: [{ sort_order: 2 }], error: null });
      // Mock insert
      const created = { id: '1', title: 'New Module', sort_order: 3 };
      mockSingle.mockResolvedValueOnce({ data: created, error: null });

      const { POST } = await import('@/app/api/products/[id]/modules/route');
      const request = new Request('http://localhost/api/products/prod-1/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Module' }),
      });

      const response = await POST(request as never, {
        params: Promise.resolve({ id: 'prod-1' }),
      });
      expect(response.status).toBe(201);
    });

    it('returns 400 when title is missing', async () => {
      const { POST } = await import('@/app/api/products/[id]/modules/route');
      const request = new Request('http://localhost/api/products/prod-1/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request as never, {
        params: Promise.resolve({ id: 'prod-1' }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/modules/[id]', () => {
    it('updates module with valid data', async () => {
      const updated = { id: 'mod-1', title: 'Updated' };
      mockSingle.mockResolvedValueOnce({ data: updated, error: null });

      const { PATCH } = await import('@/app/api/modules/[id]/route');
      const request = new Request('http://localhost/api/modules/mod-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });

      const response = await PATCH(request as never, {
        params: Promise.resolve({ id: 'mod-1' }),
      });
      const data = await response.json();

      expect(data).toEqual(updated);
    });

    it('returns 400 when no fields to update', async () => {
      const { PATCH } = await import('@/app/api/modules/[id]/route');
      const request = new Request('http://localhost/api/modules/mod-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await PATCH(request as never, {
        params: Promise.resolve({ id: 'mod-1' }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/modules/[id]', () => {
    it('deletes module successfully', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { DELETE } = await import('@/app/api/modules/[id]/route');
      const request = new Request('http://localhost/api/modules/mod-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request as never, {
        params: Promise.resolve({ id: 'mod-1' }),
      });
      const data = await response.json();

      expect(data).toEqual({ deleted: true });
    });
  });

  describe('PATCH /api/products/[id]/modules/reorder', () => {
    it('reorders modules', async () => {
      mockEq.mockResolvedValue({ error: null });

      const { PATCH } = await import(
        '@/app/api/products/[id]/modules/reorder/route'
      );
      const request = new Request(
        'http://localhost/api/products/prod-1/modules/reorder',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              { id: 'mod-2', sort_order: 0 },
              { id: 'mod-1', sort_order: 1 },
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
        '@/app/api/products/[id]/modules/reorder/route'
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
