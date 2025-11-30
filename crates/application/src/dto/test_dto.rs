use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

// ExamType DTOs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExamTypeResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct CreateExamTypeRequest {
    #[validate(length(min = 1, max = 50, message = "Name must be between 1 and 50 characters"))]
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct UpdateExamTypeRequest {
    #[validate(length(min = 1, max = 50, message = "Name must be between 1 and 50 characters"))]
    pub name: Option<String>,
    pub description: Option<String>,
}

// Subject DTOs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubjectResponse {
    pub id: Uuid,
    pub name: String,
    pub exam_type_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct CreateSubjectRequest {
    #[validate(length(min = 1, max = 100, message = "Name must be between 1 and 100 characters"))]
    pub name: String,
    pub exam_type_id: Uuid,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct UpdateSubjectRequest {
    #[validate(length(min = 1, max = 100, message = "Name must be between 1 and 100 characters"))]
    pub name: Option<String>,
    pub exam_type_id: Option<Uuid>,
}

// TestBook DTOs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestBookResponse {
    pub id: Uuid,
    pub name: String,
    pub exam_type_id: Uuid,
    pub subject_id: Uuid,
    pub published_year: u16,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct CreateTestBookRequest {
    #[validate(length(min = 1, max = 255, message = "Name must be between 1 and 255 characters"))]
    pub name: String,
    pub exam_type_id: Uuid,
    pub subject_id: Uuid,
    #[validate(range(min = 2000, max = 2100, message = "Published year must be between 2000 and 2100"))]
    pub published_year: u16,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct UpdateTestBookRequest {
    #[validate(length(min = 1, max = 255, message = "Name must be between 1 and 255 characters"))]
    pub name: Option<String>,
    pub exam_type_id: Option<Uuid>,
    pub subject_id: Option<Uuid>,
    #[validate(range(min = 2000, max = 2100, message = "Published year must be between 2000 and 2100"))]
    pub published_year: Option<u16>,
}

// PracticeTest DTOs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PracticeTestResponse {
    pub id: Uuid,
    pub name: String,
    pub test_number: i32,
    pub question_count: i32,
    pub answer_key: String,
    pub test_book_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct CreatePracticeTestRequest {
    #[validate(length(min = 1, max = 255, message = "Name must be between 1 and 255 characters"))]
    pub name: String,
    #[validate(range(min = 1, message = "Test number must be at least 1"))]
    pub test_number: i32,
    #[validate(range(min = 1, message = "Question count must be at least 1"))]
    pub question_count: i32,
    #[validate(length(min = 1, message = "Answer key is required"))]
    pub answer_key: String,
    pub test_book_id: Uuid,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct UpdatePracticeTestRequest {
    #[validate(length(min = 1, max = 255, message = "Name must be between 1 and 255 characters"))]
    pub name: Option<String>,
    #[validate(range(min = 1, message = "Test number must be at least 1"))]
    pub test_number: Option<i32>,
    #[validate(range(min = 1, message = "Question count must be at least 1"))]
    pub question_count: Option<i32>,
    #[validate(length(min = 1, message = "Answer key is required"))]
    pub answer_key: Option<String>,
    pub test_book_id: Option<Uuid>,
}

// TestResult DTOs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResultResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub practice_test_id: Uuid,
    pub user_answers: String,
    pub correct_count: i32,
    pub wrong_count: i32,
    pub empty_count: i32,
    pub net_score: f64,
    pub solved_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct SolveTestRequest {
    #[validate(length(min = 1, message = "User answers are required"))]
    pub user_answers: String, // "ABCD_BCD..." format
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolveTestResponse {
    pub result: TestResultResponse,
    pub can_retake: bool,
    pub hours_until_retake: Option<f64>,
}

