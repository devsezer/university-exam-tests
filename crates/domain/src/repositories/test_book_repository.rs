use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::TestBook;
use crate::errors::DomainError;

/// Repository trait for test book data access operations.
#[async_trait]
pub trait TestBookRepository: Send + Sync {
    /// Creates a new test book in the database.
    async fn create(&self, test_book: &TestBook) -> Result<TestBook, DomainError>;

    /// Finds a test book by its unique ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<TestBook>, DomainError>;

    /// Finds test books by subject ID.
    async fn find_by_subject_id(&self, subject_id: Uuid) -> Result<Vec<TestBook>, DomainError>;

    /// Finds test books by exam type ID.
    async fn find_by_exam_type_id(&self, exam_type_id: Uuid) -> Result<Vec<TestBook>, DomainError>;

    /// Updates an existing test book.
    async fn update(&self, test_book: &TestBook) -> Result<TestBook, DomainError>;

    /// Deletes a test book by ID.
    async fn delete(&self, id: Uuid) -> Result<(), DomainError>;

    /// Lists all test books.
    async fn list_all(&self) -> Result<Vec<TestBook>, DomainError>;
}

