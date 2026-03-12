import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase server client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Dynamic import of route handlers after mocks are set up
async function importRoutes() {
  const mappingsRoute = await import(
    '@/app/api/products/[id]/mappings/route'
  );
  const mappingIdRoute = await import(
    '@/app/api/products/[id]/mappings/[mappingId]/route'
  );
  return { mappingsRoute, mappingIdRoute };
}

function createRequest(body?: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/products/prod-1/mappings', {
    method: body ? 'POST' : 'GET',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : {},
  });
}

describe('Product Mappings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', user_metadata: { role: 'admin' } } },
      error: null,
    });
  });

  describe('GET /api/products/[id]/mappings', () => {
    it('returns mappings for a product', async () => {
      const mockData = [
        { id: 'm1', external_product_id: 'ext-1', product_id: 'prod-1', gateway: 'payt', created_at: '2026-01-01' },
        { id: 'm2', external_product_id: 'ext-2', product_id: 'prod-1', gateway: 'payt', created_at: '2026-01-02' },
      ];
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({ data: mockData, error: null }),
          }),
        }),
      });

      const { mappingsRoute } = await importRoutes();
      const response = await mappingsRoute.GET(
        createRequest() as never,
        { params: Promise.resolve({ id: 'prod-1' }) }
      );

      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json).toHaveLength(2);
      expect(json[0].external_product_id).toBe('ext-1');
    });
  });

  describe('POST /api/products/[id]/mappings', () => {
    it('creates a mapping successfully', async () => {
      const newMapping = {
        id: 'm3',
        external_product_id: 'ext-new',
        product_id: 'prod-1',
        gateway: 'payt',
        created_at: '2026-01-03',
      };
      mockFrom.mockReturnValue({
        insert: () => ({
          select: () => ({
            single: () => ({ data: newMapping, error: null }),
          }),
        }),
      });

      const { mappingsRoute } = await importRoutes();
      const response = await mappingsRoute.POST(
        createRequest({ external_product_id: 'ext-new', gateway: 'payt' }) as never,
        { params: Promise.resolve({ id: 'prod-1' }) }
      );

      const json = await response.json();
      expect(response.status).toBe(201);
      expect(json.external_product_id).toBe('ext-new');
    });

    it('rejects empty external_product_id', async () => {
      const { mappingsRoute } = await importRoutes();
      const response = await mappingsRoute.POST(
        createRequest({ external_product_id: '  ', gateway: 'payt' }) as never,
        { params: Promise.resolve({ id: 'prod-1' }) }
      );

      const json = await response.json();
      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('handles duplicate mapping (UNIQUE constraint)', async () => {
      mockFrom.mockReturnValue({
        insert: () => ({
          select: () => ({
            single: () => ({
              data: null,
              error: { code: '23505', message: 'duplicate key' },
            }),
          }),
        }),
      });

      const { mappingsRoute } = await importRoutes();
      const response = await mappingsRoute.POST(
        createRequest({ external_product_id: 'ext-dup', gateway: 'payt' }) as never,
        { params: Promise.resolve({ id: 'prod-1' }) }
      );

      const json = await response.json();
      expect(response.status).toBe(409);
      expect(json.error.code).toBe('DUPLICATE_MAPPING');
    });

    it('rejects invalid gateway', async () => {
      const { mappingsRoute } = await importRoutes();
      const response = await mappingsRoute.POST(
        createRequest({ external_product_id: 'ext-1', gateway: 'stripe' }) as never,
        { params: Promise.resolve({ id: 'prod-1' }) }
      );

      const json = await response.json();
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/products/[id]/mappings/[mappingId]', () => {
    it('deletes a mapping', async () => {
      mockFrom.mockReturnValue({
        delete: () => ({
          eq: () => ({
            eq: () => ({ error: null }),
          }),
        }),
      });

      const { mappingIdRoute } = await importRoutes();
      const response = await mappingIdRoute.DELETE(
        createRequest() as never,
        { params: Promise.resolve({ id: 'prod-1', mappingId: 'm1' }) }
      );

      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.deleted).toBe(true);
    });
  });
});
