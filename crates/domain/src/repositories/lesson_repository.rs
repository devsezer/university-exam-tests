use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::Lesson;
use crate::errors::DomainError;

/// Repository trait for lesson data access operations.
#[async_trait]
pub trait LessonRepository: Send + Sync {
    /// Creates a new lesson in the database.
    async fn create(&self, lesson: &Lesson) -> Result<Lesson, DomainError>;

    /// Finds a lesson by its unique ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Lesson>, DomainError>;

    /// Finds a lesson by its name.
    async fn find_by_name(&self, name: &str) -> Result<Option<Lesson>, DomainError>;

    /// Lists all lessons.
    async fn list_all(&self) -> Result<Vec<Lesson>, DomainError>;

    /// Updates an existing lesson.
    async fn update(&self, lesson: &Lesson) -> Result<Lesson, DomainError>;

    /// Deletes a lesson by ID.
    async fn delete(&self, id: Uuid) -> Result<(), DomainError>;
}

