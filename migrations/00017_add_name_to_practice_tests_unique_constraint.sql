-- Add name field to practice_tests unique constraint
-- Allows same test number with different names within the same book-subject combination
-- Prevents exact duplicates (same book + subject + name + number)

-- Drop existing unique constraint
ALTER TABLE practice_tests 
DROP CONSTRAINT IF EXISTS practice_tests_test_book_subject_number_unique;

-- Add new unique constraint with name included
-- Prevents duplicate test name + number combinations for the same book-subject
ALTER TABLE practice_tests 
ADD CONSTRAINT practice_tests_book_subject_name_number_unique 
UNIQUE(test_book_id, subject_id, name, test_number);

