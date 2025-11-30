use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// TestResult entity representing a user's test result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResult {
    /// Unique identifier for the test result
    pub id: Uuid,
    /// ID of the user who solved the test
    pub user_id: Uuid,
    /// ID of the practice test that was solved
    pub practice_test_id: Uuid,
    /// User's answers as a string (e.g., "ABCD_BCD..." where _ represents empty)
    pub user_answers: String,
    /// Number of correct answers
    pub correct_count: i32,
    /// Number of wrong answers
    pub wrong_count: i32,
    /// Number of empty answers
    pub empty_count: i32,
    /// Net score calculated as: correct - (wrong / 4.0)
    pub net_score: f64,
    /// Timestamp when the test was solved
    pub solved_at: DateTime<Utc>,
}

impl TestResult {
    /// Creates a new test result with the given details.
    pub fn new(
        user_id: Uuid,
        practice_test_id: Uuid,
        user_answers: String,
        correct_count: i32,
        wrong_count: i32,
        empty_count: i32,
    ) -> Self {
        // Calculate net score: correct - (wrong / 4.0)
        let net_score = correct_count as f64 - (wrong_count as f64 / 4.0);

        Self {
            id: Uuid::new_v4(),
            user_id,
            practice_test_id,
            user_answers,
            correct_count,
            wrong_count,
            empty_count,
            net_score,
            solved_at: Utc::now(),
        }
    }
}

