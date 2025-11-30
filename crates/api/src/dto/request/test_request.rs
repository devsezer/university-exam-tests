use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

/// Request body for creating a lesson.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct CreateLessonRequest {
    #[schema(example = "Matematik")]
    #[validate(length(min = 1, max = 100))]
    pub name: String,
}

/// Request body for updating a lesson.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct UpdateLessonRequest {
    #[schema(example = "Matematik")]
    #[validate(length(min = 1, max = 100))]
    pub name: Option<String>,
}

/// Request body for creating an exam type.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct CreateExamTypeRequest {
    #[schema(example = "TYT")]
    #[validate(length(min = 1, max = 50))]
    pub name: String,
    #[schema(example = "Temel Yeterlilik Testi")]
    pub description: Option<String>,
}

/// Request body for updating an exam type.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct UpdateExamTypeRequest {
    #[schema(example = "TYT")]
    #[validate(length(min = 1, max = 50))]
    pub name: Option<String>,
    #[schema(example = "Temel Yeterlilik Testi")]
    pub description: Option<String>,
}

/// Request body for creating a subject.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct CreateSubjectRequest {
    #[schema(example = "Matematik")]
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub lesson_id: Uuid,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub exam_type_id: Uuid,
}

/// Request body for updating a subject.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct UpdateSubjectRequest {
    #[schema(example = "Matematik")]
    #[validate(length(min = 1, max = 100))]
    pub name: Option<String>,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub lesson_id: Option<Uuid>,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub exam_type_id: Option<Uuid>,
}

/// Request body for creating a test book.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct CreateTestBookRequest {
    #[schema(example = "Limit Yayınları TYT Matematik")]
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub lesson_id: Uuid,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub exam_type_id: Uuid,
    #[validate(length(min = 1, message = "At least one subject is required"))]
    pub subject_ids: Vec<Uuid>,
    #[schema(example = 2024)]
    #[validate(range(min = 2000, max = 2100))]
    pub published_year: u16,
}

/// Request body for updating a test book.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct UpdateTestBookRequest {
    #[schema(example = "Limit Yayınları TYT Matematik")]
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub lesson_id: Option<Uuid>,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub exam_type_id: Option<Uuid>,
    pub subject_ids: Option<Vec<Uuid>>,
    #[schema(example = 2024)]
    #[validate(range(min = 2000, max = 2100))]
    pub published_year: Option<u16>,
}

/// Request body for creating a practice test.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct CreatePracticeTestRequest {
    #[schema(example = "Deneme 1")]
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    #[schema(example = 1)]
    #[validate(range(min = 1))]
    pub test_number: i32,
    #[schema(example = 40)]
    #[validate(range(min = 1))]
    pub question_count: i32,
    #[schema(example = "ABCDABCDABCDABCDABCDABCDABCDABCDABCDABCD")]
    #[validate(length(min = 1))]
    pub answer_key: String,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub test_book_id: Uuid,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub subject_id: Uuid,
}

/// Request body for updating a practice test.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct UpdatePracticeTestRequest {
    #[schema(example = "Deneme 1")]
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    #[schema(example = 1)]
    #[validate(range(min = 1))]
    pub test_number: Option<i32>,
    #[schema(example = 40)]
    #[validate(range(min = 1))]
    pub question_count: Option<i32>,
    #[schema(example = "ABCDABCDABCDABCDABCDABCDABCDABCDABCDABCD")]
    #[validate(length(min = 1))]
    pub answer_key: Option<String>,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub test_book_id: Option<Uuid>,
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub subject_id: Option<Uuid>,
}

/// Request body for solving a test.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct SolveTestRequest {
    #[schema(example = "ABCD_BCDABCDABCDABCDABCDABCDABCDABCDABCD")]
    #[validate(length(min = 1))]
    pub user_answers: String,
}

// Conversion implementations
impl CreateLessonRequest {
    pub fn into_app_request(self) -> application::dto::CreateLessonRequest {
        application::dto::CreateLessonRequest { name: self.name }
    }
}

impl UpdateLessonRequest {
    pub fn into_app_request(self) -> application::dto::UpdateLessonRequest {
        application::dto::UpdateLessonRequest { name: self.name }
    }
}

impl CreateExamTypeRequest {
    pub fn into_app_request(self) -> application::dto::CreateExamTypeRequest {
        application::dto::CreateExamTypeRequest {
            name: self.name,
            description: self.description,
        }
    }
}

impl UpdateExamTypeRequest {
    pub fn into_app_request(self) -> application::dto::UpdateExamTypeRequest {
        application::dto::UpdateExamTypeRequest {
            name: self.name,
            description: self.description,
        }
    }
}

impl CreateSubjectRequest {
    pub fn into_app_request(self) -> application::dto::CreateSubjectRequest {
        application::dto::CreateSubjectRequest {
            name: self.name,
            lesson_id: self.lesson_id,
            exam_type_id: self.exam_type_id,
        }
    }
}

impl UpdateSubjectRequest {
    pub fn into_app_request(self) -> application::dto::UpdateSubjectRequest {
        application::dto::UpdateSubjectRequest {
            name: self.name,
            lesson_id: self.lesson_id,
            exam_type_id: self.exam_type_id,
        }
    }
}

impl CreateTestBookRequest {
    pub fn into_app_request(self) -> application::dto::CreateTestBookRequest {
        application::dto::CreateTestBookRequest {
            name: self.name,
            lesson_id: self.lesson_id,
            exam_type_id: self.exam_type_id,
            subject_ids: self.subject_ids,
            published_year: self.published_year,
        }
    }
}

impl UpdateTestBookRequest {
    pub fn into_app_request(self) -> application::dto::UpdateTestBookRequest {
        application::dto::UpdateTestBookRequest {
            name: self.name,
            lesson_id: self.lesson_id,
            exam_type_id: self.exam_type_id,
            subject_ids: self.subject_ids,
            published_year: self.published_year,
        }
    }
}

impl CreatePracticeTestRequest {
    pub fn into_app_request(self) -> application::dto::CreatePracticeTestRequest {
        application::dto::CreatePracticeTestRequest {
            name: self.name,
            test_number: self.test_number,
            question_count: self.question_count,
            answer_key: self.answer_key,
            test_book_id: self.test_book_id,
            subject_id: self.subject_id,
        }
    }
}

impl UpdatePracticeTestRequest {
    pub fn into_app_request(self) -> application::dto::UpdatePracticeTestRequest {
        application::dto::UpdatePracticeTestRequest {
            name: self.name,
            test_number: self.test_number,
            question_count: self.question_count,
            answer_key: self.answer_key,
            test_book_id: self.test_book_id,
            subject_id: self.subject_id,
        }
    }
}

impl SolveTestRequest {
    pub fn into_app_request(self) -> application::dto::SolveTestRequest {
        application::dto::SolveTestRequest {
            user_answers: self.user_answers,
        }
    }
}

