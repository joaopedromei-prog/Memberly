-- Migration: Create certificates table for course completion certificates
-- Story 14.1 — Schema e Migration da Tabela certificates

-- ============================================================
-- 1. CREATE TABLE
-- ============================================================

CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    certificate_url TEXT,
    hash TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, product_id)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_certificates_profile ON certificates(profile_id);
CREATE INDEX idx_certificates_hash ON certificates(hash);

-- ============================================================
-- 3. TRIGGER for auto-updating updated_at
-- Uses existing update_updated_at_column() function from migration 1
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_certificates_updated_at') THEN
    CREATE TRIGGER set_certificates_updated_at
      BEFORE UPDATE ON certificates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own certificates"
    ON certificates FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Admins have full access to certificates"
    ON certificates FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
