-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES policies
-- ============================================
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin" ON profiles
    FOR SELECT USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- ============================================
-- PRODUCTS policies
-- ============================================
-- Members can view published products they have access to
CREATE POLICY "products_select_member" ON products
    FOR SELECT USING (
        is_published = true
        AND EXISTS (
            SELECT 1 FROM member_access
            WHERE member_access.product_id = products.id
            AND member_access.profile_id = auth.uid()
        )
    );

-- Admins have full access to products
CREATE POLICY "products_all_admin" ON products
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- ============================================
-- MODULES policies
-- ============================================
-- Members can view modules of accessible products
CREATE POLICY "modules_select_member" ON modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM member_access
            WHERE member_access.product_id = modules.product_id
            AND member_access.profile_id = auth.uid()
        )
    );

-- Admins have full access to modules
CREATE POLICY "modules_all_admin" ON modules
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- ============================================
-- LESSONS policies
-- ============================================
-- Members can view lessons of accessible products (via module → product)
CREATE POLICY "lessons_select_member" ON lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM modules
            JOIN member_access ON member_access.product_id = modules.product_id
            WHERE modules.id = lessons.module_id
            AND member_access.profile_id = auth.uid()
        )
    );

-- Admins have full access to lessons
CREATE POLICY "lessons_all_admin" ON lessons
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- ============================================
-- MEMBER_ACCESS policies
-- ============================================
-- Members can view their own access records
CREATE POLICY "member_access_select_own" ON member_access
    FOR SELECT USING (profile_id = auth.uid());

-- Admins have full access to member_access
CREATE POLICY "member_access_all_admin" ON member_access
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- ============================================
-- COMMENTS policies
-- ============================================
-- Members can view comments on accessible lessons
CREATE POLICY "comments_select_member" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN member_access ON member_access.product_id = modules.product_id
            WHERE lessons.id = comments.lesson_id
            AND member_access.profile_id = auth.uid()
        )
    );

-- Members can create comments on accessible lessons
CREATE POLICY "comments_insert_member" ON comments
    FOR INSERT WITH CHECK (
        profile_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN member_access ON member_access.product_id = modules.product_id
            WHERE lessons.id = comments.lesson_id
            AND member_access.profile_id = auth.uid()
        )
    );

-- Members can delete their own comments
CREATE POLICY "comments_delete_own" ON comments
    FOR DELETE USING (profile_id = auth.uid());

-- Admins have full access to comments
CREATE POLICY "comments_all_admin" ON comments
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- ============================================
-- LESSON_PROGRESS policies
-- ============================================
-- Members can manage their own progress
CREATE POLICY "lesson_progress_select_own" ON lesson_progress
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "lesson_progress_insert_own" ON lesson_progress
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "lesson_progress_update_own" ON lesson_progress
    FOR UPDATE USING (profile_id = auth.uid());

-- Admins can view all progress
CREATE POLICY "lesson_progress_all_admin" ON lesson_progress
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
