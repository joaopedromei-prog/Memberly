import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', 'Not authenticated', 401);

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
