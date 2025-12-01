-- Create practice_tests table
CREATE TABLE practice_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    test_number INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    answer_key TEXT NOT NULL,
    test_book_id UUID NOT NULL REFERENCES test_books(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(test_book_id, test_number)
);

-- Create indexes for common queries
CREATE INDEX idx_practice_tests_name ON practice_tests(name);
CREATE INDEX idx_practice_tests_test_book ON practice_tests(test_book_id);
CREATE INDEX idx_practice_tests_test_number ON practice_tests(test_book_id, test_number);
CREATE INDEX idx_practice_tests_created_at ON practice_tests(created_at DESC);

