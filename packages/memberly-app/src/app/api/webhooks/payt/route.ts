import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validatePaytIntegrationKey } from '@/lib/webhooks/payt-signature';
import { paytWebhookSchema } from '@/types/webhook';
import { findOrCreateMember } from '@/lib/webhooks/member-provisioning';
import { createWebhookLog, updateWebhookLog } from '@/lib/webhooks/webhook-logger';
import { lookupInternalProduct } from '@/lib/webhooks/product-lookup';
import { sendWelcomeEmail } from '@/lib/email/templates/welcome-email';
import { apiError } from '@/lib/utils/api-response';
import { webhookLimiter } from '@/lib/utils/rate-limiter';

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  // Rate limiting (Story 8.10): 30 req/min per IP
  const clientIP = getClientIP(request);
  const { allowed, retryAfter } = webhookLimiter.check(clientIP);
  if (!allowed) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    });
  }

  const startTime = performance.now();
  const adminClient = createAdminClient();
  let logId: string | null = null;

  try {
    // 1. Parse JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError('VALIDATION_ERROR', 'Invalid JSON payload', 400);
    }

    // 2. Validate payload against Payt V1 schema
    const parsed = paytWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid webhook payload', 400, {
        issues: parsed.error.issues,
      });
    }

    const payload = parsed.data;

    // 3. Validate integration key
    const expectedKey = process.env.PAYT_INTEGRATION_KEY;

    if (!expectedKey) {
      console.error('PAYT_INTEGRATION_KEY not configured');
      return apiError('SERVER_ERROR', 'Webhook integration key not configured', 500);
    }

    if (!validatePaytIntegrationKey(payload.integration_key, expectedKey)) {
      return apiError('UNAUTHORIZED', 'Invalid integration key', 401);
    }

    // 4. Log webhook (before processing)
    logId = await createWebhookLog(adminClient, body as Record<string, unknown>, 'purchase');

    // 5. Ignore test postbacks in production
    if (payload.test && process.env.NODE_ENV === 'production') {
      await updateWebhookLog(adminClient, logId, 'ignored', 'Test postback ignored in production');
      return NextResponse.json({ status: 'ignored', reason: 'test_postback' });
    }

    // 6. Only process paid/approved purchases
    const isPaid = payload.status === 'paid' ||
      payload.status === 'approved' ||
      payload.transaction?.payment_status === 'paid';

    if (!isPaid) {
      await updateWebhookLog(adminClient, logId, 'ignored');
      return NextResponse.json({ status: 'ignored', reason: 'status_not_approved' });
    }

    // 7. Check idempotency via transaction_id
    const { data: existingAccess } = await adminClient
      .from('member_access')
      .select('id')
      .eq('transaction_id', payload.transaction_id)
      .maybeSingle();

    if (existingAccess) {
      await updateWebhookLog(adminClient, logId, 'ignored');
      return NextResponse.json({ status: 'already_processed' });
    }

    // 8. Lookup product mapping (product.code → internal product_id)
    const internalProductId = await lookupInternalProduct(
      adminClient,
      payload.product.code,
      'payt',
      logId
    );

    if (!internalProductId) {
      return NextResponse.json({ status: 'ignored', reason: 'no_product_mapping' });
    }

    // 9. Find or create member (with phone from checkout)
    const profileId = await findOrCreateMember(
      adminClient,
      payload.customer.email,
      payload.customer.name,
      payload.customer.phone
    );

    // 10. Create member access
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

    // 11. Send welcome email (best-effort, does not block response)
    let emailResult: { sent: boolean; error?: string } = { sent: false };
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const productName = payload.product.name || 'seu produto';
      const memberName = payload.customer.name || payload.customer.email.split('@')[0];

      emailResult = await sendWelcomeEmail({
        memberName,
        memberEmail: payload.customer.email,
        productName,
        loginUrl: `${appUrl}/login`,
      });
    } catch (emailErr) {
      emailResult = {
        sent: false,
        error: emailErr instanceof Error ? emailErr.message : 'Email send exception',
      };
      console.error('[webhook/payt] Email send error (non-blocking):', emailErr);
    }

    // 12. Mark log as processed with email tracking
    const durationMs = Math.round(performance.now() - startTime);
    await updateWebhookLog(adminClient, logId, 'processed', undefined, emailResult);

    console.info(`[webhook/payt] Processed in ${durationMs}ms — profile=${profileId} product=${internalProductId} email=${emailResult.sent}`);

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
