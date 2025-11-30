use chrono::{DateTime, Utc};
use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

/// Response for lesson.
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct LessonResponse {
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    #[schema(example = "Matematik")]
    pub name: String,
    pub created_at: DateTime<Utc>,
}

/// Response for exam type.
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct ExamTypeResponse {
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    #[schema(example = "TYT")]
    pub name: String,
    #[schema(example = "Temel Yeterlilik Testi")]
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Response for subject.
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct SubjectResponse {
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    #[schema(example = "Matematik")]
    pub name: String,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub lesson_id: Uuid,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440002")]
    pub exam_type_id: Uuid,
    pub created_at: DateTime<Utc>,
}

/// Response for test book.
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct TestBookResponse {
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    #[schema(example = "Limit Yayınları TYT Matematik")]
    pub name: String,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub lesson_id: Uuid,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440002")]
    pub exam_type_id: Uuid,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440003")]
    pub subject_id: Uuid,
    #[schema(example = 2024)]
    pub published_year: u16,
    pub created_at: DateTime<Utc>,
}

/// Response for practice test.
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct PracticeTestResponse {
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    #[schema(example = "Deneme 1")]
    pub name: String,
    #[schema(example = 1)]
    pub test_number: i32,
    #[schema(example = 40)]
    pub question_count: i32,
    #[schema(example = "ABCDABCDABCDABCDABCDABCDABCDABCDABCDABCD")]
    pub answer_key: String,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub test_book_id: Uuid,
    pub created_at: DateTime<Utc>,
}

/// Response for test result.
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct TestResultResponse {
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub user_id: Uuid,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440002")]
    pub practice_test_id: Uuid,
    #[schema(example = "ABCD_BCDABCDABCDABCDABCDABCDABCDABCDABCD")]
    pub user_answers: String,
    #[schema(example = 35)]
    pub correct_count: i32,
    #[schema(example = 3)]
    pub wrong_count: i32,
    #[schema(example = 2)]
    pub empty_count: i32,
    #[schema(example = 34.25)]
    pub net_score: f64,
    pub solved_at: DateTime<Utc>,
}

/// Response for solving a test.
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct SolveTestResponse {
    pub result: TestResultResponse,
    #[schema(example = true)]
    pub can_retake: bool,
    #[schema(example = 0.0)]
    pub hours_until_retake: Option<f64>,
}

// Conversion implementations
impl From<application::dto::LessonResponse> for LessonResponse {
    fn from(dto: application::dto::LessonResponse) -> Self {
        Self {
            id: dto.id,
            name: dto.name,
            created_at: dto.created_at,
        }
    }
}

impl From<application::dto::ExamTypeResponse> for ExamTypeResponse {
    fn from(dto: application::dto::ExamTypeResponse) -> Self {
        Self {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            created_at: dto.created_at,
        }
    }
}

impl From<application::dto::SubjectResponse> for SubjectResponse {
    fn from(dto: application::dto::SubjectResponse) -> Self {
        Self {
            id: dto.id,
            name: dto.name,
            lesson_id: dto.lesson_id,
            exam_type_id: dto.exam_type_id,
            created_at: dto.created_at,
        }
    }
}

impl From<application::dto::TestBookResponse> for TestBookResponse {
    fn from(dto: application::dto::TestBookResponse) -> Self {
        Self {
            id: dto.id,
            name: dto.name,
            lesson_id: dto.lesson_id,
            exam_type_id: dto.exam_type_id,
            subject_id: dto.subject_id,
            published_year: dto.published_year,
            created_at: dto.created_at,
        }
    }
}

impl From<application::dto::PracticeTestResponse> for PracticeTestResponse {
    fn from(dto: application::dto::PracticeTestResponse) -> Self {
        Self {
            id: dto.id,
            name: dto.name,
            test_number: dto.test_number,
            question_count: dto.question_count,
            answer_key: dto.answer_key,
            test_book_id: dto.test_book_id,
            created_at: dto.created_at,
        }
    }
}

impl From<application::dto::TestResultResponse> for TestResultResponse {
    fn from(dto: application::dto::TestResultResponse) -> Self {
        Self {
            id: dto.id,
            user_id: dto.user_id,
            practice_test_id: dto.practice_test_id,
            user_answers: dto.user_answers,
            correct_count: dto.correct_count,
            wrong_count: dto.wrong_count,
            empty_count: dto.empty_count,
            net_score: dto.net_score,
            solved_at: dto.solved_at,
        }
    }
}

impl From<application::dto::SolveTestResponse> for SolveTestResponse {
    fn from(dto: application::dto::SolveTestResponse) -> Self {
        Self {
            result: dto.result.into(),
            can_retake: dto.can_retake,
            hours_until_retake: dto.hours_until_retake,
        }
    }
}

