use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::ExamType;
use crate::errors::DomainError;

/// Repository trait for exam type data access operations.
#[async_trait]
pub trait ExamTypeRepository: Send + Sync {
    /// Creates a new exam type in the database.
    async fn create(&self, exam_type: &ExamType) -> Result<ExamType, DomainError>;

    /// Finds an exam type by its unique ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<ExamType>, DomainError>;

    /// Finds an exam type by its name (case-insensitive).
    async fn find_by_name(&self, name: &str) -> Result<Option<ExamType>, DomainError>;

    /// Updates an existing exam type.
    async fn update(&self, exam_type: &ExamType) -> Result<ExamType, DomainError>;

    /// Deletes an exam type by ID.
    async fn delete(&self, id: Uuid) -> Result<(), DomainError>;

    /// Lists all exam types.
    async fn list_all(&self) -> Result<Vec<ExamType>, DomainError>;
}

