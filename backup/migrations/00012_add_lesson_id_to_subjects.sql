-- Add lesson_id column to subjects table
ALTER TABLE subjects ADD COLUMN lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE;

-- Update unique constraint (drop old, add new with lesson_id)
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_name_exam_type_id_key;
ALTER TABLE subjects ADD CONSTRAINT subjects_name_lesson_exam_type_unique UNIQUE(name, lesson_id, exam_type_id);

-- Create index for lesson_id
CREATE INDEX idx_subjects_lesson_id ON subjects(lesson_id);

