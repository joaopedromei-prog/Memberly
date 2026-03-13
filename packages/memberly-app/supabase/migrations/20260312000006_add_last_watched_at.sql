-- Story 8.8: Add last_watched_at column to lesson_progress
-- Tracks when a member last accessed a lesson (not just completion)

ALTER TABLE lesson_progress
ADD COLUMN last_watched_at TIMESTAMPTZ DEFAULT now();

-- Backfill existing rows: use completed_at if available, otherwise fall back to created_at-like behavior
UPDATE lesson_progress
SET last_watched_at = COALESCE(completed_at, now());

-- Ensure unique constraint exists for upsert support
-- (profile_id, lesson_id) should already be unique, but add if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lesson_progress_profile_lesson_unique'
  ) THEN
    ALTER TABLE lesson_progress
    ADD CONSTRAINT lesson_progress_profile_lesson_unique
    UNIQUE (profile_id, lesson_id);
  END IF;
END $$;
