-- Create subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    exam_type_id UUID NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, exam_type_id)
);

-- Create indexes for common queries
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_subjects_exam_type ON subjects(exam_type_id);
CREATE INDEX idx_subjects_created_at ON subjects(created_at DESC);

