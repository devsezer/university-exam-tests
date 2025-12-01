-- Remove subject_id column from test_books table
-- The relationship is now handled through the test_book_subjects junction table

-- Drop the index first
DROP INDEX IF EXISTS idx_test_books_subject;

-- Remove the subject_id column
ALTER TABLE test_books DROP COLUMN IF EXISTS subject_id;

