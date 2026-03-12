import { describe, it, expect, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test-project.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

describe('Supabase Client', () => {
  it('should create browser client', async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();
    expect(client).toBeDefined();
    expect(typeof client.auth).toBe('object');
    expect(typeof client.from).toBe('function');
  });
});
