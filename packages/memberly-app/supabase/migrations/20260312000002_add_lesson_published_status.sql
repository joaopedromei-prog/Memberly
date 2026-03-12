-- Add is_published column to lessons table
ALTER TABLE lessons ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;

-- Update existing lessons to be published (backward compatibility)
UPDATE lessons SET is_published = true;

-- Update RLS policy: members can only see published lessons
-- Drop existing lesson select policy if exists and recreate
DROP POLICY IF EXISTS "Members can view lessons of accessible products" ON lessons;
CREATE POLICY "Members can view published lessons of accessible products" ON lessons
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM modules m
      JOIN member_access ma ON ma.product_id = m.product_id
      WHERE m.id = lessons.module_id
      AND ma.profile_id = auth.uid()
    )
  );

-- Admin can see all lessons (published or not)
DROP POLICY IF EXISTS "Admins can do everything with lessons" ON lessons;
CREATE POLICY "Admins can do everything with lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
