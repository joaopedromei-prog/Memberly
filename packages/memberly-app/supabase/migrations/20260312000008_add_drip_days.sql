-- Story 8.6: Add drip_days to modules and lessons
-- null = available immediately, integer = days after purchase

ALTER TABLE modules ADD COLUMN drip_days INTEGER DEFAULT NULL;
ALTER TABLE lessons ADD COLUMN drip_days INTEGER DEFAULT NULL;
