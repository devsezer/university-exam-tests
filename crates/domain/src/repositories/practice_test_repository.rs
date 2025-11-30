use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::PracticeTest;
use crate::errors::DomainError;

/// Repository trait for practice test data access operations.
#[async_trait]
pub trait PracticeTestRepository: Send + Sync {
    /// Creates a new practice test in the database.
    async fn create(&self, practice_test: &PracticeTest) -> Result<PracticeTest, DomainError>;

    /// Finds a practice test by its unique ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<PracticeTest>, DomainError>;

    /// Finds practice tests by test book ID.
    async fn find_by_test_book_id(&self, test_book_id: Uuid) -> Result<Vec<PracticeTest>, DomainError>;

    /// Updates an existing practice test.
    async fn update(&self, practice_test: &PracticeTest) -> Result<PracticeTest, DomainError>;

    /// Deletes a practice test by ID.
    async fn delete(&self, id: Uuid) -> Result<(), DomainError>;

    /// Lists all practice tests.
    async fn list_all(&self) -> Result<Vec<PracticeTest>, DomainError>;
}

