use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::TestResult;
use crate::errors::DomainError;

/// Repository trait for test result data access operations.
#[async_trait]
pub trait TestResultRepository: Send + Sync {
    /// Creates a new test result in the database.
    async fn create(&self, test_result: &TestResult) -> Result<TestResult, DomainError>;

    /// Finds a test result by its unique ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<TestResult>, DomainError>;

    /// Finds test results by user ID.
    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<TestResult>, DomainError>;

    /// Finds test results by practice test ID.
    async fn find_by_practice_test_id(&self, practice_test_id: Uuid) -> Result<Vec<TestResult>, DomainError>;

    /// Finds a test result by user ID and practice test ID.
    async fn find_by_user_and_practice_test(
        &self,
        user_id: Uuid,
        practice_test_id: Uuid,
    ) -> Result<Option<TestResult>, DomainError>;

    /// Finds the most recent test result for a user and practice test.
    /// Used to check if user can retake the test (24 hour rule).
    async fn find_latest_by_user_and_practice_test(
        &self,
        user_id: Uuid,
        practice_test_id: Uuid,
    ) -> Result<Option<TestResult>, DomainError>;

    /// Lists test results with pagination.
    async fn list(
        &self,
        user_id: Option<Uuid>,
        practice_test_id: Option<Uuid>,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<TestResult>, u64), DomainError>;
}

