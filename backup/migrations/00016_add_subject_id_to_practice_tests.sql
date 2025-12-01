-- Add subject_id column to practice_tests table
-- Each practice test now belongs to a specific subject within a test book

-- Add subject_id column with foreign key constraint
ALTER TABLE practice_tests 
ADD COLUMN subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE;

-- Drop existing unique constraint
ALTER TABLE practice_tests 
DROP CONSTRAINT IF EXISTS practice_tests_test_book_id_test_number_key;

-- Add new unique constraint with subject_id
-- Prevents duplicate test numbers for the same book-subject combination
ALTER TABLE practice_tests 
ADD CONSTRAINT practice_tests_test_book_subject_number_unique 
UNIQUE(test_book_id, subject_id, test_number);

-- Create index for subject_id to improve query performance
CREATE INDEX idx_practice_tests_subject ON practice_tests(subject_id);

