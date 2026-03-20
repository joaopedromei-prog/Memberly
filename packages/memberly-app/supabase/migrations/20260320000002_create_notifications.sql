-- Migration: Create notifications and notification_preferences tables
-- Story 15.1 — Schema: tabelas notifications e notification_preferences + RLS

-- ============================================================
-- 1. CREATE TABLES
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(profile_id, notification_type)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_notifications_profile_read ON notifications(profile_id, read);
CREATE INDEX idx_notification_preferences_profile ON notification_preferences(profile_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY — notifications
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Members can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Members can delete own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = profile_id);

CREATE POLICY "Admins have full access to notifications"
    ON notifications FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Service role bypass: INSERT will be done via admin client (service_role)
-- No INSERT policy needed for members — notifications are system-generated

-- ============================================================
-- 4. ROW LEVEL SECURITY — notification_preferences
-- ============================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own preferences"
    ON notification_preferences FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Members can update own preferences"
    ON notification_preferences FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Members can insert own preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admins have full access to notification_preferences"
    ON notification_preferences FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
