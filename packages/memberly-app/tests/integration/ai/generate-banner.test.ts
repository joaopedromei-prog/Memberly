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

// Mock Gemini client
const mockGenerateBanner = vi.fn();
vi.mock('@/lib/ai/gemini-client', () => ({
  generateBanner: (...args: unknown[]) => mockGenerateBanner(...args),
}));

// Mock banner upload
const mockUploadBanner = vi.fn();
vi.mock('@/lib/storage/banner-upload', () => ({
  uploadBannerFromBase64: (...args: unknown[]) => mockUploadBanner(...args),
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

describe('POST /api/ai/generate-banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    description: 'A professional banner for marketing course',
    entityType: 'product',
    entityName: 'Marketing Course',
    productSlug: 'marketing-course',
    index: 0,
  };

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { POST } = await import('@/app/api/ai/generate-banner/route');
    const request = new Request('http://localhost/api/ai/generate-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(401);
  });

  it('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'member' } });

    const { POST } = await import('@/app/api/ai/generate-banner/route');
    const request = new Request('http://localhost/api/ai/generate-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(403);
  });

  it('returns 400 on missing required fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });

    const { POST } = await import('@/app/api/ai/generate-banner/route');
    const request = new Request('http://localhost/api/ai/generate-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'test' }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });

  it('returns banner URL on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });
    mockGenerateBanner.mockResolvedValue({
      base64Data: 'abc123',
      mimeType: 'image/png',
    });
    mockUploadBanner.mockResolvedValue('https://storage.example.com/banners/product.png');

    const { POST } = await import('@/app/api/ai/generate-banner/route');
    const request = new Request('http://localhost/api/ai/generate-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.bannerUrl).toBe('https://storage.example.com/banners/product.png');
  });

  it('returns 502 when Gemini API fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });
    mockGenerateBanner.mockRejectedValue(new Error('Gemini API timeout'));

    const { POST } = await import('@/app/api/ai/generate-banner/route');
    const request = new Request('http://localhost/api/ai/generate-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(502);
  });

  it('returns 502 when storage upload fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });
    mockGenerateBanner.mockResolvedValue({ base64Data: 'abc', mimeType: 'image/png' });
    mockUploadBanner.mockRejectedValue(new Error('Storage quota exceeded'));

    const { POST } = await import('@/app/api/ai/generate-banner/route');
    const request = new Request('http://localhost/api/ai/generate-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(502);
  });

  it('returns 400 for invalid entityType', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });

    const { POST } = await import('@/app/api/ai/generate-banner/route');
    const request = new Request('http://localhost/api/ai/generate-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, entityType: 'invalid' }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
