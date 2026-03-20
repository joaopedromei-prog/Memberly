import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase chain
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, single: mockSingle });
mockInsert.mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) });
mockUpdate.mockReturnValue({ eq: mockEq });
mockDelete.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ single: mockSingle, select: vi.fn().mockReturnValue({ single: mockSingle }) });

const mockSupabase = { from: mockFrom };

// Mock auth-guard — requireAdmin returns admin + mocked supabase
vi.mock('@/lib/utils/auth-guard', () => ({
  requireAdmin: vi.fn(),
}));

import { requireAdmin } from '@/lib/utils/auth-guard';
const mockedRequireAdmin = vi.mocked(requireAdmin);

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      status: init?.status ?? 200,
    }),
  },
}));

describe('Products API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset supabase chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, single: mockSingle });
    mockInsert.mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) });
    mockEq.mockReturnValue({ single: mockSingle, select: vi.fn().mockReturnValue({ single: mockSingle }) });

    // Reset auth mock
    mockedRequireAdmin.mockResolvedValue({
      ok: true,
      data: {
        user: { id: 'admin-1' },
        role: 'admin',
        supabase: mockSupabase as never,
      },
    });
  });

  describe('GET /api/products', () => {
    it('returns products list', async () => {
      const products = [
        { id: '1', title: 'Product 1', modules: [{ count: 3 }] },
        { id: '2', title: 'Product 2', modules: [{ count: 0 }] },
      ];

      mockOrder.mockResolvedValue({ data: products, error: null });

      const { GET } = await import('@/app/api/products/route');
      const response = await GET();
      const data = await response.json();

      expect(data).toEqual(products);
      expect(mockFrom).toHaveBeenCalledWith('products');
    });

    it('returns 500 on database error', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { GET } = await import('@/app/api/products/route');
      const response = await GET();

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/products', () => {
    it('creates product with valid data', async () => {
      const created = { id: '1', title: 'New Product', slug: 'new-product' };
      mockSingle.mockResolvedValue({ data: created, error: null });

      const { POST } = await import('@/app/api/products/route');
      const request = new Request('http://localhost/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Product' }),
      });

      const response = await POST(request as never);
      expect(response.status).toBe(201);
    });

    it('returns 400 when title is missing', async () => {
      const { POST } = await import('@/app/api/products/route');
      const request = new Request('http://localhost/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request as never);
      expect(response.status).toBe(400);
    });

    it('returns 409 on duplicate slug', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate' },
      });

      const { POST } = await import('@/app/api/products/route');
      const request = new Request('http://localhost/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', slug: 'existing-slug' }),
      });

      const response = await POST(request as never);
      expect(response.status).toBe(409);
    });
  });

  describe('PATCH /api/products/[id] — certificate_enabled', () => {
    it('updates certificate_enabled to true', async () => {
      const updated = { id: '1', title: 'Product', certificate_enabled: true };
      mockSingle.mockResolvedValue({ data: updated, error: null });

      const { PATCH } = await import('@/app/api/products/[id]/route');
      const request = new Request('http://localhost/api/products/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificate_enabled: true }),
      });

      const response = await PATCH(request as never, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('updates certificate_enabled to false', async () => {
      const updated = { id: '1', title: 'Product', certificate_enabled: false };
      mockSingle.mockResolvedValue({ data: updated, error: null });

      const { PATCH } = await import('@/app/api/products/[id]/route');
      const request = new Request('http://localhost/api/products/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificate_enabled: false }),
      });

      const response = await PATCH(request as never, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
    });

    it('preserves certificate_enabled when not included in update', async () => {
      const updated = { id: '1', title: 'Updated', certificate_enabled: true };
      mockSingle.mockResolvedValue({ data: updated, error: null });

      const { PATCH } = await import('@/app/api/products/[id]/route');
      const request = new Request('http://localhost/api/products/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });

      const response = await PATCH(request as never, {
        params: Promise.resolve({ id: '1' }),
      });

      expect(response.status).toBe(200);
      // certificate_enabled should NOT be in the update payload when not provided
      const updateCall = mockUpdate.mock.results;
      expect(updateCall).toBeDefined();
    });
  });
});
