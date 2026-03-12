import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmac } from 'crypto';

// === Mocks ===

const WEBHOOK_SECRET = 'test-webhook-secret';

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
      title: 'Curso de Nutrição',
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
      },
    },
  };
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => createMockAdminClient(),
}));

vi.mock('@/lib/webhooks/payt-signature', () => ({
  validatePaytSignature: (sig: string | null, body: string, secret: string) => {
    if (!sig) return false;
    const expected = createHmac('sha256', secret).update(body).digest('hex');
    return sig === expected;
  },
}));

// Set env before importing route
process.env.PAYT_WEBHOOK_SECRET = WEBHOOK_SECRET;

// Import the route handler
const { POST } = await import('@/app/api/webhooks/payt/route');

function signPayload(payload: Record<string, unknown>): string {
  const body = JSON.stringify(payload);
  return createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
}

function createWebhookRequest(
  payload: Record<string, unknown>,
  signature?: string
): Request {
  const body = JSON.stringify(payload);
  const sig = signature ?? signPayload(payload);
  return new Request('http://localhost:3000/api/webhooks/payt', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
      'x-payt-signature': sig,
    },
  });
}

// === Tests ===

describe('Webhook to Access E2E Flow', () => {
  beforeEach(() => {
    resetDbState();
  });

  it('Scenario 1: New member purchases — creates user + access', async () => {
    const payload = {
      email: 'novo@teste.com',
      product_id: 'payt-prod-123',
      transaction_id: 'tx-001',
      status: 'approved',
      customer_name: 'João Novo',
    };

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('processed');
    expect(json.profile_id).toBeDefined();

    // Verify member was created
    const member = dbState.profiles.find((p) => p.email === 'novo@teste.com');
    expect(member).toBeDefined();
    expect(member?.full_name).toBe('João Novo');

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

    const payload = {
      email: 'existente@teste.com',
      product_id: 'payt-prod-123',
      transaction_id: 'tx-002',
      status: 'paid',
      customer_name: 'Maria Existente',
    };

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

    // No new profile was created (still only 1 profile in state)
    const profiles = dbState.profiles.filter(
      (p) => p.email === 'existente@teste.com'
    );
    expect(profiles).toHaveLength(1);
  });

  it('Scenario 3: Duplicate webhook — idempotent (no duplicate access)', async () => {
    const payload = {
      email: 'novo@teste.com',
      product_id: 'payt-prod-123',
      transaction_id: 'tx-003',
      status: 'approved',
    };

    // First call — creates access
    const response1 = await POST(createWebhookRequest(payload) as never);
    const json1 = await response1.json();
    expect(json1.status).toBe('processed');

    // Simulate the transaction_id already existing for idempotency check
    dbState.member_access[dbState.member_access.length - 1].transaction_id =
      'tx-003';

    // Second call — should be idempotent
    const response2 = await POST(createWebhookRequest(payload) as never);
    const json2 = await response2.json();
    expect(json2.status).toBe('already_processed');
  });

  it('Scenario 4: Unknown product mapping — returns ignored with 200', async () => {
    const payload = {
      email: 'comprador@teste.com',
      product_id: 'unknown-payt-product',
      transaction_id: 'tx-004',
      status: 'approved',
    };

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('ignored');
    expect(json.reason).toBe('no_product_mapping');

    // No access was created
    expect(dbState.member_access).toHaveLength(0);
  });

  it('Scenario 5: Non-approved status — ignored with 200', async () => {
    const payload = {
      email: 'pending@teste.com',
      product_id: 'payt-prod-123',
      transaction_id: 'tx-005',
      status: 'pending',
    };

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('ignored');
    expect(json.reason).toBe('status_not_approved');
  });

  it('Scenario 6: Invalid signature — returns 401', async () => {
    const payload = {
      email: 'hack@teste.com',
      product_id: 'payt-prod-123',
      transaction_id: 'tx-006',
      status: 'approved',
    };

    const response = await POST(
      createWebhookRequest(payload, 'invalid-signature') as never
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('returns duration_ms in successful response', async () => {
    const payload = {
      email: 'timing@teste.com',
      product_id: 'payt-prod-123',
      transaction_id: 'tx-007',
      status: 'approved',
    };

    const response = await POST(createWebhookRequest(payload) as never);
    const json = await response.json();

    expect(json.duration_ms).toBeDefined();
    expect(typeof json.duration_ms).toBe('number');
  });
});
