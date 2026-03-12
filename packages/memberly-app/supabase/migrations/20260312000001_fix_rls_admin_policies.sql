-- ============================================
-- Fix: Admin RLS policies now check profiles table
-- instead of JWT user_metadata (which was never set)
-- ============================================

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES — drop and recreate admin policy
-- ============================================
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_admin" ON profiles
    FOR SELECT USING (public.is_admin());

-- ============================================
-- PRODUCTS — drop and recreate admin policy
-- ============================================
DROP POLICY IF EXISTS "products_all_admin" ON products;
CREATE POLICY "products_all_admin" ON products
    FOR ALL USING (public.is_admin());

-- ============================================
-- MODULES — drop and recreate admin policy
-- ============================================
DROP POLICY IF EXISTS "modules_all_admin" ON modules;
CREATE POLICY "modules_all_admin" ON modules
    FOR ALL USING (public.is_admin());

-- ============================================
-- LESSONS — drop and recreate admin policy
-- ============================================
DROP POLICY IF EXISTS "lessons_all_admin" ON lessons;
CREATE POLICY "lessons_all_admin" ON lessons
    FOR ALL USING (public.is_admin());

-- ============================================
-- MEMBER_ACCESS — drop and recreate admin policy
-- ============================================
DROP POLICY IF EXISTS "member_access_all_admin" ON member_access;
CREATE POLICY "member_access_all_admin" ON member_access
    FOR ALL USING (public.is_admin());

-- ============================================
-- COMMENTS — drop and recreate admin policy
-- ============================================
DROP POLICY IF EXISTS "comments_all_admin" ON comments;
CREATE POLICY "comments_all_admin" ON comments
    FOR ALL USING (public.is_admin());

-- ============================================
-- LESSON_PROGRESS — drop and recreate admin policy
-- ============================================
DROP POLICY IF EXISTS "lesson_progress_all_admin" ON lesson_progress;
CREATE POLICY "lesson_progress_all_admin" ON lesson_progress
    FOR ALL USING (public.is_admin());
