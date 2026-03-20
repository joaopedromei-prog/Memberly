import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// --- Scenario config ---
let mockCertificate: Record<string, unknown> | null = null;

function createQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const handler = () => chain;
  chain.select = vi.fn().mockImplementation(handler);
  chain.eq = vi.fn().mockImplementation(handler);
  chain.maybeSingle = vi.fn().mockResolvedValue(resolvedValue);
  chain.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => resolve(resolvedValue));
  return chain;
}

function setupMocks() {
  const mockAdminFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'certificates') {
      return createQueryChain({
        data: mockCertificate,
        error: mockCertificate ? null : { code: 'PGRST116' },
      });
    }
    return createQueryChain({ data: null, error: null });
  });

  vi.doMock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn().mockReturnValue({
      from: mockAdminFrom,
    }),
  }));
}

// Mock lucide-react icons as simple spans
vi.mock('lucide-react', () => ({
  CheckCircle2: (props: Record<string, unknown>) => {
    const { createElement } = require('react');
    return createElement('span', { 'data-testid': 'check-icon', ...props });
  },
  XCircle: (props: Record<string, unknown>) => {
    const { createElement } = require('react');
    return createElement('span', { 'data-testid': 'x-icon', ...props });
  },
  Download: (props: Record<string, unknown>) => {
    const { createElement } = require('react');
    return createElement('span', { 'data-testid': 'download-icon', ...props });
  },
  ShieldCheck: (props: Record<string, unknown>) => {
    const { createElement } = require('react');
    return createElement('span', { 'data-testid': 'shield-icon', ...props });
  },
}));

describe('CertificateValidationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockCertificate = null;
  });

  afterEach(() => {
    cleanup();
  });

  it('should render valid certificate with member name, product title, and date', async () => {
    mockCertificate = {
      id: 'cert-1',
      hash: 'abc123def456',
      issued_at: '2026-03-20T00:00:00.000Z',
      certificate_url: 'https://example.com/cert.pdf',
      profiles: { full_name: 'Maria Santos' },
      products: { title: 'Curso Avançado de React' },
    };

    setupMocks();

    const { default: CertificateValidationPage } = await import(
      '@/app/certificates/[hash]/page'
    );

    const { render, screen } = await import('@testing-library/react');

    const result = await CertificateValidationPage({
      params: Promise.resolve({ hash: 'abc123def456' }),
    });

    render(result);

    expect(screen.getByTestId('valid-badge')).toHaveTextContent('Certificado Válido');
    expect(screen.getByTestId('member-name')).toHaveTextContent('Maria Santos');
    expect(screen.getByTestId('product-title')).toHaveTextContent('Curso Avançado de React');
    expect(screen.getByTestId('issued-at')).toBeDefined();
    expect(screen.getByTestId('download-pdf')).toHaveAttribute(
      'href',
      'https://example.com/cert.pdf'
    );
  });

  it('should render invalid certificate state when hash not found', async () => {
    mockCertificate = null;

    setupMocks();

    const { default: CertificateValidationPage } = await import(
      '@/app/certificates/[hash]/page'
    );

    const { render, screen } = await import('@testing-library/react');

    const result = await CertificateValidationPage({
      params: Promise.resolve({ hash: 'nonexistent' }),
    });

    render(result);

    expect(screen.getByTestId('invalid-badge')).toHaveTextContent('Certificado Não Encontrado');
    expect(screen.getByTestId('invalid-message')).toHaveTextContent(
      'O certificado com este código de validação não foi encontrado'
    );
    expect(screen.queryByTestId('download-pdf')).toBeNull();
  });

  it('should not show download button when certificate_url is null', async () => {
    mockCertificate = {
      id: 'cert-2',
      hash: 'no-pdf-hash',
      issued_at: '2026-03-20T00:00:00.000Z',
      certificate_url: null,
      profiles: { full_name: 'Pedro Lima' },
      products: { title: 'Curso de TypeScript' },
    };

    setupMocks();

    const { default: CertificateValidationPage } = await import(
      '@/app/certificates/[hash]/page'
    );

    const { render, screen } = await import('@testing-library/react');

    const result = await CertificateValidationPage({
      params: Promise.resolve({ hash: 'no-pdf-hash' }),
    });

    render(result);

    expect(screen.getByTestId('valid-badge')).toHaveTextContent('Certificado Válido');
    expect(screen.getByTestId('member-name')).toHaveTextContent('Pedro Lima');
    expect(screen.queryByTestId('download-pdf')).toBeNull();
  });
});
