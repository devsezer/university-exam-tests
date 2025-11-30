-- Add lesson_id column to test_books table
ALTER TABLE test_books ADD COLUMN lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE;

-- Create indexes for lesson_id queries
CREATE INDEX idx_test_books_lesson_id ON test_books(lesson_id);
CREATE INDEX idx_test_books_lesson_exam_type ON test_books(lesson_id, exam_type_id);

