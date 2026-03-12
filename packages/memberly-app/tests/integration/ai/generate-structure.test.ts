import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
const mockSingle = vi.fn();
const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) }),
}));

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: { getUser: () => mockGetUser() },
  }),
}));

// Mock Claude client
const mockGenerateStructure = vi.fn();
vi.mock('@/lib/ai/claude-client', () => ({
  generateStructure: (...args: unknown[]) => mockGenerateStructure(...args),
}));

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      status: init?.status ?? 200,
    }),
  },
}));

const validInputs = {
  productName: 'Curso Test',
  topic: 'Tech',
  targetAudience: 'Devs',
  moduleCount: 2,
  tone: 'informal',
};

const mockStructure = {
  product: { title: 'Curso Test', description: 'Desc', bannerSuggestion: 'Banner' },
  modules: [
    {
      title: 'Mod 1',
      description: 'Desc',
      bannerSuggestion: 'Banner',
      lessons: [{ title: 'Aula 1', description: 'Desc', durationMinutes: 15 }],
    },
  ],
};

describe('POST /api/ai/generate-structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { POST } = await import('@/app/api/ai/generate-structure/route');
    const request = new Request('http://localhost/api/ai/generate-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInputs),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(401);
  });

  it('returns 403 when user is not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'member' } });

    const { POST } = await import('@/app/api/ai/generate-structure/route');
    const request = new Request('http://localhost/api/ai/generate-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInputs),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(403);
  });

  it('returns 400 on invalid inputs', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });

    const { POST } = await import('@/app/api/ai/generate-structure/route');
    const request = new Request('http://localhost/api/ai/generate-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName: '' }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });

  it('returns generated structure on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });
    mockGenerateStructure.mockResolvedValue(mockStructure);

    const { POST } = await import('@/app/api/ai/generate-structure/route');
    const request = new Request('http://localhost/api/ai/generate-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInputs),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockStructure);
    expect(mockGenerateStructure).toHaveBeenCalledWith(validInputs);
  });

  it('returns 502 when Claude API fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });
    mockGenerateStructure.mockRejectedValue(new Error('API timeout'));

    const { POST } = await import('@/app/api/ai/generate-structure/route');
    const request = new Request('http://localhost/api/ai/generate-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInputs),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error.code).toBe('AI_GENERATION_ERROR');
  });

  it('returns 400 on invalid JSON body', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });

    const { POST } = await import('@/app/api/ai/generate-structure/route');
    const request = new Request('http://localhost/api/ai/generate-structure', {
      method: 'POST',
      body: 'not-json',
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
