-- Migration: Create badges, member_badges, and streaks tables
-- Story 16.1 — Schema: tabelas badges, member_badges, streaks + RLS

-- ============================================================
-- 1. CREATE TABLES
-- ============================================================

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon_url TEXT,
    criteria JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE member_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, badge_id)
);

CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_member_badges_profile ON member_badges(profile_id);
CREATE INDEX idx_member_badges_badge ON member_badges(badge_id);
CREATE INDEX idx_streaks_profile ON streaks(profile_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY — badges
-- ============================================================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges"
    ON badges FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to badges"
    ON badges FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================================
-- 4. ROW LEVEL SECURITY — member_badges
-- ============================================================

ALTER TABLE member_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own badges"
    ON member_badges FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Admins have full access to member_badges"
    ON member_badges FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Service role bypass: INSERT will be done via admin client (service_role)

-- ============================================================
-- 5. ROW LEVEL SECURITY — streaks
-- ============================================================

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own streak"
    ON streaks FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Admins have full access to streaks"
    ON streaks FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
