import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { requireAdmin } from '@/lib/utils/auth-guard';

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const supabase = auth.data.supabase;

  const newSecret = crypto.randomUUID();

  const { error } = await supabase
    .from('site_settings')
    .update({
      value: JSON.parse(JSON.stringify(newSecret)),
      updated_at: new Date().toISOString(),
    })
    .eq('key', 'webhook_secret');

  if (error) return apiError('SERVER_ERROR', error.message, 500);

  return apiSuccess({ secret: newSecret });
}
