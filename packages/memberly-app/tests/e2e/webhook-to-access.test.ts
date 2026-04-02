import { describe, it, expect, vi, beforeEach } from 'vitest';

// === Mocks ===

const INTEGRATION_KEY = 'test-integration-key';

// Track all DB operations for assertions
const dbState: {
  product_mappings: Record<string, unknown>[];
  member_access: Record<string, unknown>[];
  webhook_logs: Record<string, unknown>[];
  profiles: Record<string, unknown>[];
  products: Record<string, unknown>[];
} = {
  product_mappings: [],
  member_access: [],
  webhook_logs: [],
  profiles: [],
  products: [],
};

function resetDbState() {
  dbState.product_mappings = [
    {
      external_product_id: 'payt-prod-123',
      product_id: 'internal-product-uuid',
      gateway: 'payt',
    },
  ];
  dbState.member_access = [];
  dbState.webhook_logs = [];
  dbState.profiles = [];
  dbState.products = [
    {
      id: 'internal-product-uuid',
      title: 'Curso de Nutricao',
      slug: 'curso-nutricao',
      is_published: true,
    },
  ];
}

// Mock admin client with chainable query builder
function createMockAdminClient() {
  let logIdCounter = 0;

  return {
    from: (table: string) => {
      const builder = {
        select: (cols?: string) => {
          const chain = {
            eq: (col: string, val: unknown) => {
              const chain2 = {
                eq: (col2: string, val2: unknown) => ({
                  maybeSingle: () => {
                    if (table === 'product_mappings') {
                      const found = dbState.product_mappings.find(
                        (m) =>
                          m[col] === val && m[col2] === val2
                      );
                      return { data: found || null };
                    }
                    return { data: null };
                  },
                }),
                maybeSingle: () => {
                  if (table === 'member_access') {
                    const found = dbState.member_access.find(
                      (a) => a[col] === val
                    );
                    return { data: found || null };
                  }
                  return { data: null };
                },
                single: () => {
                  if (table === 'webhook_logs') {
                    const found = dbState.webhook_logs.find(
                      (l) => l[col] === val
                    );
                    return { data: found, error: null };
                  }
                  return { data: null, error: null };
                },
              };
              return chain2;
            },
          };
          return chain;
        },
        insert: (record: Record<string, unknown>) => {
          if (table === 'webhook_logs') {
            const id = `log-${++logIdCounter}`;
            const entry = { ...record, id };
            dbState.webhook_logs.push(entry);
            return {
              select: () => ({
                single: () => ({ data: { id }, error: null }),
              }),
            };
          }
          if (table === 'member_access') {
            // Check UNIQUE constraint
            const exists = dbState.member_access.find(
              (a) =>
                a.profile_id === record.profile_id &&
                a.product_id === record.product_id
            );
            if (exists) {
              return {
                error: { code: '23505', message: 'duplicate key' },
              };
            }
            dbState.member_access.push(record);
            return { error: null };
          }
          return { error: null };
        },
        update: (record: Record<string, unknown>) => ({
          eq: () => ({ error: null }),
        }),
        delete: () => ({
          eq: () => ({ eq: () => ({ error: null }) }),
        }),
      };
      return builder;
    },
    auth: {
      admin: {
        listUsers: () => {
          const users = dbState.profiles.map((p) => ({
            id: p.id,
            email: p.email,
          }));
          return { data: { users }, error: null };
        },
        inviteUserByEmail: (email: string, opts: { data: Record<string, unknown> }) => {
          const id = `new-user-${Date.now()}`;
          dbState.profiles.push({
            id,
            email,
            full_name: opts.data.full_name,
            role: opts.data.role,
          });
          return { data: { user: { id } }, error: null };
        },
        createUser: (opts: { email: string; password: string; email_confirm: boolean; user_metadata: Record<string, unknown> }) => {
          const id = `new-user-${Date.now()}`;
          dbState.profiles.push({
            id,
            email: opts.email,
            full_name: opts.user_metadata.full_name,
            role: opts.user_metadata.role,
          });
          return { data: { user: { id } }, error: null };
        },
      },
    },
  };
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => createMockAdminClient(),
}));

vi.mock('@/lib/webhooks/payt-signature', () => ({
  validatePaytIntegrationKey: (receivedKey: string | undefined, expectedKey: string) => {
    if (!receivedKey || !expectedKey) return false;
    return receivedKey === expectedKey;
  },
}));

// Set env before importing route
process.env.PAYT_INTEGRATION_KEY = INTEGRATION_KEY;

// Import the route handler
const { POST } = await import('@/app/api/webhooks/payt/route');

function createPaytPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    integration_key: INTEGRATION_KEY,
    transaction_id: 'tx-001',
    seller_id: 'seller-1',
    test: false,
    type: 'order',
    status: 'paid',
    tangible: false,
    customer: {
      name: 'Joao Novo',
      email: 'novo@teste.com',
      fake_email: false,
      doc: '12345678900',
      phone: '11999999999',
    },
    product: {
      name: 'Curso de Marketing',
      price: 9900,
      code: 'payt-prod-123',
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

function createWebhookRequest(payload: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/webhooks/payt', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// === Tests ===

describe('Webhook to Access E2E Flow', () => {
  beforeEach(() => {
    resetDbState();
  });

  it('Scenario 1: New member purchases — creates user + access', async () => {
    const payload = createPaytPayload();

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('processed');
    expect(json.profile_id).toBeDefined();

    // Verify member was created
    const member = dbState.profiles.find((p) => p.email === 'novo@teste.com');
    expect(member).toBeDefined();
    expect(member?.full_name).toBe('Joao Novo');

    // Verify access was granted
    const access = dbState.member_access.find(
      (a) => a.product_id === 'internal-product-uuid'
    );
    expect(access).toBeDefined();
    expect(access?.granted_by).toBe('webhook');
    expect(access?.transaction_id).toBe('tx-001');

    // Verify webhook was logged
    expect(dbState.webhook_logs.length).toBeGreaterThan(0);
  });

  it('Scenario 2: Existing member, new product — adds access without new invite', async () => {
    // Pre-existing member
    dbState.profiles.push({
      id: 'existing-user-id',
      email: 'existente@teste.com',
      full_name: 'Maria Existente',
      role: 'member',
    });

    const payload = createPaytPayload({
      transaction_id: 'tx-002',
      customer: {
        name: 'Maria Existente',
        email: 'existente@teste.com',
        fake_email: false,
        doc: '98765432100',
        phone: '11888888888',
      },
    });

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('processed');
    expect(json.profile_id).toBe('existing-user-id');

    // Verify access was granted
    const access = dbState.member_access.find(
      (a) => a.profile_id === 'existing-user-id'
    );
    expect(access).toBeDefined();

    // No new profile was created
    const profiles = dbState.profiles.filter(
      (p) => p.email === 'existente@teste.com'
    );
    expect(profiles).toHaveLength(1);
  });

  it('Scenario 3: Duplicate webhook — idempotent (no duplicate access)', async () => {
    const payload = createPaytPayload({ transaction_id: 'tx-003' });

    // First call — creates access
    const response1 = await POST(createWebhookRequest(payload) as never);
    const json1 = await response1.json();
    expect(json1.status).toBe('processed');

    // Simulate the transaction_id already existing for idempotency check
    dbState.member_access[dbState.member_access.length - 1].transaction_id = 'tx-003';

    // Second call — should be idempotent
    const response2 = await POST(createWebhookRequest(payload) as never);
    const json2 = await response2.json();
    expect(json2.status).toBe('already_processed');
  });

  it('Scenario 4: Unknown product mapping — returns ignored with 200', async () => {
    const payload = createPaytPayload({
      transaction_id: 'tx-004',
      product: {
        name: 'Produto Desconhecido',
        price: 0,
        code: 'unknown-payt-product',
        type: 'digital',
      },
    });

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('ignored');
    expect(json.reason).toBe('no_product_mapping');

    // No access was created
    expect(dbState.member_access).toHaveLength(0);
  });

  it('Scenario 5: Non-approved status — ignored with 200', async () => {
    const payload = createPaytPayload({
      transaction_id: 'tx-005',
      status: 'waiting_payment',
      customer: {
        name: 'Pending User',
        email: 'pending@teste.com',
        fake_email: false,
      },
      transaction: {
        payment_method: 'pix',
        payment_status: 'waiting_payment',
        total_price: 9900,
      },
    });

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('ignored');
    expect(json.reason).toBe('status_not_approved');
  });

  it('Scenario 6: Invalid integration key — returns 401', async () => {
    const payload = createPaytPayload({
      transaction_id: 'tx-006',
      integration_key: 'invalid-key',
      customer: {
        name: 'Hacker',
        email: 'hack@teste.com',
        fake_email: false,
      },
    });

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('returns duration_ms in successful response', async () => {
    const payload = createPaytPayload({
      transaction_id: 'tx-007',
      customer: {
        name: 'Timing User',
        email: 'timing@teste.com',
        fake_email: false,
      },
    });

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(json.duration_ms).toBeDefined();
    expect(typeof json.duration_ms).toBe('number');
  });
});
