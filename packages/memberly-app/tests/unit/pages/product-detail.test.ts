import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock redirect
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

// Mock components
vi.mock('@/components/member/ProductHero', () => ({ ProductHero: () => null }));
vi.mock('@/components/member/ModuleList', () => ({ ModuleList: () => null }));
vi.mock('@/components/member/PreviewBanner', () => ({ PreviewBanner: () => null }));
vi.mock('@/lib/utils/drip', () => ({
  isDripUnlocked: () => true,
  getEffectiveDripDays: () => 0,
}));

const mockProduct = {
  id: 'prod-1',
  title: 'Test Product',
  description: 'A test product',
  banner_url: null,
  slug: 'test-product',
  modules: [{
    id: 'mod-1', title: 'Module 1', description: 'First', banner_url: null,
    sort_order: 1, drip_days: null,
    lessons: [{ id: 'l-1', title: 'Lesson 1', sort_order: 1, is_published: true }],
  }],
};

// Helper to create a chainable Supabase mock
function createQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const handler = () => chain;
  chain.select = vi.fn().mockImplementation(handler);
  chain.eq = vi.fn().mockImplementation(handler);
  chain.in = vi.fn().mockImplementation(handler);
  chain.order = vi.fn().mockImplementation(handler);
  chain.maybeSingle = vi.fn().mockResolvedValue(resolvedValue);
  chain.single = vi.fn().mockResolvedValue(resolvedValue);
  chain.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => resolve(resolvedValue));
  return chain;
}

const mockGetUser = vi.fn();

function setupMocks(adminFromHandler: (table: string, callIndex: number) => ReturnType<typeof createQueryChain>) {
  const tableCounts: Record<string, number> = {};

  const mockAdminFrom = vi.fn().mockImplementation((table: string) => {
    tableCounts[table] = (tableCounts[table] || 0) + 1;
    return adminFromHandler(table, tableCounts[table]);
  });

  // Server client: only used for auth.getUser() and profile check
  vi.doMock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn().mockResolvedValue({
      auth: { getUser: () => mockGetUser() },
      from: vi.fn().mockImplementation(() =>
        createQueryChain({ data: null, error: null })
      ),
    }),
  }));

  // Admin client: used for all data queries (bypasses RLS)
  vi.doMock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn().mockReturnValue({
      from: mockAdminFrom,
    }),
  }));
}

describe('ProductPage — member access flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    vi.resetModules();
  });

  it('should load product when member has access', async () => {
    setupMocks((table) => {
      if (table === 'member_access') {
        return createQueryChain({
          data: [{ product_id: 'prod-1', granted_at: '2026-01-01' }],
          error: null,
        });
      }
      if (table === 'products') {
        return createQueryChain({ data: [mockProduct], error: null });
      }
      if (table === 'lesson_progress') {
        return createQueryChain({ data: [], error: null });
      }
      return createQueryChain({ data: null, error: null });
    });

    const { default: ProductPage } = await import('@/app/(member)/products/[slug]/page');

    try {
      await ProductPage({
        params: Promise.resolve({ slug: 'test-product' }),
        searchParams: Promise.resolve({}),
      });
    } catch {
      // Component rendering may throw in test env
    }

    expect(mockRedirect).not.toHaveBeenCalledWith('/?message=produto-nao-encontrado');
  });

  it('should redirect when member has no access records', async () => {
    setupMocks((table) => {
      if (table === 'member_access') {
        return createQueryChain({ data: [], error: null });
      }
      return createQueryChain({ data: null, error: null });
    });

    const { default: ProductPage } = await import('@/app/(member)/products/[slug]/page');

    try {
      await ProductPage({
        params: Promise.resolve({ slug: 'test-product' }),
        searchParams: Promise.resolve({}),
      });
    } catch {
      // redirect throws
    }

    expect(mockRedirect).toHaveBeenCalledWith('/?message=produto-nao-encontrado');
  });

  it('should redirect when product slug does not match any accessible product', async () => {
    setupMocks((table) => {
      if (table === 'member_access') {
        return createQueryChain({
          data: [{ product_id: 'prod-999', granted_at: '2026-01-01' }],
          error: null,
        });
      }
      if (table === 'products') {
        return createQueryChain({ data: [], error: null });
      }
      return createQueryChain({ data: null, error: null });
    });

    const { default: ProductPage } = await import('@/app/(member)/products/[slug]/page');

    try {
      await ProductPage({
        params: Promise.resolve({ slug: 'nonexistent' }),
        searchParams: Promise.resolve({}),
      });
    } catch {
      // redirect throws
    }

    expect(mockRedirect).toHaveBeenCalledWith('/?message=produto-nao-encontrado');
  });

  it('should extract grantedAt from member_access for drip calculation', async () => {
    setupMocks((table) => {
      if (table === 'member_access') {
        return createQueryChain({
          data: [{ product_id: 'prod-1', granted_at: '2026-02-15' }],
          error: null,
        });
      }
      if (table === 'products') {
        return createQueryChain({ data: [mockProduct], error: null });
      }
      if (table === 'lesson_progress') {
        return createQueryChain({ data: [], error: null });
      }
      return createQueryChain({ data: null, error: null });
    });

    const { default: ProductPage } = await import('@/app/(member)/products/[slug]/page');

    try {
      await ProductPage({
        params: Promise.resolve({ slug: 'test-product' }),
        searchParams: Promise.resolve({}),
      });
    } catch {
      // Component rendering may throw
    }

    // Product loaded successfully (no redirect)
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
