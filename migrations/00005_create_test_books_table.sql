-- Create test_books table
CREATE TABLE test_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    exam_type_id UUID NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    published_year SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_test_books_name ON test_books(name);
CREATE INDEX idx_test_books_exam_type ON test_books(exam_type_id);
CREATE INDEX idx_test_books_subject ON test_books(subject_id);
CREATE INDEX idx_test_books_created_at ON test_books(created_at DESC);

