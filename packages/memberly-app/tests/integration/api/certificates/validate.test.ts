import { vi } from 'vitest';

// --- Scenario config (hoisted so vi.mock factory can reference it) ---
const { mockCertificateRef, chainable } = vi.hoisted(() => {
  const mockCertificateRef = { current: null as Record<string, unknown> | null };

  function chainable(resolveValue: unknown) {
    const handler: ProxyHandler<() => unknown> = {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (v: unknown) => void) => resolve(resolveValue);
        }
        return (..._args: unknown[]) => new Proxy(() => {}, handler);
      },
      apply() {
        return new Proxy(() => {}, handler);
      },
    };
    return new Proxy(() => {}, handler);
  }

  return { mockCertificateRef, chainable };
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'certificates') {
        return chainable({
          data: mockCertificateRef.current,
          error: mockCertificateRef.current ? null : { code: 'PGRST116' },
        });
      }
      return chainable({ data: null, error: null });
    }),
  }),
}));

import { GET } from '@/app/api/certificates/validate/[hash]/route';
import { NextRequest } from 'next/server';

function createRequest(hash: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/certificates/validate/${hash}`, {
    method: 'GET',
  });
}

describe('GET /api/certificates/validate/[hash]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCertificateRef.current = null;
  });

  it('should return valid: true with certificate data when hash exists', async () => {
    mockCertificateRef.current = {
      id: 'cert-1',
      hash: 'abc123',
      issued_at: '2026-03-20T00:00:00.000Z',
      certificate_url: 'https://example.com/cert.pdf',
      profiles: { full_name: 'João Silva' },
      products: { title: 'Curso de Next.js' },
    };

    const request = createRequest('abc123');
    const response = await GET(request, { params: Promise.resolve({ hash: 'abc123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(true);
    expect(data.certificate).toBeDefined();
    expect(data.certificate.memberName).toBe('João Silva');
    expect(data.certificate.productTitle).toBe('Curso de Next.js');
    expect(data.certificate.issuedAt).toBe('2026-03-20T00:00:00.000Z');
    expect(data.certificate.certificateUrl).toBe('https://example.com/cert.pdf');
  });

  it('should return valid: false when hash does not exist', async () => {
    mockCertificateRef.current = null;

    const request = createRequest('nonexistent');
    const response = await GET(request, { params: Promise.resolve({ hash: 'nonexistent' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(false);
    expect(data.certificate).toBeUndefined();
  });

  it('should fallback to default names when profile/product data is missing', async () => {
    mockCertificateRef.current = {
      id: 'cert-2',
      hash: 'def456',
      issued_at: '2026-03-20T00:00:00.000Z',
      certificate_url: null,
      profiles: null,
      products: null,
    };

    const request = createRequest('def456');
    const response = await GET(request, { params: Promise.resolve({ hash: 'def456' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(true);
    expect(data.certificate.memberName).toBe('Membro');
    expect(data.certificate.productTitle).toBe('Produto');
    expect(data.certificate.certificateUrl).toBeNull();
  });
});
