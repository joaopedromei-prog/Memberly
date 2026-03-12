-- Add attachments column to lessons (JSONB array of file objects)
ALTER TABLE lessons ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;

-- Migrate existing pdf_url data to attachments format
UPDATE lessons
SET attachments = jsonb_build_array(
  jsonb_build_object(
    'name', split_part(pdf_url, '/', -1),
    'url', pdf_url,
    'type', 'application/pdf',
    'size', 0
  )
)
WHERE pdf_url IS NOT NULL AND pdf_url != '';
