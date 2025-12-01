-- ============================================================================
-- Initial Database Schema Migration
-- ============================================================================
-- This migration creates the complete database schema for the Deneme Test
-- Platform application. It combines all previous migrations into a single
-- cohesive schema definition.
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- Core user authentication and profile information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create unique indexes (case-insensitive, only for non-deleted users)
CREATE UNIQUE INDEX idx_users_email_unique ON users(LOWER(email)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_username_unique ON users(LOWER(username)) WHERE deleted_at IS NULL;

-- Create other indexes for common queries
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_is_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- 2. REFRESH TOKENS TABLE
-- ============================================================================
-- JWT refresh token storage for authentication
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_reason VARCHAR(50),
    replaced_by UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL,
    user_agent TEXT,
    ip_address INET
);

-- Create unique index on token_hash
CREATE UNIQUE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- Create indexes for common queries
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_refresh_tokens_user_active ON refresh_tokens(user_id, expires_at) 
    WHERE revoked_at IS NULL;

-- ============================================================================
-- 3. EXAM TYPES TABLE
-- ============================================================================
-- Exam type definitions (TYT, AYT, etc.)
CREATE TABLE exam_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_exam_types_name ON exam_types(name);
CREATE INDEX idx_exam_types_created_at ON exam_types(created_at DESC);

-- ============================================================================
-- 4. LESSONS TABLE
-- ============================================================================
-- Lesson definitions (Matematik, Türkçe, etc.) - exam type independent
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_lessons_name ON lessons(name);
CREATE INDEX idx_lessons_created_at ON lessons(created_at DESC);

-- ============================================================================
-- 5. SUBJECTS TABLE
-- ============================================================================
-- Subject definitions linked to lessons and exam types
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    exam_type_id UUID NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT subjects_name_lesson_exam_type_unique UNIQUE(name, lesson_id, exam_type_id)
);

-- Create indexes for common queries
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_subjects_exam_type ON subjects(exam_type_id);
CREATE INDEX idx_subjects_lesson_id ON subjects(lesson_id);
CREATE INDEX idx_subjects_created_at ON subjects(created_at DESC);

-- ============================================================================
-- 6. ROLES TABLE
-- ============================================================================
-- Role definitions for RBAC (Role-Based Access Control)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for role name lookups
CREATE INDEX idx_roles_name ON roles(name);

-- Insert default roles
INSERT INTO roles (name, description, is_system) VALUES
    ('admin', 'Administrator with full system access', true),
    ('user', 'Regular authenticated user', true);

-- ============================================================================
-- 7. USER ROLES JUNCTION TABLE
-- ============================================================================
-- Many-to-many relationship between users and roles
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ============================================================================
-- 8. TEST BOOKS TABLE
-- ============================================================================
-- Test book definitions linked to exam types and lessons
CREATE TABLE test_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    exam_type_id UUID NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    published_year SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_test_books_name ON test_books(name);
CREATE INDEX idx_test_books_exam_type ON test_books(exam_type_id);
CREATE INDEX idx_test_books_lesson_id ON test_books(lesson_id);
CREATE INDEX idx_test_books_lesson_exam_type ON test_books(lesson_id, exam_type_id);
CREATE INDEX idx_test_books_created_at ON test_books(created_at DESC);

-- ============================================================================
-- 9. TEST BOOK SUBJECTS JUNCTION TABLE
-- ============================================================================
-- Many-to-many relationship between test books and subjects
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

-- ============================================================================
-- 10. PRACTICE TESTS TABLE
-- ============================================================================
-- Practice test definitions linked to test books and subjects
CREATE TABLE practice_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    test_number INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    answer_key TEXT NOT NULL,
    test_book_id UUID NOT NULL REFERENCES test_books(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT practice_tests_test_book_subject_number_unique 
        UNIQUE(test_book_id, subject_id, test_number)
);

-- Create indexes for common queries
CREATE INDEX idx_practice_tests_name ON practice_tests(name);
CREATE INDEX idx_practice_tests_test_book ON practice_tests(test_book_id);
CREATE INDEX idx_practice_tests_subject ON practice_tests(subject_id);
CREATE INDEX idx_practice_tests_test_number ON practice_tests(test_book_id, test_number);
CREATE INDEX idx_practice_tests_created_at ON practice_tests(created_at DESC);

-- ============================================================================
-- 11. TEST RESULTS TABLE
-- ============================================================================
-- Test result storage for user test attempts
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practice_test_id UUID NOT NULL REFERENCES practice_tests(id) ON DELETE CASCADE,
    user_answers TEXT NOT NULL,
    correct_count INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL,
    empty_count INTEGER NOT NULL,
    net_score DOUBLE PRECISION NOT NULL,
    solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_test_results_practice_test ON test_results(practice_test_id);
CREATE INDEX idx_test_results_user_practice_test ON test_results(user_id, practice_test_id);
CREATE INDEX idx_test_results_solved_at ON test_results(solved_at DESC);
CREATE INDEX idx_test_results_net_score ON test_results(net_score DESC);

-- ============================================================================
-- 12. DEFAULT ADMIN USER
-- ============================================================================
-- Create default admin user
-- Username: admin
-- Email: admin@example.com  
-- Password: Admin123!
-- 
-- IMPORTANT: This is a default admin user. Please change the password after first login!
-- 
-- Note: The password hash below needs to be generated using the application's PasswordService.
-- To generate a real hash, you can:
-- 1. Run the application and use the password service to hash "Admin123!"
-- 2. Or manually create a user through the registration endpoint and then assign admin role
-- 
-- For now, this migration creates the user structure. You'll need to update the password_hash
-- with a real Argon2id hash before using this account.
-- 
-- Argon2id format: $argon2id$v=19$m=19456,t=2,p=1$<base64_salt>$<base64_hash>
INSERT INTO users (id, username, email, password_hash, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'admin',
    'admin@example.com',
    -- TODO: Replace this with a real Argon2id hash for "Admin123!"
    -- You can generate it by running the application and using PasswordService
    -- Example format: $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>
    '$argon2id$v=19$m=19456,t=2,p=1$dGVzdF9zYWx0X2Zvcl9hZG1pbg$dGVzdF9oYXNoX3BsYWNlaG9sZGVyX3VwZGF0ZV9tZV9hZnRlcl9taWdyYXRpb24',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users 
    WHERE LOWER(username) = 'admin' 
    AND deleted_at IS NULL
);

-- Add new user
INSERT INTO users (id, username, email, password_hash, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'drsezer',
    'info@sezer.net',
    '$argon2id$v=19$m=19456,t=2,p=1$kpGA72ww99F+sW9wlLd4UA$l2yltHw3UYyAf/nVNEpn8LEBxnVnhNziefyXoYNQ+7E',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users 
    WHERE LOWER(username) = 'drsezer' 
    AND deleted_at IS NULL
);

-- Assign user role to the test user
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, r.id, NOW()
FROM users u
-- Assign admin role to the admin user
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, r.id, NOW()
FROM users u
CROSS JOIN roles r
WHERE u.username = 'admin' 
  AND r.name = 'admin'
  AND u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Assign default 'user' role to all existing users (except admin)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'user' 
  AND u.deleted_at IS NULL
  AND u.username != 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- ============================================================================
-- Migration Complete
-- ============================================================================

