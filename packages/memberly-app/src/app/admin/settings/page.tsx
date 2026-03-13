import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SettingsPageClient } from './SettingsPageClient';
import type { WebhookLogEntry } from './SettingsPageClient';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value');

  const settingsMap: Record<string, unknown> = {};
  for (const s of settings ?? []) {
    settingsMap[s.key] = s.value;
  }

  // Fetch recent webhook logs (max 10, most recent)
  const { data: webhookLogs } = await supabase
    .from('webhook_logs')
    .select('id, status, event_type, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <SettingsPageClient
      settings={settingsMap}
      webhookLogs={(webhookLogs as WebhookLogEntry[]) ?? []}
    />
  );
}
