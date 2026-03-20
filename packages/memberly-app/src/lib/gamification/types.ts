/**
 * Badge criteria types and interfaces for the gamification engine.
 *
 * Story 16.2 — AC11
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/** Supported badge criteria types. */
export type BadgeCriteriaType =
  | 'FIRST_LESSON'
  | 'COURSE_COMPLETE'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'COMMENTS_10'
  | 'EXPLORER_3'
  | 'LESSONS_50';

/** Shape of the `criteria` JSONB column in the `badges` table. */
export interface BadgeCriteria {
  type: BadgeCriteriaType;
  threshold: number;
}

/**
 * A criteria checker function.
 * Returns `true` when the member meets the criterion.
 */
export type CriteriaChecker = (
  profileId: string,
  threshold: number,
  adminClient: SupabaseClient
) => Promise<boolean>;
