import { SupabaseClient } from '@supabase/supabase-js';

export async function createWebhookLog(
  adminClient: SupabaseClient,
  payload: Record<string, unknown>,
  eventType: string = 'purchase'
): Promise<string> {
  const { data, error } = await adminClient
    .from('webhook_logs')
    .insert({
      gateway: 'payt',
      event_type: eventType,
      payload,
      status: 'processed',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create webhook log:', error);
    throw error;
  }

  return data.id;
}

export async function updateWebhookLog(
  adminClient: SupabaseClient,
  logId: string,
  status: 'processed' | 'failed' | 'ignored',
  errorMessage?: string,
  emailResult?: { sent: boolean; error?: string }
): Promise<void> {
  const { error } = await adminClient
    .from('webhook_logs')
    .update({
      status,
      ...(errorMessage && { error_message: errorMessage }),
      ...(emailResult && {
        email_sent: emailResult.sent,
        email_error: emailResult.error || null,
      }),
    })
    .eq('id', logId);

  if (error) {
    console.error('Failed to update webhook log:', error);
  }
}
