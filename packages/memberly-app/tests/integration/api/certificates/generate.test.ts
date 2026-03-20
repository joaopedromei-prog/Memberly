import { vi } from 'vitest';

// --- Scenario config ---
let mockScenario = {
  authenticated: true,
  hasAccess: true,
  existingCert: null as Record<string, unknown> | null,
  modules: [{ lessons: [{ id: 'l1' }, { id: 'l2' }] }] as { lessons: { id: string }[] }[],
  progress: [{ lesson_id: 'l1' }, { lesson_id: 'l2' }] as { lesson_id: string }[],
  insertResult: null as Record<string, unknown> | null,
  insertError: null as { message: string } | null,
};

const mockUser = { id: 'user-123' };
const mockProfile = { full_name: 'João Silva', role: 'member' };
const mockProduct = { title: 'Curso de Next.js' };

/**
 * Creates a deeply chainable mock that resolves at any terminal point.
 * Every method returns `this` (the proxy), and also acts as a thenable
 * that resolves to the given value.
 */
function chainable(resolveValue: unknown) {
  const handler: ProxyHandler<() => unknown> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(resolveValue);
      }
      // Any method call returns another chainable with the same resolve value
      return (..._args: unknown[]) => new Proxy(() => {}, handler);
    },
    apply() {
      return new Proxy(() => {}, handler);
    },
  };
  return new Proxy(() => {}, handler);
}

// Track certificate table calls to distinguish select vs insert
let certificateCallCount = 0;

const mockSupabaseFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'profiles') {
    return chainable({ data: mockProfile, error: null });
  }
  if (table === 'member_access') {
    return chainable({
      data: mockScenario.hasAccess ? { id: 'access-1' } : null,
      error: mockScenario.hasAccess ? null : { code: 'PGRST116' },
    });
  }
  if (table === 'certificates') {
    certificateCallCount++;
    if (certificateCallCount === 1) {
      // First call: check for existing certificate
      return chainable({
        data: mockScenario.existingCert,
        error: mockScenario.existingCert ? null : { code: 'PGRST116' },
      });
    }
    // Second call: insert new certificate
    return chainable({
      data: mockScenario.insertResult,
      error: mockScenario.insertError,
    });
  }
  if (table === 'modules') {
    return chainable({ data: mockScenario.modules, error: null });
  }
  if (table === 'lesson_progress') {
    return chainable({ data: mockScenario.progress, error: null });
  }
  if (table === 'products') {
    return chainable({ data: mockProduct, error: null });
  }
  return chainable({ data: null, error: null });
});

const mockSupabase = {
  from: mockSupabaseFrom,
  auth: {
    getUser: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: { user: mockScenario.authenticated ? mockUser : null },
        error: null,
      })
    ),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockImplementation(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/certificates/generate-pdf', () => ({
  generateCertificatePDF: vi.fn().mockResolvedValue(Buffer.from('fake-pdf')),
}));

vi.mock('@/lib/certificates/certificate-storage', () => ({
  uploadCertificatePDF: vi.fn().mockResolvedValue('https://example.com/certificates/cert.pdf'),
}));

vi.mock('@/lib/certificates/hash', () => ({
  generateCertificateHash: vi.fn().mockReturnValue('a'.repeat(64)),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

// Import after mocks
import { POST } from '@/app/api/certificates/generate/route';
import { NextRequest } from 'next/server';

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/certificates/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function resetScenario() {
  certificateCallCount = 0;
  mockScenario = {
    authenticated: true,
    hasAccess: true,
    existingCert: null,
    modules: [{ lessons: [{ id: 'l1' }, { id: 'l2' }] }],
    progress: [{ lesson_id: 'l1' }, { lesson_id: 'l2' }],
    insertResult: {
      id: 'cert-1',
      hash: 'a'.repeat(64),
      certificate_url: 'https://example.com/cert.pdf',
      issued_at: '2026-03-20T00:00:00.000Z',
    },
    insertError: null,
  };
}

describe('POST /api/certificates/generate', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should return 201 on successful certificate generation', async () => {
    const request = createRequest({ productId: 'product-1' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.certificate).toBeDefined();
    expect(data.certificate.id).toBe('cert-1');
    expect(data.certificate.hash).toBeDefined();
    expect(data.certificate.certificate_url).toBeDefined();
  });

  it('should return 200 with existing certificate if already generated', async () => {
    mockScenario.existingCert = {
      id: 'cert-existing',
      hash: 'existing-hash',
      certificate_url: 'https://example.com/existing.pdf',
      issued_at: '2026-03-19T00:00:00.000Z',
    };

    const request = createRequest({ productId: 'product-1' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.certificate.id).toBe('cert-existing');
  });

  it('should return 400 INCOMPLETE_PRODUCT when not all lessons completed', async () => {
    mockScenario.progress = [{ lesson_id: 'l1' }]; // only 1 of 2

    const request = createRequest({ productId: 'product-1' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INCOMPLETE_PRODUCT');
    expect(data.error.details.completedLessons).toBe(1);
    expect(data.error.details.totalLessons).toBe(2);
  });

  it('should return 400 NO_LESSONS when product has no published lessons', async () => {
    mockScenario.modules = [{ lessons: [] }];

    const request = createRequest({ productId: 'product-1' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('NO_LESSONS');
  });

  it('should return 403 when member has no access to product', async () => {
    mockScenario.hasAccess = false;

    const request = createRequest({ productId: 'product-1' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.code).toBe('FORBIDDEN');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockScenario.authenticated = false;

    const request = createRequest({ productId: 'product-1' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 400 when productId is missing', async () => {
    const request = createRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('MISSING_PRODUCT_ID');
  });
});
