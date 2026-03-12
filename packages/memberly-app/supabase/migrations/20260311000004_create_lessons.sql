-- Create lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    video_provider TEXT NOT NULL CHECK (video_provider IN ('youtube', 'pandavideo')),
    video_id TEXT NOT NULL DEFAULT '',
    pdf_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_module ON lessons(module_id);
