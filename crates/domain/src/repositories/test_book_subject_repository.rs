use async_trait::async_trait;
use uuid::Uuid;

use crate::errors::DomainError;

/// Repository trait for test book-subject junction table operations.
#[async_trait]
pub trait TestBookSubjectRepository: Send + Sync {
    /// Adds a subject to a test book.
    async fn add_subject(
        &self,
        test_book_id: Uuid,
        subject_id: Uuid,
    ) -> Result<(), DomainError>;

    /// Removes a subject from a test book.
    async fn remove_subject(
        &self,
        test_book_id: Uuid,
        subject_id: Uuid,
    ) -> Result<(), DomainError>;

    /// Sets all subjects for a test book (replaces existing relationships).
    async fn set_subjects(
        &self,
        test_book_id: Uuid,
        subject_ids: &[Uuid],
    ) -> Result<(), DomainError>;

    /// Finds all subject IDs for a test book.
    async fn find_subject_ids_by_test_book_id(
        &self,
        test_book_id: Uuid,
    ) -> Result<Vec<Uuid>, DomainError>;

    /// Finds all test book IDs for a subject.
    async fn find_test_book_ids_by_subject_id(
        &self,
        subject_id: Uuid,
    ) -> Result<Vec<Uuid>, DomainError>;

    /// Deletes all relationships for a test book.
    async fn delete_by_test_book_id(&self, test_book_id: Uuid) -> Result<(), DomainError>;
}

