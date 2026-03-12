import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client using the service_role key.
 * This client BYPASSES Row Level Security (RLS).
 *
 * WARNING: Only use in webhook handlers and server-side admin operations.
 * NEVER expose to client-side code or import in client components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
