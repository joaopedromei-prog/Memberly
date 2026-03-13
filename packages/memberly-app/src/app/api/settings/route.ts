import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { requireAdmin } from '@/lib/utils/auth-guard';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const supabase = auth.data.supabase;

  const { data: settings, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) return apiError('SERVER_ERROR', error.message, 500);

  const result: Record<string, unknown> = {};
  for (const s of settings ?? []) {
    result[s.key] = s.value;
  }

  return apiSuccess(result);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const supabase = auth.data.supabase;

  const body = await request.json();

  const updates = Object.entries(body as Record<string, unknown>);
  if (updates.length === 0) {
    return apiError('VALIDATION_ERROR', 'No settings to update', 400);
  }

  const now = new Date().toISOString();
  const results = await Promise.all(
    updates.map(([key, value]) =>
      supabase
        .from('site_settings')
        .update({ value: JSON.parse(JSON.stringify(value)), updated_at: now })
        .eq('key', key)
        .then(({ error }) => ({ key, error }))
    )
  );

  const failed = results.filter((r) => r.error);
  if (failed.length > 0) {
    return apiError('SERVER_ERROR', `Failed to update: ${failed.map((f) => f.key).join(', ')}`, 500);
  }

  return apiSuccess({ updated: updates.map(([k]) => k) });
}
