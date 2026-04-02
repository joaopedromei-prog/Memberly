import { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_MEMBER_PASSWORD } from '@/lib/constants/auth';

export async function findOrCreateMember(
  adminClient: SupabaseClient,
  email: string,
  customerName?: string,
  customerPhone?: string
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
    // Update phone if provided and profile doesn't have one yet
    if (customerPhone) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('phone')
        .eq('id', existingUser.id)
        .single();

      if (profile && !profile.phone) {
        await adminClient
          .from('profiles')
          .update({ phone: customerPhone })
          .eq('id', existingUser.id);
      }
    }

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
        phone: customerPhone || null,
      },
    });

  if (createError) {
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  // Update phone in profile (trigger creates profile, then we set phone)
  if (customerPhone) {
    await adminClient
      .from('profiles')
      .update({ phone: customerPhone })
      .eq('id', newUser.user.id);
  }

  return newUser.user.id;
}
