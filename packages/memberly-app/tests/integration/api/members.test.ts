import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase chain
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockIlike = vi.fn();
const mockIn = vi.fn();
const mockSingle = vi.fn();

const mockFrom = vi.fn();

function resetSupabaseChain() {
  mockRange.mockResolvedValue({
    data: [
      {
        id: 'user-1',
        full_name: 'Test User',
        role: 'member',
        created_at: '2026-01-01',
        member_access: [{ count: 2 }],
      },
    ],
    error: null,
    count: 1,
  });

  mockOrder.mockReturnValue({ range: mockRange });
  mockIlike.mockReturnValue({ order: mockOrder, range: mockRange, in: mockIn });
  mockIn.mockReturnValue({ order: mockOrder, range: mockRange, ilike: mockIlike });
  mockEq.mockReturnValue({
    order: mockOrder,
    range: mockRange,
    eq: mockEq,
    ilike: mockIlike,
    in: mockIn,
    single: mockSingle,
  });
  mockSelect.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
    range: mockRange,
    ilike: mockIlike,
    in: mockIn,
  });

  mockInsert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: { id: 'access-1', profile_id: 'user-1', product_id: 'prod-1' },
        error: null,
      }),
    }),
  });

  mockDelete.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  });

  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    delete: mockDelete,
  });
}

const mockSupabase = { from: mockFrom };

// Mock admin client for POST /api/members
const mockAdminCreateUser = vi.fn();
const mockAdminResetPassword = vi.fn();
const mockAdminUpsert = vi.fn();
const mockAdminInsert = vi.fn();

const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      admin: { createUser: mockAdminCreateUser },
      resetPasswordForEmail: mockAdminResetPassword,
    },
    from: mockAdminFrom,
  }),
}));

// Mock auth-guard
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

describe('Members API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSupabaseChain();

    mockedRequireAdmin.mockResolvedValue({
      ok: true,
      data: {
        user: { id: 'admin-1' },
        role: 'admin',
        supabase: mockSupabase as never,
      },
    });
  });

  describe('GET /api/members', () => {
    it('should parse pagination params correctly', async () => {
      const { GET } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members?page=2&limit=10');
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
    });

    it('should default to page 1 and limit 20', async () => {
      const { GET } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members');
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should cap limit at 100', async () => {
      const { GET } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members?limit=500');
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.limit).toBe(100);
    });
  });

  describe('POST /api/members (create individual)', () => {
    beforeEach(() => {
      mockAdminCreateUser.mockResolvedValue({
        data: { user: { id: 'new-user-1' } },
        error: null,
      });
      mockAdminUpsert.mockResolvedValue({ error: null });
      mockAdminInsert.mockResolvedValue({ error: null });
      mockAdminResetPassword.mockResolvedValue({ error: null });
      mockAdminFrom.mockReturnValue({
        upsert: mockAdminUpsert,
        insert: mockAdminInsert,
      });
    });

    it('should require full_name', async () => {
      const { POST } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com' }),
      });
      const response = await POST(request as never);
      expect(response.status).toBe(400);
    });

    it('should require email', async () => {
      const { POST } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'Test User' }),
      });
      const response = await POST(request as never);
      expect(response.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const { POST } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'Test', email: 'invalid' }),
      });
      const response = await POST(request as never);
      expect(response.status).toBe(400);
    });

    it('should create member successfully', async () => {
      const { POST } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'João Silva', email: 'joao@test.com' }),
      });
      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('new-user-1');
      expect(data.full_name).toBe('João Silva');
      expect(mockAdminCreateUser).toHaveBeenCalled();
      expect(mockAdminResetPassword).toHaveBeenCalled();
    });

    it('should return 409 for duplicate email', async () => {
      mockAdminCreateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already been registered' },
      });
      const { POST } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'Test', email: 'existing@test.com' }),
      });
      const response = await POST(request as never);
      expect(response.status).toBe(409);
    });

    it('should grant product access if product_id provided', async () => {
      const { POST } = await import('@/app/api/members/route');
      const request = new Request('http://localhost/api/members', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'Test', email: 'test@test.com', product_id: 'prod-1' }),
      });
      await POST(request as never);

      expect(mockAdminInsert).toHaveBeenCalledWith({
        profile_id: 'new-user-1',
        product_id: 'prod-1',
        granted_by: 'manual',
      });
    });
  });

  describe('POST /api/members/[id]/access', () => {
    it('should require product_id', async () => {
      const { POST } = await import('@/app/api/members/[id]/access/route');
      const request = new Request('http://localhost/api/members/user-1/access', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request as never, {
        params: Promise.resolve({ id: 'user-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should insert access with granted_by manual', async () => {
      const { POST } = await import('@/app/api/members/[id]/access/route');
      const request = new Request('http://localhost/api/members/user-1/access', {
        method: 'POST',
        body: JSON.stringify({ product_id: 'prod-1' }),
      });

      const response = await POST(request as never, {
        params: Promise.resolve({ id: 'user-1' }),
      });

      expect(response.status).toBe(201);
      expect(mockInsert).toHaveBeenCalledWith({
        profile_id: 'user-1',
        product_id: 'prod-1',
        granted_by: 'manual',
      });
    });
  });

  describe('DELETE /api/members/[id]/access/[productId]', () => {
    it('should delete access successfully', async () => {
      const { DELETE } = await import(
        '@/app/api/members/[id]/access/[productId]/route'
      );
      const request = new Request(
        'http://localhost/api/members/user-1/access/prod-1',
        { method: 'DELETE' }
      );

      const response = await DELETE(request as never, {
        params: Promise.resolve({ id: 'user-1', productId: 'prod-1' }),
      });

      expect(response.status).toBe(200);
    });
  });
});
