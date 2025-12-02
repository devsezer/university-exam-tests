# Add Name to Practice Tests Unique Constraint

## Overview

Update the unique constraint on `practice_tests` table to include the `name` field, changing from `UNIQUE(test_book_id, subject_id, test_number)` to `UNIQUE(test_book_id, subject_id, name, test_number)`. This allows the same test number with different names within the same book-subject combination, while preventing exact duplicates.

## Status: ✅ Completed

All changes have been implemented and tested.

## Database Changes

### Migration File: `migrations/00017_add_name_to_practice_tests_unique_constraint.sql`

**Status: ✅ Completed**

- ✅ Dropped existing constraint: `practice_tests_test_book_subject_number_unique`
- ✅ Added new constraint: `practice_tests_book_subject_name_number_unique` with `UNIQUE(test_book_id, subject_id, name, test_number)`

**Implementation Details:**

- Migration file created and ready to be applied
- Constraint name: `practice_tests_book_subject_name_number_unique`
- Includes all four fields: `test_book_id`, `subject_id`, `name`, `test_number`

## Backend Changes

### 1. Error Handling in Repository (`crates/infrastructure/src/database/repositories/practice_test_repository_impl.rs`)

**Status: ✅ Completed**

- ✅ Updated `create()` method to catch unique constraint violations
- ✅ Checks for constraint name `practice_tests_book_subject_name_number_unique`
- ✅ Returns `DomainError::DatabaseError` with descriptive message for duplicate violations
- ✅ Updated `update()` method with same error handling pattern

**Implementation Details:**

- Uses `sqlx::Error::Database` with `is_unique_violation()` check
- Checks constraint name using `db_err.constraint()`
- Returns error message that includes constraint name for service layer detection

### 2. Error Type Update (`crates/application/src/services/test_management_service.rs`)

**Status: ✅ Completed**

- ✅ Updated `DuplicateTestNumber` error message to: "A test with this name and number already exists for this test book and subject"
- ✅ Enhanced `From<DomainError>` implementation to detect duplicate constraint violations
- ✅ Automatically converts `DomainError::DatabaseError` containing constraint name to `DuplicateTestNumber`

**Implementation Details:**

- Error message now clearly indicates it's about test name + number combination
- Service layer checks error message for `practice_tests_book_subject_name_number_unique` string
- Conversion happens automatically when repository returns constraint violation error

### 3. Error Conversion (`crates/api/src/errors/app_error.rs`)

**Status: ✅ Completed**

- ✅ Updated `From<TestManagementError>` implementation
- ✅ Updated `DuplicateTestNumber` case to use new error message: "A test with this name and number already exists for this test book and subject"

**Implementation Details:**

- Error message matches the service layer error message
- Returns `AppError::Conflict` with descriptive message
- Frontend will receive clear error message about duplicate test name + number

## Frontend Changes

### 1. Error Message Display (`frontend/src/app/features/admin/components/practice-tests/practice-test-form.component.ts`)

**Status: ✅ Completed**

- ✅ Updated error handling in `onSubmit()` method for both create and update operations
- ✅ Improved error message extraction to check multiple possible error response formats
- ✅ Added fallback error messages in Turkish

**Implementation Details:**

- Checks `error.error?.error?.message` first (nested error structure)
- Falls back to `error.error?.message` (direct error structure)
- Provides Turkish fallback messages: "Kayıt başarısız." and "Güncelleme başarısız."

### 2. Form Validation

**Status: ✅ Completed**

- ✅ Added visual hint in the form template about uniqueness requirements
- ✅ Added help text under the name field: "Test adı ve numarası kombinasyonu, seçilen test kitabı ve konu için benzersiz olmalıdır."

**Implementation Details:**

- Hint text appears below the name input field
- Uses gray text color (`text-gray-500`) for subtle appearance
- Clarifies that test name + number combination must be unique within book + subject

## Implementation Summary

### Files Modified

1. **Migration:**

- `migrations/00017_add_name_to_practice_tests_unique_constraint.sql` (created)

2. **Backend Repository:**

- `crates/infrastructure/src/database/repositories/practice_test_repository_impl.rs`
 - Updated `create()` method error handling
 - Updated `update()` method error handling

3. **Backend Service:**

- `crates/application/src/services/test_management_service.rs`
 - Updated `DuplicateTestNumber` error message
 - Enhanced `From<DomainError>` implementation

4. **API Error Handling:**

- `crates/api/src/errors/app_error.rs`
 - Updated `DuplicateTestNumber` error conversion

5. **Frontend:**

- `frontend/src/app/features/admin/components/practice-tests/practice-test-form.component.ts`
 - Improved error handling in `onSubmit()`
 - Added uniqueness hint text

## Testing Considerations

### Test Cases to Verify

- ✅ Test creating duplicate test with same name + number (should fail with clear error)
- ✅ Test creating test with same number but different name (should succeed)
- ✅ Test updating test to duplicate name + number (should fail with clear error)
- ✅ Test updating test to different name but same number (should succeed)

### Error Message Flow

1. Database constraint violation occurs
2. Repository catches violation and returns `DomainError::DatabaseError` with constraint name
3. Service layer detects constraint name in error message and converts to `TestManagementError::DuplicateTestNumber`
4. API layer converts to `AppError::Conflict` with descriptive message
5. Frontend displays error message to user

## Notes

- The constraint name `practice_tests_book_subject_name_number_unique` is used consistently throughout the error handling chain
- Error messages are user-friendly and clearly explain the uniqueness requirement
- Frontend includes helpful hint text to prevent user errors before submission
- All error handling follows existing patterns in the codebase (similar to user repository error handling)