import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/utils/api-response';

interface AuthResult {
  user: { id: string };
  role: string;
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
}

/**
 * Authenticate the current user and fetch their role.
 * Returns the user, role, and supabase client if authenticated.
 * Returns an API error response if not authenticated.
 */
export async function authenticateUser(): Promise<
  { ok: true; data: AuthResult } | { ok: false; response: Response }
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, response: apiError('UNAUTHORIZED', 'Autenticação necessária', 401) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'member';

  return { ok: true, data: { user, role, supabase } };
}

/**
 * Require admin role. Returns authenticated data if admin.
 * Returns a 403 error response if not admin.
 */
export async function requireAdmin(): Promise<
  { ok: true; data: AuthResult } | { ok: false; response: Response }
> {
  const auth = await authenticateUser();

  if (!auth.ok) return auth;

  if (auth.data.role !== 'admin') {
    return {
      ok: false,
      response: apiError('FORBIDDEN', 'Acesso restrito a administradores', 403),
    };
  }

  return auth;
}
