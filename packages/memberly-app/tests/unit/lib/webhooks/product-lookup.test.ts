import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupInternalProduct } from '@/lib/webhooks/product-lookup';

const mockMaybeSingle = vi.fn();
const mockEq2 = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
const mockSelect = vi.fn(() => ({ eq: mockEq1 }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

const mockAdminClient = { from: mockFrom } as unknown as Parameters<typeof lookupInternalProduct>[0];

vi.mock('@/lib/webhooks/webhook-logger', () => ({
  updateWebhookLog: vi.fn(),
}));

describe('lookupInternalProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns product_id when mapping exists', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { product_id: 'internal-uuid-123' },
    });

    const result = await lookupInternalProduct(
      mockAdminClient,
      'external-123',
      'payt'
    );

    expect(result).toBe('internal-uuid-123');
    expect(mockFrom).toHaveBeenCalledWith('product_mappings');
    expect(mockSelect).toHaveBeenCalledWith('product_id');
    expect(mockEq1).toHaveBeenCalledWith('external_product_id', 'external-123');
    expect(mockEq2).toHaveBeenCalledWith('gateway', 'payt');
  });

  it('returns null when no mapping exists', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    const result = await lookupInternalProduct(
      mockAdminClient,
      'unknown-id',
      'payt'
    );

    expect(result).toBeNull();
  });

  it('logs warning to webhook_logs when logId provided and no mapping', async () => {
    const { updateWebhookLog } = await import('@/lib/webhooks/webhook-logger');
    mockMaybeSingle.mockResolvedValue({ data: null });

    await lookupInternalProduct(
      mockAdminClient,
      'missing-id',
      'payt',
      'log-uuid-456'
    );

    expect(updateWebhookLog).toHaveBeenCalledWith(
      mockAdminClient,
      'log-uuid-456',
      'ignored',
      'No product mapping for external_product_id: missing-id'
    );
  });

  it('does not call updateWebhookLog when no logId provided', async () => {
    const { updateWebhookLog } = await import('@/lib/webhooks/webhook-logger');
    mockMaybeSingle.mockResolvedValue({ data: null });

    await lookupInternalProduct(mockAdminClient, 'missing-id', 'payt');

    expect(updateWebhookLog).not.toHaveBeenCalled();
  });
});
