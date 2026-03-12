import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmac } from 'crypto';

const WEBHOOK_SECRET = 'test-webhook-secret';

// Mock external dependencies
const mockListUsers = vi.fn();
const mockInviteUser = vi.fn();
const mockInsert = vi.fn();

const mockAdminClient = {
  from: vi.fn(),
  auth: {
    admin: {
      listUsers: mockListUsers,
      inviteUserByEmail: mockInviteUser,
    },
  },
};

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

// Mock product lookup
const mockLookupInternalProduct = vi.fn();
vi.mock('@/lib/webhooks/product-lookup', () => ({
  lookupInternalProduct: (...args: unknown[]) => mockLookupInternalProduct(...args),
}));

// Mock member provisioning
const mockFindOrCreateMember = vi.fn();
vi.mock('@/lib/webhooks/member-provisioning', () => ({
  findOrCreateMember: (...args: unknown[]) => mockFindOrCreateMember(...args),
}));

// Mock webhook logger
const mockCreateWebhookLog = vi.fn();
const mockUpdateWebhookLog = vi.fn();
vi.mock('@/lib/webhooks/webhook-logger', () => ({
  createWebhookLog: (...args: unknown[]) => mockCreateWebhookLog(...args),
  updateWebhookLog: (...args: unknown[]) => mockUpdateWebhookLog(...args),
}));

function signPayload(payload: string): string {
  return createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
}

function createWebhookRequest(
  body: Record<string, unknown>,
  options: { signature?: string | null; includeSignature?: boolean } = {}
) {
  const rawBody = JSON.stringify(body);
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (options.includeSignature !== false) {
    const sig = options.signature ?? signPayload(rawBody);
    headers['x-payt-signature'] = sig;
  }

  return new Request('http://localhost/api/webhooks/payt', {
    method: 'POST',
    headers,
    body: rawBody,
  });
}

const validPayload = {
  email: 'buyer@example.com',
  product_id: 'ext-prod-1',
  transaction_id: 'txn-001',
  status: 'approved',
  customer_name: 'John Doe',
};

describe('Payt Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PAYT_WEBHOOK_SECRET', WEBHOOK_SECRET);

    // Default happy path mocks
    mockCreateWebhookLog.mockResolvedValue('log-1');
    mockUpdateWebhookLog.mockResolvedValue(undefined);
    mockLookupInternalProduct.mockResolvedValue('internal-prod-1');
    mockFindOrCreateMember.mockResolvedValue('new-user-1');

    // Default: idempotency check returns no existing access
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'member_access') {
        return {
          select: () => ({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          insert: (data: unknown) => {
            mockInsert(data);
            return { error: null };
          },
        };
      }
      return {};
    });
  });

  it('should process a new purchase with new member', async () => {
    const { POST } = await import('@/app/api/webhooks/payt/route');

    const request = createWebhookRequest(validPayload);
    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('processed');
    expect(mockFindOrCreateMember).toHaveBeenCalledWith(
      mockAdminClient,
      'buyer@example.com',
      'John Doe'
    );
    expect(mockCreateWebhookLog).toHaveBeenCalled();
    expect(mockUpdateWebhookLog).toHaveBeenCalledWith(
      mockAdminClient,
      'log-1',
      'processed'
    );
  });

  it('should process purchase for existing member', async () => {
    mockFindOrCreateMember.mockResolvedValue('existing-user-1');

    const { POST } = await import('@/app/api/webhooks/payt/route');

    const payload = { ...validPayload, status: 'paid', transaction_id: 'txn-002' };
    const request = createWebhookRequest(payload);
    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('processed');
  });

  it('should return 200 for duplicate transaction (idempotency)', async () => {
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'member_access') {
        return {
          select: () => ({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'existing-access-1' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { POST } = await import('@/app/api/webhooks/payt/route');

    const payload = { ...validPayload, transaction_id: 'txn-duplicate' };
    const request = createWebhookRequest(payload);
    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('already_processed');
    expect(mockFindOrCreateMember).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid signature', async () => {
    const { POST } = await import('@/app/api/webhooks/payt/route');

    const request = createWebhookRequest(validPayload, { signature: 'invalid-signature' });
    const response = await POST(request as never);

    expect(response.status).toBe(401);
    expect(mockCreateWebhookLog).not.toHaveBeenCalled();
  });

  it('should return 401 for missing signature', async () => {
    const { POST } = await import('@/app/api/webhooks/payt/route');

    const request = createWebhookRequest(validPayload, { includeSignature: false });
    const response = await POST(request as never);

    expect(response.status).toBe(401);
  });

  it('should return 200 with ignored status when no product mapping exists', async () => {
    mockLookupInternalProduct.mockResolvedValue(null);

    const { POST } = await import('@/app/api/webhooks/payt/route');

    const payload = { ...validPayload, product_id: 'unknown-ext-prod' };
    const request = createWebhookRequest(payload);
    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ignored');
    expect(data.reason).toBe('no_product_mapping');
  });

  it('should return 400 for invalid payload', async () => {
    const { POST } = await import('@/app/api/webhooks/payt/route');

    const invalidPayload = { invalid: 'data' };
    const request = createWebhookRequest(invalidPayload);
    const response = await POST(request as never);

    expect(response.status).toBe(400);
  });
});
