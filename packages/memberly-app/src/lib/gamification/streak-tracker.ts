import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Updates the streak for a given member profile.
 *
 * Logic (all dates in UTC, date-part only):
 * - last_activity_date = today  -> no-op (already registered today)
 * - last_activity_date = yesterday -> increment current_streak
 * - last_activity_date < yesterday or null -> reset current_streak to 1
 * - Always updates longest_streak = max(current, longest)
 * - Creates a new record if none exists (UPSERT pattern)
 *
 * Uses admin client (service role) to bypass RLS.
 */
export async function updateStreak(profileId: string): Promise<void> {
  const adminClient = createAdminClient();

  // Get current date in UTC (date only, no time)
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Get existing streak
  const { data: streak } = await adminClient
    .from('streaks')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (!streak) {
    // No streak record — create new (AC7)
    await adminClient.from('streaks').insert({
      profile_id: profileId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    });
    return;
  }

  // Already registered today — no-op (AC2)
  if (streak.last_activity_date === today) return;

  let newStreak: number;

  if (streak.last_activity_date === yesterday) {
    // Consecutive day — increment (AC3)
    newStreak = streak.current_streak + 1;
  } else {
    // Gap or null — reset (AC4)
    newStreak = 1;
  }

  // Always update longest_streak (AC5)
  const newLongest = Math.max(newStreak, streak.longest_streak);

  // Update streak record (AC6)
  await adminClient
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', profileId);
}
