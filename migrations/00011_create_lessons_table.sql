-- Create lessons table (exam type independent)
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_lessons_name ON lessons(name);
CREATE INDEX idx_lessons_created_at ON lessons(created_at DESC);

