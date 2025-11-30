use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::Subject;
use crate::errors::DomainError;

/// Repository trait for subject data access operations.
#[async_trait]
pub trait SubjectRepository: Send + Sync {
    /// Creates a new subject in the database.
    async fn create(&self, subject: &Subject) -> Result<Subject, DomainError>;

    /// Finds a subject by its unique ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Subject>, DomainError>;

    /// Finds subjects by exam type ID.
    async fn find_by_exam_type_id(&self, exam_type_id: Uuid) -> Result<Vec<Subject>, DomainError>;

    /// Finds subjects by lesson ID and exam type ID.
    async fn find_by_lesson_and_exam_type(
        &self,
        lesson_id: Uuid,
        exam_type_id: Uuid,
    ) -> Result<Vec<Subject>, DomainError>;

    /// Updates an existing subject.
    async fn update(&self, subject: &Subject) -> Result<Subject, DomainError>;

    /// Deletes a subject by ID.
    async fn delete(&self, id: Uuid) -> Result<(), DomainError>;

    /// Lists all subjects.
    async fn list_all(&self) -> Result<Vec<Subject>, DomainError>;
}

