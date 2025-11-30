use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// TestBook entity representing a test book (e.g., "Limit Yayınları TYT Matematik").
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestBook {
    /// Unique identifier for the test book
    pub id: Uuid,
    /// Name of the test book
    pub name: String,
    /// ID of the exam type this test book belongs to
    pub exam_type_id: Uuid,
    /// ID of the subject this test book belongs to
    pub subject_id: Uuid,
    /// Published year of the test book
    pub published_year: u16,
    /// Timestamp when the test book was created
    pub created_at: DateTime<Utc>,
}

impl TestBook {
    /// Creates a new test book with the given details.
    pub fn new(
        name: String,
        exam_type_id: Uuid,
        subject_id: Uuid,
        published_year: u16,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            exam_type_id,
            subject_id,
            published_year,
            created_at: Utc::now(),
        }
    }
}

