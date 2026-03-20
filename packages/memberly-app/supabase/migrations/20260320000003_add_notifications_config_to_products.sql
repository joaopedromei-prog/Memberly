-- Story 15.6 — AC1
-- Add notifications_config JSONB column to products table
-- Controls which notification types are enabled per product
ALTER TABLE products
ADD COLUMN notifications_config JSONB NOT NULL DEFAULT '{"NEW_LESSON": true, "COMMENT_REPLY": true, "COURSE_COMPLETED": true}'::jsonb;
