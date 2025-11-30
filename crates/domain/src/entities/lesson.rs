use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Lesson entity representing a lesson/course (e.g., Mathematics, Turkish).
/// Lessons are independent of exam types and can be associated with multiple subjects.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lesson {
    /// Unique identifier for the lesson
    pub id: Uuid,
    /// Name of the lesson (e.g., "Matematik", "Türkçe")
    pub name: String,
    /// Timestamp when the lesson was created
    pub created_at: DateTime<Utc>,
}

impl Lesson {
    /// Creates a new lesson with the given name.
    pub fn new(name: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            created_at: Utc::now(),
        }
    }
}

