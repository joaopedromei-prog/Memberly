import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteFn = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

function buildChain() {
  const chain = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDeleteFn,
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
  };
  // Each method returns the chain for chaining
  mockSelect.mockReturnValue(chain);
  mockInsert.mockReturnValue(chain);
  mockUpdate.mockReturnValue(chain);
  mockDeleteFn.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockSingle.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  return chain;
}

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

// Mock auth-guard
vi.mock('@/lib/utils/auth-guard', () => ({
  requireAdmin: vi.fn(),
}));

// Mock supabase server
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => mockSupabase),
}));

import { requireAdmin } from '@/lib/utils/auth-guard';
const mockedRequireAdmin = vi.mocked(requireAdmin);

function mockAdminAuth() {
  mockedRequireAdmin.mockResolvedValue({
    ok: true,
    data: {
      user: { id: 'admin-1' },
      role: 'admin',
      supabase: mockSupabase as never,
    },
  });
}

function mockForbidden() {
  mockedRequireAdmin.mockResolvedValue({
    ok: false,
    response: new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }), { status: 403 }),
  });
}

// --- Test helpers ---

const sampleBadge = {
  id: 'badge-1',
  name: 'First Lesson',
  description: 'Complete your first lesson',
  icon_url: null,
  criteria: { type: 'FIRST_LESSON', threshold: 1 },
  active: true,
  created_at: '2026-03-20T00:00:00Z',
  updated_at: '2026-03-20T00:00:00Z',
};

// --- Tests ---

describe('GET /api/admin/badges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildChain();
  });

  it('returns 403 without admin role', async () => {
    mockForbidden();

    const { GET } = await import('@/app/api/admin/badges/route');
    const response = await GET();

    expect(response.status).toBe(403);
  });

  it('returns badges list', async () => {
    mockAdminAuth();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [sampleBadge], error: null }),
      }),
    });

    const { GET } = await import('@/app/api/admin/badges/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([sampleBadge]);
  });

  it('returns 500 on database error', async () => {
    mockAdminAuth();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    });

    const { GET } = await import('@/app/api/admin/badges/route');
    const response = await GET();

    expect(response.status).toBe(500);
  });
});

describe('POST /api/admin/badges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildChain();
  });

  it('returns 403 without admin role', async () => {
    mockForbidden();

    const { POST } = await import('@/app/api/admin/badges/route');
    const request = new Request('http://localhost/api/admin/badges', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request as never);

    expect(response.status).toBe(403);
  });

  it('returns 400 when name is missing', async () => {
    mockAdminAuth();

    const { POST } = await import('@/app/api/admin/badges/route');
    const request = new Request('http://localhost/api/admin/badges', {
      method: 'POST',
      body: JSON.stringify({ criteria_type: 'FIRST_LESSON' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when criteria_type is missing', async () => {
    mockAdminAuth();

    const { POST } = await import('@/app/api/admin/badges/route');
    const request = new Request('http://localhost/api/admin/badges', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Badge' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid criteria_type', async () => {
    mockAdminAuth();

    const { POST } = await import('@/app/api/admin/badges/route');
    const request = new Request('http://localhost/api/admin/badges', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', criteria_type: 'INVALID' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toContain('Invalid criteria type');
  });

  it('creates badge successfully', async () => {
    mockAdminAuth();
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: sampleBadge, error: null }),
        }),
      }),
    });

    const { POST } = await import('@/app/api/admin/badges/route');
    const request = new Request('http://localhost/api/admin/badges', {
      method: 'POST',
      body: JSON.stringify({
        name: 'First Lesson',
        description: 'Complete your first lesson',
        criteria_type: 'FIRST_LESSON',
        threshold: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.name).toBe('First Lesson');
  });
});

describe('PATCH /api/admin/badges/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildChain();
  });

  it('returns 403 without admin role', async () => {
    mockForbidden();

    const { PATCH } = await import('@/app/api/admin/badges/[id]/route');
    const request = new Request('http://localhost/api/admin/badges/badge-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PATCH(request as never, { params: Promise.resolve({ id: 'badge-1' }) });

    expect(response.status).toBe(403);
  });

  it('returns 400 when no fields to update', async () => {
    mockAdminAuth();

    const { PATCH } = await import('@/app/api/admin/badges/[id]/route');
    const request = new Request('http://localhost/api/admin/badges/badge-1', {
      method: 'PATCH',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PATCH(request as never, { params: Promise.resolve({ id: 'badge-1' }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('updates badge name successfully', async () => {
    mockAdminAuth();
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...sampleBadge, name: 'Updated Badge' },
              error: null,
            }),
          }),
        }),
      }),
    });

    const { PATCH } = await import('@/app/api/admin/badges/[id]/route');
    const request = new Request('http://localhost/api/admin/badges/badge-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Badge' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PATCH(request as never, { params: Promise.resolve({ id: 'badge-1' }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe('Updated Badge');
  });

  it('updates badge active status (toggle)', async () => {
    mockAdminAuth();
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...sampleBadge, active: false },
              error: null,
            }),
          }),
        }),
      }),
    });

    const { PATCH } = await import('@/app/api/admin/badges/[id]/route');
    const request = new Request('http://localhost/api/admin/badges/badge-1', {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await PATCH(request as never, { params: Promise.resolve({ id: 'badge-1' }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.active).toBe(false);
  });
});

describe('DELETE /api/admin/badges/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildChain();
  });

  it('returns 403 without admin role', async () => {
    mockForbidden();

    const { DELETE } = await import('@/app/api/admin/badges/[id]/route');
    const request = new Request('http://localhost/api/admin/badges/badge-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request as never, { params: Promise.resolve({ id: 'badge-1' }) });

    expect(response.status).toBe(403);
  });

  it('deletes badge successfully', async () => {
    mockAdminAuth();

    // member_badges count
    const countChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 2 }),
      }),
    };
    // badges delete
    const deleteChain = {
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    };

    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'member_badges') return countChain;
      if (table === 'badges') return deleteChain;
      callCount++;
      return deleteChain;
    });

    const { DELETE } = await import('@/app/api/admin/badges/[id]/route');
    const request = new Request('http://localhost/api/admin/badges/badge-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request as never, { params: Promise.resolve({ id: 'badge-1' }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.deleted).toBe(true);
    expect(body.members_affected).toBe(2);
  });

  it('returns 500 on database error', async () => {
    mockAdminAuth();

    const countChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 0 }),
      }),
    };
    const deleteChain = {
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'member_badges') return countChain;
      return deleteChain;
    });

    const { DELETE } = await import('@/app/api/admin/badges/[id]/route');
    const request = new Request('http://localhost/api/admin/badges/badge-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request as never, { params: Promise.resolve({ id: 'badge-1' }) });

    expect(response.status).toBe(500);
  });
});
