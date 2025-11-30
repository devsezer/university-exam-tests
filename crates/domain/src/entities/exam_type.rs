use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// ExamType entity representing a type of exam (e.g., TYT, AYT).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExamType {
    /// Unique identifier for the exam type
    pub id: Uuid,
    /// Name of the exam type (e.g., "TYT", "AYT")
    pub name: String,
    /// Optional description of the exam type
    pub description: Option<String>,
    /// Timestamp when the exam type was created
    pub created_at: DateTime<Utc>,
}

impl ExamType {
    /// Creates a new exam type with the given details.
    pub fn new(name: String, description: Option<String>) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            description,
            created_at: Utc::now(),
        }
    }
}

