-- Story 8.9: Create lesson_bookmarks table for favorites
CREATE TABLE lesson_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (profile_id, lesson_id)
);

-- RLS: members can only manage their own bookmarks
ALTER TABLE lesson_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON lesson_bookmarks FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own bookmarks"
  ON lesson_bookmarks FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
  ON lesson_bookmarks FOR DELETE
  USING (profile_id = auth.uid());
