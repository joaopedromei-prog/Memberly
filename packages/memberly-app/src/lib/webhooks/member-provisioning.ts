import { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_MEMBER_PASSWORD } from '@/lib/constants/auth';

export async function findOrCreateMember(
  adminClient: SupabaseClient,
  email: string,
  customerName?: string
): Promise<string> {
  // Try to find existing user by email using filtered query
  const { data: existingUsers, error: listError } =
    await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  const existingUser = existingUsers.users.find(
    (u) => u.email === email
  );

  if (existingUser) {
    return existingUser.id;
  }

  // Create new user with default password (pre-confirmed, no invite email)
  const { data: newUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password: DEFAULT_MEMBER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: 'member',
        full_name: customerName || email.split('@')[0],
      },
    });

  if (createError) {
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  // The handle_new_user() trigger creates the profile automatically
  return newUser.user.id;
}
