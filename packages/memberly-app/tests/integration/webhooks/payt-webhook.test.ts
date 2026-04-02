import { describe, it, expect, vi, beforeEach } from 'vitest';

const INTEGRATION_KEY = 'test-integration-key';

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

// Mock email
vi.mock('@/lib/email/templates/welcome-email', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue({ sent: false, skipped: true }),
}));

// Mock webhook logger
const mockCreateWebhookLog = vi.fn();
const mockUpdateWebhookLog = vi.fn();
vi.mock('@/lib/webhooks/webhook-logger', () => ({
  createWebhookLog: (...args: unknown[]) => mockCreateWebhookLog(...args),
  updateWebhookLog: (...args: unknown[]) => mockUpdateWebhookLog(...args),
}));

function createPaytPayload(overrides: Record<string, unknown> = {}) {
  return {
    integration_key: INTEGRATION_KEY,
    transaction_id: 'txn-001',
    seller_id: 'seller-1',
    test: false,
    type: 'order',
    status: 'paid',
    tangible: false,
    customer: {
      name: 'John Doe',
      email: 'buyer@example.com',
      fake_email: false,
      doc: '12345678900',
      phone: '11999999999',
    },
    product: {
      name: 'Curso de Marketing',
      price: 9900,
      code: 'ext-prod-1',
      type: 'digital',
    },
    transaction: {
      payment_method: 'credit_card',
      payment_status: 'paid',
      total_price: 9900,
    },
    ...overrides,
  };
}

function createWebhookRequest(payload: Record<string, unknown>) {
  return new Request('http://localhost/api/webhooks/payt', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

describe('Payt Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PAYT_INTEGRATION_KEY', INTEGRATION_KEY);

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

  it('should process a new purchase with Payt V1 payload', async () => {
    const { POST } = await import('@/app/api/webhooks/payt/route');

    const request = createWebhookRequest(createPaytPayload());
    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('processed');
    expect(mockFindOrCreateMember).toHaveBeenCalledWith(
      mockAdminClient,
      'buyer@example.com',
      'John Doe',
      '11999999999'
    );
    expect(mockLookupInternalProduct).toHaveBeenCalledWith(
      mockAdminClient,
      'ext-prod-1',
      'payt',
      'log-1'
    );
    expect(mockCreateWebhookLog).toHaveBeenCalled();
  });

  it('should process purchase for existing member', async () => {
    mockFindOrCreateMember.mockResolvedValue('existing-user-1');

    const { POST } = await import('@/app/api/webhooks/payt/route');

    const payload = createPaytPayload({ transaction_id: 'txn-002' });
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

    const payload = createPaytPayload({ transaction_id: 'txn-duplicate' });
    const request = createWebhookRequest(payload);
    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('already_processed');
    expect(mockFindOrCreateMember).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid integration key', async () => {
    const { POST } = await import('@/app/api/webhooks/payt/route');

    const payload = createPaytPayload({ integration_key: 'wrong-key' });
    const request = createWebhookRequest(payload);
    const response = await POST(request as never);

    expect(response.status).toBe(401);
    expect(mockCreateWebhookLog).not.toHaveBeenCalled();
  });

  it('should return 400 for missing integration key', async () => {
    const { POST } = await import('@/app/api/webhooks/payt/route');

    const payload = { invalid: 'data' };
    const request = createWebhookRequest(payload);
    const response = await POST(request as never);

    expect(response.status).toBe(400);
  });

  it('should return 200 with ignored status when no product mapping exists', async () => {
    mockLookupInternalProduct.mockResolvedValue(null);

    const { POST } = await import('@/app/api/webhooks/payt/route');

    const payload = createPaytPayload({
      product: { name: 'Unknown', price: 0, code: 'unknown-ext-prod', type: 'digital' },
    });
    const request = createWebhookRequest(payload);
    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ignored');
    expect(data.reason).toBe('no_product_mapping');
  });

  it('should ignore non-paid status with 200', async () => {
    const { POST } = await import('@/app/api/webhooks/payt/route');

    const payload = createPaytPayload({
      status: 'waiting_payment',
      transaction: {
        payment_method: 'pix',
        payment_status: 'waiting_payment',
        total_price: 9900,
      },
    });
    const request = createWebhookRequest(payload);
    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ignored');
    expect(data.reason).toBe('status_not_approved');
  });
});
