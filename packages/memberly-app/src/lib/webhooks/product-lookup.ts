import { SupabaseClient } from '@supabase/supabase-js';
import { updateWebhookLog } from '@/lib/webhooks/webhook-logger';

/**
 * Looks up the internal product_id from an external product ID and gateway.
 * Used by webhook handlers to translate gateway-specific IDs to Memberly products.
 *
 * @returns The internal product_id, or null if no mapping exists.
 */
export async function lookupInternalProduct(
  adminClient: SupabaseClient,
  externalProductId: string,
  gateway: string,
  logId?: string
): Promise<string | null> {
  const { data: mapping } = await adminClient
    .from('product_mappings')
    .select('product_id')
    .eq('external_product_id', externalProductId)
    .eq('gateway', gateway)
    .maybeSingle();

  if (!mapping) {
    console.warn(
      `[product-lookup] No mapping found for external_product_id="${externalProductId}" gateway="${gateway}"`
    );

    if (logId) {
      await updateWebhookLog(
        adminClient,
        logId,
        'ignored',
        `No product mapping for external_product_id: ${externalProductId}`
      );
    }

    return null;
  }

  return mapping.product_id;
}
