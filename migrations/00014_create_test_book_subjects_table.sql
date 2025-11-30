-- Create test_book_subjects junction table for many-to-many relationship
CREATE TABLE test_book_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_book_id UUID NOT NULL REFERENCES test_books(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(test_book_id, subject_id)
);

-- Create indexes for common queries
CREATE INDEX idx_test_book_subjects_book ON test_book_subjects(test_book_id);
CREATE INDEX idx_test_book_subjects_subject ON test_book_subjects(subject_id);
CREATE INDEX idx_test_book_subjects_created_at ON test_book_subjects(created_at DESC);

