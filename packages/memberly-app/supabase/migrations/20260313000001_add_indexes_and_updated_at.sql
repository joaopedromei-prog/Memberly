-- Migration: Add composite indexes for sort operations and updated_at audit columns
-- Story 10.4 — Brownfield Discovery remediation

-- ============================================================
-- 1. COMPOSITE INDEXES for frequently sorted queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_modules_product_sort
  ON modules(product_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_lessons_module_sort
  ON lessons(module_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_comments_lesson_created
  ON comments(lesson_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson
  ON lesson_progress(lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_lesson
  ON lesson_bookmarks(lesson_id);

-- ============================================================
-- 2. ADD updated_at COLUMNS where missing
-- ============================================================

-- modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE modules SET updated_at = created_at WHERE updated_at IS NULL;

-- lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE lessons SET updated_at = created_at WHERE updated_at IS NULL;

-- comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE comments SET updated_at = created_at WHERE updated_at IS NULL;

-- lesson_progress
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE lesson_progress SET updated_at = created_at WHERE updated_at IS NULL;

-- member_access
ALTER TABLE member_access ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE member_access SET updated_at = granted_at WHERE updated_at IS NULL;

-- ============================================================
-- 3. CREATE TRIGGERS for auto-updating updated_at
-- Uses existing update_updated_at_column() function from migration 1
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_modules_updated_at') THEN
    CREATE TRIGGER set_modules_updated_at
      BEFORE UPDATE ON modules
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_lessons_updated_at') THEN
    CREATE TRIGGER set_lessons_updated_at
      BEFORE UPDATE ON lessons
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_comments_updated_at') THEN
    CREATE TRIGGER set_comments_updated_at
      BEFORE UPDATE ON comments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_lesson_progress_updated_at') THEN
    CREATE TRIGGER set_lesson_progress_updated_at
      BEFORE UPDATE ON lesson_progress
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_member_access_updated_at') THEN
    CREATE TRIGGER set_member_access_updated_at
      BEFORE UPDATE ON member_access
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
