import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validatePaytSignature } from '@/lib/webhooks/payt-signature';
import { paytWebhookSchema } from '@/types/webhook';
import { findOrCreateMember } from '@/lib/webhooks/member-provisioning';
import { createWebhookLog, updateWebhookLog } from '@/lib/webhooks/webhook-logger';
import { lookupInternalProduct } from '@/lib/webhooks/product-lookup';
import { apiError } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const adminClient = createAdminClient();
  let logId: string | null = null;

  try {
    // 1. Read raw body for signature validation
    const rawBody = await request.text();

    // 2. Validate signature
    const signature = request.headers.get('x-payt-signature');
    const secret = process.env.PAYT_WEBHOOK_SECRET;

    if (!secret) {
      console.error('PAYT_WEBHOOK_SECRET not configured');
      return apiError('SERVER_ERROR', 'Webhook secret not configured', 500);
    }

    if (!validatePaytSignature(signature, rawBody, secret)) {
      return apiError('UNAUTHORIZED', 'Invalid webhook signature', 401);
    }

    // 3. Parse and validate payload
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return apiError('VALIDATION_ERROR', 'Invalid JSON payload', 400);
    }

    const parsed = paytWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid webhook payload', 400, {
        issues: parsed.error.issues,
      });
    }

    const payload = parsed.data;

    // 4. Log webhook (before processing)
    logId = await createWebhookLog(adminClient, body as Record<string, unknown>, 'purchase');

    // 5. Only process approved/paid purchases
    if (payload.status !== 'approved' && payload.status !== 'paid') {
      await updateWebhookLog(adminClient, logId, 'ignored');
      return NextResponse.json({ status: 'ignored', reason: 'status_not_approved' });
    }

    // 6. Check idempotency via transaction_id
    const { data: existingAccess } = await adminClient
      .from('member_access')
      .select('id')
      .eq('transaction_id', payload.transaction_id)
      .maybeSingle();

    if (existingAccess) {
      await updateWebhookLog(adminClient, logId, 'ignored');
      return NextResponse.json({ status: 'already_processed' });
    }

    // 7. Lookup product mapping (external_product_id → internal product_id)
    const internalProductId = await lookupInternalProduct(
      adminClient,
      payload.product_id,
      'payt',
      logId
    );

    if (!internalProductId) {
      return NextResponse.json({ status: 'ignored', reason: 'no_product_mapping' });
    }

    // 8. Find or create member
    const profileId = await findOrCreateMember(adminClient, payload.email, payload.customer_name);

    // 9. Create member access
    const { error: accessError } = await adminClient
      .from('member_access')
      .insert({
        profile_id: profileId,
        product_id: internalProductId,
        granted_by: 'webhook',
        transaction_id: payload.transaction_id,
      });

    if (accessError) {
      // Handle UNIQUE constraint (profile_id + product_id) as idempotency
      if (accessError.code === '23505') {
        await updateWebhookLog(adminClient, logId, 'ignored', 'Access already exists');
        return NextResponse.json({ status: 'already_processed' });
      }
      throw accessError;
    }

    // 10. Mark log as processed
    const durationMs = Math.round(performance.now() - startTime);
    await updateWebhookLog(adminClient, logId, 'processed');

    console.info(`[webhook/payt] Processed in ${durationMs}ms — profile=${profileId} product=${internalProductId}`);

    return NextResponse.json({ status: 'processed', profile_id: profileId, duration_ms: durationMs });
  } catch (error) {
    console.error('Webhook processing error:', error);

    if (logId) {
      await updateWebhookLog(
        adminClient,
        logId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return apiError('SERVER_ERROR', 'Internal server error', 500);
  }
}
