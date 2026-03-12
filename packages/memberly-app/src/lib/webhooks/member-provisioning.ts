import { SupabaseClient } from '@supabase/supabase-js';

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

  // Create new user via invite (sends welcome email with credentials)
  const { data: newUser, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        role: 'member',
        full_name: customerName || email.split('@')[0],
      },
    });

  if (inviteError) {
    throw new Error(`Failed to invite user: ${inviteError.message}`);
  }

  // The handle_new_user() trigger creates the profile automatically
  return newUser.user.id;
}
