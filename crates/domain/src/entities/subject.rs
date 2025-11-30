use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Subject entity representing a subject/course (e.g., Mathematics, Turkish).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subject {
    /// Unique identifier for the subject
    pub id: Uuid,
    /// Name of the subject (e.g., "Matematik", "Türkçe")
    pub name: String,
    /// ID of the lesson this subject belongs to
    pub lesson_id: Uuid,
    /// ID of the exam type this subject belongs to
    pub exam_type_id: Uuid,
    /// Timestamp when the subject was created
    pub created_at: DateTime<Utc>,
}

impl Subject {
    /// Creates a new subject with the given details.
    pub fn new(name: String, lesson_id: Uuid, exam_type_id: Uuid) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            lesson_id,
            exam_type_id,
            created_at: Utc::now(),
        }
    }
}

