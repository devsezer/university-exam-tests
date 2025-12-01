-- Create exam_types table
CREATE TABLE exam_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_exam_types_name ON exam_types(name);
CREATE INDEX idx_exam_types_created_at ON exam_types(created_at DESC);

