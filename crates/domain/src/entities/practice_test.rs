use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// PracticeTest entity representing a practice test within a test book.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PracticeTest {
    /// Unique identifier for the practice test
    pub id: Uuid,
    /// Name of the practice test (e.g., "Deneme 1")
    pub name: String,
    /// Test number within the book (1, 2, 3...)
    pub test_number: i32,
    /// Number of questions in this test
    pub question_count: i32,
    /// Answer key as a string (e.g., "ABCDABCD..." or JSON)
    pub answer_key: String,
    /// ID of the test book this practice test belongs to
    pub test_book_id: Uuid,
    /// Timestamp when the practice test was created
    pub created_at: DateTime<Utc>,
}

impl PracticeTest {
    /// Creates a new practice test with the given details.
    pub fn new(
        name: String,
        test_number: i32,
        question_count: i32,
        answer_key: String,
        test_book_id: Uuid,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            test_number,
            question_count,
            answer_key,
            test_book_id,
            created_at: Utc::now(),
        }
    }
}

