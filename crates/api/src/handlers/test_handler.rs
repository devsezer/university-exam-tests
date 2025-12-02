use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use validator::Validate;
use tracing::error;

use crate::dto::request::{
    CreateExamTypeRequest, CreateLessonRequest, CreatePracticeTestRequest, CreateSubjectRequest,
    CreateTestBookRequest, SolveTestRequest, UpdateExamTypeRequest, UpdateLessonRequest,
    UpdatePracticeTestRequest, UpdateSubjectRequest, UpdateTestBookRequest,
};
use crate::dto::response::{
    ApiResponse, ExamTypeResponse, LessonResponse, MessageResponse, PaginatedResponse,
    PracticeTestResponse, PracticeTestWithStatusResponse, SolveTestResponse, SubjectResponse,
    TestBookResponse, TestBookWithStatsResponse, TestResultResponse,
};
use crate::errors::AppError;
use crate::extractors::{CurrentUser, RequireAdmin};
use crate::state::AppState;
use domain::repositories::TestResultRepository;

/// Helper function to log service errors and convert to AppError
fn handle_service_error<E: std::fmt::Debug + Into<AppError>>(operation: &str, e: E) -> AppError {
    error!(operation = operation, "Service error: {:?}", e);
    e.into()
}

// Lesson Handlers

/// Create a new lesson (Admin only)
#[utoipa::path(
    post,
    path = "/api/v1/admin/lessons",
    request_body = CreateLessonRequest,
    responses(
        (status = 201, description = "Lesson created successfully", body = ApiResponse<LessonResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn create_lesson(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Json(request): Json<CreateLessonRequest>,
) -> Result<(StatusCode, Json<ApiResponse<LessonResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_lesson(request.into_app_request())
        .await
        .map_err(|e| handle_service_error("create_lesson", e))?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            result.into(),
            "Lesson created successfully",
        )),
    ))
}

/// Get lesson by ID (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/lessons/{id}",
    params(("id" = Uuid, Path, description = "Lesson ID")),
    responses(
        (status = 200, description = "Lesson retrieved", body = ApiResponse<LessonResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Lesson not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn get_lesson(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<LessonResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_lesson(id)
        .await
        .map_err(|e| {
            error!(lesson_id = ?id, "Failed to get lesson: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success(result.into())))
}

/// List all lessons (Public)
#[utoipa::path(
    get,
    path = "/api/v1/lessons",
    responses(
        (status = 200, description = "Lessons retrieved", body = ApiResponse<Vec<LessonResponse>>),
    ),
    tag = "tests"
)]
pub async fn list_lessons(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<LessonResponse>>>, AppError> {
    let results = state
        .test_management_service
        .list_lessons()
        .await
        .map_err(|e| handle_service_error("list_lessons", e))?;

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// List all lessons (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/lessons",
    responses(
        (status = 200, description = "Lessons retrieved", body = ApiResponse<Vec<LessonResponse>>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn list_admin_lessons(
    State(state): State<AppState>,
    _admin: RequireAdmin,
) -> Result<Json<ApiResponse<Vec<LessonResponse>>>, AppError> {
    let results = state
        .test_management_service
        .list_lessons()
        .await
        .map_err(|e| handle_service_error("list_admin_lessons", e))?;

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// Update lesson (Admin only)
#[utoipa::path(
    put,
    path = "/api/v1/admin/lessons/{id}",
    params(("id" = Uuid, Path, description = "Lesson ID")),
    request_body = UpdateLessonRequest,
    responses(
        (status = 200, description = "Lesson updated", body = ApiResponse<LessonResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Lesson not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn update_lesson(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateLessonRequest>,
) -> Result<Json<ApiResponse<LessonResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_lesson(id, request.into_app_request())
        .await
        .map_err(|e| {
            error!(lesson_id = ?id, "Failed to update lesson: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success_with_message(
        result.into(),
        "Lesson updated successfully",
    )))
}

/// Delete lesson (Admin only)
#[utoipa::path(
    delete,
    path = "/api/v1/admin/lessons/{id}",
    params(("id" = Uuid, Path, description = "Lesson ID")),
    responses(
        (status = 200, description = "Lesson deleted", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Lesson not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn delete_lesson(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_lesson(id)
        .await
        .map_err(|e| {
            error!(lesson_id = ?id, "Failed to delete lesson: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse {
            message: "Lesson deleted successfully".to_string(),
        },
        "Lesson deleted successfully",
    )))
}

// ExamType Handlers

/// Create a new exam type (Admin only)
#[utoipa::path(
    post,
    path = "/api/v1/admin/exam-types",
    request_body = CreateExamTypeRequest,
    responses(
        (status = 201, description = "Exam type created successfully", body = ApiResponse<ExamTypeResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn create_exam_type(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Json(request): Json<CreateExamTypeRequest>,
) -> Result<(StatusCode, Json<ApiResponse<ExamTypeResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_exam_type(request.into_app_request())
        .await
        .map_err(|e| handle_service_error("create_exam_type", e))?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            result.into(),
            "Exam type created successfully",
        )),
    ))
}

/// Get exam type by ID
#[utoipa::path(
    get,
    path = "/api/v1/admin/exam-types/{id}",
    params(("id" = Uuid, Path, description = "Exam type ID")),
    responses(
        (status = 200, description = "Exam type retrieved", body = ApiResponse<ExamTypeResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Exam type not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn get_exam_type(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<ExamTypeResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_exam_type(id)
        .await
        .map_err(|e| {
            error!(exam_type_id = ?id, "Failed to get exam type: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success(result.into())))
}

/// List all exam types
#[utoipa::path(
    get,
    path = "/api/v1/exam-types",
    responses(
        (status = 200, description = "Exam types retrieved", body = ApiResponse<Vec<ExamTypeResponse>>),
    ),
    tag = "tests"
)]
pub async fn list_exam_types(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<ExamTypeResponse>>>, AppError> {
    let results = state
        .test_management_service
        .list_exam_types()
        .await
        .map_err(|e| handle_service_error("list_exam_types", e))?;

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// List all exam types (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/exam-types",
    responses(
        (status = 200, description = "Exam types retrieved", body = ApiResponse<Vec<ExamTypeResponse>>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn list_admin_exam_types(
    State(state): State<AppState>,
    _admin: RequireAdmin,
) -> Result<Json<ApiResponse<Vec<ExamTypeResponse>>>, AppError> {
    let results = state
        .test_management_service
        .list_exam_types()
        .await
        .map_err(|e| handle_service_error("list_admin_exam_types", e))?;

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// Update exam type (Admin only)
#[utoipa::path(
    put,
    path = "/api/v1/admin/exam-types/{id}",
    params(("id" = Uuid, Path, description = "Exam type ID")),
    request_body = UpdateExamTypeRequest,
    responses(
        (status = 200, description = "Exam type updated", body = ApiResponse<ExamTypeResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Exam type not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn update_exam_type(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateExamTypeRequest>,
) -> Result<Json<ApiResponse<ExamTypeResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_exam_type(id, request.into_app_request())
        .await
        .map_err(|e| {
            error!(exam_type_id = ?id, "Failed to update exam type: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success_with_message(
        result.into(),
        "Exam type updated successfully",
    )))
}

/// Delete exam type (Admin only)
#[utoipa::path(
    delete,
    path = "/api/v1/admin/exam-types/{id}",
    params(("id" = Uuid, Path, description = "Exam type ID")),
    responses(
        (status = 200, description = "Exam type deleted", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Exam type not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn delete_exam_type(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_exam_type(id)
        .await
        .map_err(|e| {
            error!(exam_type_id = ?id, "Failed to delete exam type: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse {
            message: "Exam type deleted successfully".to_string(),
        },
        "Exam type deleted successfully",
    )))
}

// Subject Handlers

/// Create a new subject (Admin only)
#[utoipa::path(
    post,
    path = "/api/v1/admin/subjects",
    request_body = CreateSubjectRequest,
    responses(
        (status = 201, description = "Subject created successfully", body = ApiResponse<SubjectResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn create_subject(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Json(request): Json<CreateSubjectRequest>,
) -> Result<(StatusCode, Json<ApiResponse<SubjectResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_subject(request.into_app_request())
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            result.into(),
            "Subject created successfully",
        )),
    ))
}

/// Get subject by ID
#[utoipa::path(
    get,
    path = "/api/v1/admin/subjects/{id}",
    params(("id" = Uuid, Path, description = "Subject ID")),
    responses(
        (status = 200, description = "Subject retrieved", body = ApiResponse<SubjectResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Subject not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn get_subject(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<SubjectResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_subject(id)
        .await
        .map_err(|e| {
            error!(subject_id = ?id, "Failed to get subject: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success(result.into())))
}

/// List subjects with optional filters
#[utoipa::path(
    get,
    path = "/api/v1/subjects",
    params(
        ("exam_type_id" = Option<Uuid>, Query, description = "Filter by exam type ID"),
        ("lesson_id" = Option<Uuid>, Query, description = "Filter by lesson ID (requires exam_type_id)")
    ),
    responses(
        (status = 200, description = "Subjects retrieved", body = ApiResponse<Vec<SubjectResponse>>),
    ),
    tag = "tests"
)]
pub async fn list_subjects(
    State(state): State<AppState>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<Vec<SubjectResponse>>>, AppError> {
    let exam_type_id = params
        .get("exam_type_id")
        .and_then(|s| Uuid::parse_str(s).ok());
    let lesson_id = params
        .get("lesson_id")
        .and_then(|s| Uuid::parse_str(s).ok());

    let results = match (lesson_id, exam_type_id) {
        // Both lesson_id and exam_type_id provided - use cascading filter
        (Some(lesson_id), Some(exam_type_id)) => {
            state
                .test_management_service
                .list_subjects_by_lesson_and_exam_type(lesson_id, exam_type_id)
                .await
                .map_err(|e| handle_service_error("service_call", e))?
        }
        // Only exam_type_id provided
        (None, Some(exam_type_id)) => {
        state
            .test_management_service
            .list_subjects_by_exam_type(exam_type_id)
            .await
            .map_err(|e| handle_service_error("service_call", e))?
        }
        // No filters or only lesson_id (list all in this case)
        _ => {
        state
            .test_management_service
            .list_all_subjects()
            .await
            .map_err(|e| handle_service_error("service_call", e))?
        }
    };

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// List all subjects (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/subjects",
    params(
        ("exam_type_id" = Option<Uuid>, Query, description = "Filter by exam type ID"),
        ("lesson_id" = Option<Uuid>, Query, description = "Filter by lesson ID (requires exam_type_id)")
    ),
    responses(
        (status = 200, description = "Subjects retrieved", body = ApiResponse<Vec<SubjectResponse>>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn list_admin_subjects(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<Vec<SubjectResponse>>>, AppError> {
    let exam_type_id = params
        .get("exam_type_id")
        .and_then(|s| Uuid::parse_str(s).ok());
    let lesson_id = params
        .get("lesson_id")
        .and_then(|s| Uuid::parse_str(s).ok());

    let results = match (lesson_id, exam_type_id) {
        (Some(lesson_id), Some(exam_type_id)) => {
            state
                .test_management_service
                .list_subjects_by_lesson_and_exam_type(lesson_id, exam_type_id)
                .await
                .map_err(|e| handle_service_error("list_admin_subjects", e))?
        }
        (None, Some(exam_type_id)) => {
            state
                .test_management_service
                .list_subjects_by_exam_type(exam_type_id)
                .await
                .map_err(|e| handle_service_error("list_admin_subjects", e))?
        }
        _ => {
            state
                .test_management_service
                .list_all_subjects()
                .await
                .map_err(|e| handle_service_error("list_admin_subjects", e))?
        }
    };

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// Update subject (Admin only)
#[utoipa::path(
    put,
    path = "/api/v1/admin/subjects/{id}",
    params(("id" = Uuid, Path, description = "Subject ID")),
    request_body = UpdateSubjectRequest,
    responses(
        (status = 200, description = "Subject updated", body = ApiResponse<SubjectResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Subject not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn update_subject(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateSubjectRequest>,
) -> Result<Json<ApiResponse<SubjectResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_subject(id, request.into_app_request())
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success_with_message(
        result.into(),
        "Subject updated successfully",
    )))
}

/// Delete subject (Admin only)
#[utoipa::path(
    delete,
    path = "/api/v1/admin/subjects/{id}",
    params(("id" = Uuid, Path, description = "Subject ID")),
    responses(
        (status = 200, description = "Subject deleted", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Subject not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn delete_subject(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_subject(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse {
            message: "Subject deleted successfully".to_string(),
        },
        "Subject deleted successfully",
    )))
}

// TestBook Handlers

/// Create a new test book (Admin only)
#[utoipa::path(
    post,
    path = "/api/v1/admin/test-books",
    request_body = CreateTestBookRequest,
    responses(
        (status = 201, description = "Test book created successfully", body = ApiResponse<TestBookResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn create_test_book(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Json(request): Json<CreateTestBookRequest>,
) -> Result<(StatusCode, Json<ApiResponse<TestBookResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_test_book(request.into_app_request())
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            result.into(),
            "Test book created successfully",
        )),
    ))
}

/// Get test book by ID
#[utoipa::path(
    get,
    path = "/api/v1/admin/test-books/{id}",
    params(("id" = Uuid, Path, description = "Test book ID")),
    responses(
        (status = 200, description = "Test book retrieved", body = ApiResponse<TestBookResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Test book not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn get_test_book(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<TestBookResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_test_book(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success(result.into())))
}

/// List subjects for a test book
#[utoipa::path(
    get,
    path = "/api/v1/test-books/{id}/subjects",
    params(("id" = Uuid, Path, description = "Test book ID")),
    responses(
        (status = 200, description = "Subjects retrieved", body = ApiResponse<Vec<SubjectResponse>>),
        (status = 404, description = "Test book not found"),
    ),
    tag = "tests"
)]
pub async fn list_test_book_subjects(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<SubjectResponse>>>, AppError> {
    let results = state
        .test_management_service
        .list_subjects_by_test_book_id(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// List test books by subject, exam type and lesson, or all
#[utoipa::path(
    get,
    path = "/api/v1/test-books",
    params(
        ("subject_id" = Option<Uuid>, Query, description = "Filter by subject ID"),
        ("exam_type_id" = Option<Uuid>, Query, description = "Filter by exam type ID"),
        ("lesson_id" = Option<Uuid>, Query, description = "Filter by lesson ID")
    ),
    responses(
        (status = 200, description = "Test books retrieved", body = ApiResponse<Vec<TestBookResponse>>),
    ),
    tag = "tests"
)]
pub async fn list_test_books(
    State(state): State<AppState>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<Vec<TestBookResponse>>>, AppError> {
    let subject_id = params
        .get("subject_id")
        .and_then(|s| Uuid::parse_str(s).ok());
    let exam_type_id = params
        .get("exam_type_id")
        .and_then(|s| Uuid::parse_str(s).ok());
    let lesson_id = params
        .get("lesson_id")
        .and_then(|s| Uuid::parse_str(s).ok());

    let results = match (subject_id, exam_type_id, lesson_id) {
        // If subject_id is provided, use subject filter (backward compatibility)
        (Some(subject_id), _, _) => {
            state
                .test_management_service
                .list_test_books_by_subject(subject_id)
                .await
                .map_err(|e| handle_service_error("service_call", e))?
        }
        // If both exam_type_id and lesson_id are provided, use combined filter
        (None, Some(exam_type_id), Some(lesson_id)) => {
            state
                .test_management_service
                .list_test_books_by_exam_type_and_lesson(exam_type_id, lesson_id)
                .await
                .map_err(|e| handle_service_error("service_call", e))?
        }
        // Otherwise, list all
        _ => {
            state
                .test_management_service
                .list_all_test_books()
                .await
                .map_err(|e| handle_service_error("service_call", e))?
        }
    };

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// List all test books (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/test-books",
    params(("subject_id" = Option<Uuid>, Query, description = "Filter by subject ID")),
    responses(
        (status = 200, description = "Test books retrieved", body = ApiResponse<Vec<TestBookResponse>>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn list_admin_test_books(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<Vec<TestBookResponse>>>, AppError> {
    let subject_id = params
        .get("subject_id")
        .and_then(|s| Uuid::parse_str(s).ok());

    let results = if let Some(subject_id) = subject_id {
        state
            .test_management_service
            .list_test_books_by_subject(subject_id)
            .await
            .map_err(|e| handle_service_error("list_admin_test_books", e))?
    } else {
        state
            .test_management_service
            .list_all_test_books()
            .await
            .map_err(|e| handle_service_error("list_admin_test_books", e))?
    };

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// Update test book (Admin only)
#[utoipa::path(
    put,
    path = "/api/v1/admin/test-books/{id}",
    params(("id" = Uuid, Path, description = "Test book ID")),
    request_body = UpdateTestBookRequest,
    responses(
        (status = 200, description = "Test book updated", body = ApiResponse<TestBookResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Test book not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn update_test_book(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateTestBookRequest>,
) -> Result<Json<ApiResponse<TestBookResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_test_book(id, request.into_app_request())
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success_with_message(
        result.into(),
        "Test book updated successfully",
    )))
}

/// Delete test book (Admin only)
#[utoipa::path(
    delete,
    path = "/api/v1/admin/test-books/{id}",
    params(("id" = Uuid, Path, description = "Test book ID")),
    responses(
        (status = 200, description = "Test book deleted", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Test book not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn delete_test_book(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_test_book(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse {
            message: "Test book deleted successfully".to_string(),
        },
        "Test book deleted successfully",
    )))
}

// PracticeTest Handlers

/// Create a new practice test (Admin only)
#[utoipa::path(
    post,
    path = "/api/v1/admin/practice-tests",
    request_body = CreatePracticeTestRequest,
    responses(
        (status = 201, description = "Practice test created successfully", body = ApiResponse<PracticeTestResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn create_practice_test(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Json(request): Json<CreatePracticeTestRequest>,
) -> Result<(StatusCode, Json<ApiResponse<PracticeTestResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_practice_test(request.into_app_request())
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            result.into(),
            "Practice test created successfully",
        )),
    ))
}

/// Get practice test by ID (Public)
#[utoipa::path(
    get,
    path = "/api/v1/practice-tests/{id}",
    params(("id" = Uuid, Path, description = "Practice test ID")),
    responses(
        (status = 200, description = "Practice test retrieved", body = ApiResponse<PracticeTestResponse>),
        (status = 404, description = "Practice test not found"),
    ),
    tag = "tests"
)]
pub async fn get_practice_test_public(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<PracticeTestResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_practice_test(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success(result.into())))
}

/// Get practice test by ID (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/practice-tests/{id}",
    params(("id" = Uuid, Path, description = "Practice test ID")),
    responses(
        (status = 200, description = "Practice test retrieved", body = ApiResponse<PracticeTestResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Practice test not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn get_practice_test(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<PracticeTestResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_practice_test(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success(result.into())))
}

/// List practice tests by test book
#[utoipa::path(
    get,
    path = "/api/v1/practice-tests",
    params(("test_book_id" = Option<Uuid>, Query, description = "Filter by test book ID")),
    responses(
        (status = 200, description = "Practice tests retrieved", body = ApiResponse<Vec<PracticeTestResponse>>),
    ),
    tag = "tests"
)]
pub async fn list_practice_tests(
    State(state): State<AppState>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<Vec<PracticeTestResponse>>>, AppError> {
    let test_book_id = params
        .get("test_book_id")
        .and_then(|s| Uuid::parse_str(s).ok());

    let results = if let Some(test_book_id) = test_book_id {
        state
            .test_management_service
            .list_practice_tests_by_test_book(test_book_id)
            .await
            .map_err(|e| handle_service_error("service_call", e))?
    } else {
        state
            .test_management_service
            .list_all_practice_tests()
            .await
            .map_err(|e| handle_service_error("service_call", e))?
    };

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// List practice tests grouped by subject for a test book
#[utoipa::path(
    get,
    path = "/api/v1/test-books/{id}/practice-tests-grouped",
    params(("id" = Uuid, Path, description = "Test book ID")),
    responses(
        (status = 200, description = "Practice tests grouped by subject", body = ApiResponse<serde_json::Value>),
        (status = 404, description = "Test book not found"),
    ),
    tag = "tests"
)]
pub async fn list_practice_tests_grouped_by_subject(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    let grouped = state
        .test_management_service
        .list_practice_tests_grouped_by_subject(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    // Convert HashMap<Uuid, Vec<PracticeTestResponse>> to HashMap<String, Vec<PracticeTestResponse>>
    // for JSON serialization (Uuid keys need to be strings in JSON)
    let mut json_map = serde_json::Map::new();
    for (subject_id, tests) in grouped {
        let key = subject_id.to_string();
        let value = serde_json::to_value(
            tests
                .into_iter()
                .map(|r| r.into())
                .collect::<Vec<crate::dto::response::PracticeTestResponse>>(),
        )
        .map_err(|_| AppError::InternalServerError)?;
        json_map.insert(key, value);
    }

    Ok(Json(ApiResponse::success(serde_json::Value::Object(json_map))))
}

/// List all practice tests (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/practice-tests",
    params(("test_book_id" = Option<Uuid>, Query, description = "Filter by test book ID")),
    responses(
        (status = 200, description = "Practice tests retrieved", body = ApiResponse<Vec<PracticeTestResponse>>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn list_admin_practice_tests(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<Vec<PracticeTestResponse>>>, AppError> {
    let test_book_id = params
        .get("test_book_id")
        .and_then(|s| Uuid::parse_str(s).ok());

    let results = if let Some(test_book_id) = test_book_id {
        state
            .test_management_service
            .list_practice_tests_by_test_book(test_book_id)
            .await
            .map_err(|e| handle_service_error("list_admin_practice_tests", e))?
    } else {
        state
            .test_management_service
            .list_all_practice_tests()
            .await
            .map_err(|e| handle_service_error("list_admin_practice_tests", e))?
    };

    Ok(Json(ApiResponse::success(
        results.into_iter().map(|r| r.into()).collect(),
    )))
}

/// Update practice test (Admin only)
#[utoipa::path(
    put,
    path = "/api/v1/admin/practice-tests/{id}",
    params(("id" = Uuid, Path, description = "Practice test ID")),
    request_body = UpdatePracticeTestRequest,
    responses(
        (status = 200, description = "Practice test updated", body = ApiResponse<PracticeTestResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Practice test not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn update_practice_test(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdatePracticeTestRequest>,
) -> Result<Json<ApiResponse<PracticeTestResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_practice_test(id, request.into_app_request())
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success_with_message(
        result.into(),
        "Practice test updated successfully",
    )))
}

/// Delete practice test (Admin only)
#[utoipa::path(
    delete,
    path = "/api/v1/admin/practice-tests/{id}",
    params(("id" = Uuid, Path, description = "Practice test ID")),
    responses(
        (status = 200, description = "Practice test deleted", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Practice test not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn delete_practice_test(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_practice_test(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse {
            message: "Practice test deleted successfully".to_string(),
        },
        "Practice test deleted successfully",
    )))
}

// Test Solving Handlers

/// Solve a practice test
#[utoipa::path(
    post,
    path = "/api/v1/tests/{id}/solve",
    params(("id" = Uuid, Path, description = "Practice test ID")),
    request_body = SolveTestRequest,
    responses(
        (status = 200, description = "Test solved successfully", body = ApiResponse<SolveTestResponse>),
        (status = 400, description = "Validation error"),
        (status = 403, description = "Cannot retake test yet"),
    ),
    tag = "tests",
    security(("bearerAuth" = []))
)]
pub async fn solve_test(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(practice_test_id): Path<Uuid>,
    Json(request): Json<SolveTestRequest>,
) -> Result<Json<ApiResponse<SolveTestResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_solving_service
        .solve_test(user.id, practice_test_id, request.into_app_request())
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    Ok(Json(ApiResponse::success_with_message(
        result.into(),
        "Test solved successfully",
    )))
}

// Result Handlers

/// Get test result by ID
#[utoipa::path(
    get,
    path = "/api/v1/my-results/{id}",
    params(("id" = Uuid, Path, description = "Test result ID")),
    responses(
        (status = 200, description = "Test result retrieved", body = ApiResponse<TestResultResponse>),
        (status = 404, description = "Test result not found"),
    ),
    tag = "tests",
    security(("bearerAuth" = []))
)]
pub async fn get_result(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<TestResultResponse>>, AppError> {
    let result = state
        .result_service
        .get_result(id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    // Verify the result belongs to the current user
    if result.user_id != user.id {
        return Err(AppError::NotFound("Test result not found".to_string()));
    }

    Ok(Json(ApiResponse::success(result.into())))
}

/// List user's test results
#[utoipa::path(
    get,
    path = "/api/v1/my-results",
    params(
        ("page" = Option<u32>, Query, description = "Page number", example = 1),
        ("per_page" = Option<u32>, Query, description = "Items per page", example = 20)
    ),
    responses(
        (status = 200, description = "Test results retrieved", body = ApiResponse<PaginatedResponse<TestResultResponse>>),
    ),
    tag = "tests",
    security(("bearerAuth" = []))
)]
pub async fn list_my_results(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<PaginatedResponse<TestResultResponse>>>, AppError> {
    let page = params
        .get("page")
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(1);
    let per_page = params
        .get("per_page")
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(20)
        .min(100);

    let (results, total) = state
        .result_service
        .list_user_results(user.id, page, per_page)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    let total_pages = (total as f64 / per_page as f64).ceil() as u32;

    Ok(Json(ApiResponse::success(PaginatedResponse {
        items: results.into_iter().map(|r| r.into()).collect(),
        pagination: crate::dto::response::PaginationInfo {
            page,
            per_page,
            total_items: total,
            total_pages,
        },
    })))
}

/// List test books with statistics (total test count, solved test count, progress percentage)
#[utoipa::path(
    get,
    path = "/api/v1/test-books-with-stats",
    params(
        ("exam_type_id" = Option<Uuid>, Query, description = "Filter by exam type ID"),
        ("lesson_id" = Option<Uuid>, Query, description = "Filter by lesson ID"),
        ("search" = Option<String>, Query, description = "Search by book name")
    ),
    responses(
        (status = 200, description = "Test books with statistics retrieved", body = ApiResponse<Vec<TestBookWithStatsResponse>>),
        (status = 401, description = "Unauthorized"),
    ),
    tag = "tests",
    security(("bearerAuth" = []))
)]
pub async fn list_test_books_with_stats(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<Vec<TestBookWithStatsResponse>>>, AppError> {
    let exam_type_id = params
        .get("exam_type_id")
        .and_then(|s| Uuid::parse_str(s).ok());
    let lesson_id = params
        .get("lesson_id")
        .and_then(|s| Uuid::parse_str(s).ok());
    let search = params.get("search").cloned();

    // Get test books based on filters
    let test_books = match (exam_type_id, lesson_id) {
        (Some(exam_type_id), Some(lesson_id)) => {
            state
                .test_management_service
                .list_test_books_by_exam_type_and_lesson(exam_type_id, lesson_id)
                .await
                .map_err(|e| handle_service_error("service_call", e))?
        }
        (Some(exam_type_id), None) => {
            state
                .test_management_service
                .list_test_books_by_exam_type(exam_type_id)
                .await
                .map_err(|e| handle_service_error("service_call", e))?
        }
        _ => {
            state
                .test_management_service
                .list_all_test_books()
                .await
                .map_err(|e| handle_service_error("service_call", e))?
        }
    };

    // Filter by search if provided
    let filtered_books: Vec<_> = if let Some(search_term) = search {
        test_books
            .into_iter()
            .filter(|book| book.name.to_lowercase().contains(&search_term.to_lowercase()))
            .collect()
    } else {
        test_books
    };

    // Get all practice tests for these books
    let mut books_with_stats = Vec::new();
    for book in filtered_books {
        // Get practice tests for this book
        let practice_tests = state
            .test_management_service
            .list_practice_tests_by_test_book(book.id)
            .await
            .map_err(|e| handle_service_error("service_call", e))?;

        let total_test_count = practice_tests.len() as i32;

        // Get user's results for these practice tests
        let practice_test_ids: Vec<Uuid> = practice_tests.iter().map(|pt| pt.id).collect();
        let mut solved_count = 0;
        
        for practice_test_id in practice_test_ids {
            match state
                .test_result_repo
                .find_latest_by_user_and_practice_test(user.id, practice_test_id)
                .await
            {
                Ok(Some(_)) => {
                    solved_count += 1;
                }
                Ok(None) => {}
                Err(e) => {
                    // If there's an error checking, log it and skip this test
                    // This shouldn't happen in normal operation
                    error!("Error checking test result: {:?}", e);
                }
            }
        }

        let progress_percentage = if total_test_count > 0 {
            (solved_count as f64 / total_test_count as f64) * 100.0
        } else {
            0.0
        };

        books_with_stats.push(TestBookWithStatsResponse {
            id: book.id,
            name: book.name,
            lesson_id: book.lesson_id,
            exam_type_id: book.exam_type_id,
            subject_ids: book.subject_ids,
            published_year: book.published_year,
            created_at: book.created_at,
            total_test_count,
            solved_test_count: solved_count,
            progress_percentage,
        });
    }

    Ok(Json(ApiResponse::success(books_with_stats)))
}

/// List practice tests with status for a test book
#[utoipa::path(
    get,
    path = "/api/v1/test-books/{id}/practice-tests-with-status",
    params(
        ("id" = Uuid, Path, description = "Test book ID"),
        ("subject_id" = Option<Uuid>, Query, description = "Filter by subject ID")
    ),
    responses(
        (status = 200, description = "Practice tests with status retrieved", body = ApiResponse<Vec<PracticeTestWithStatusResponse>>),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Test book not found"),
    ),
    tag = "tests",
    security(("bearerAuth" = []))
)]
pub async fn list_practice_tests_with_status(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(book_id): Path<Uuid>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<ApiResponse<Vec<PracticeTestWithStatusResponse>>>, AppError> {
    let subject_id = params
        .get("subject_id")
        .and_then(|s| Uuid::parse_str(s).ok());

    // Verify test book exists
    state
        .test_management_service
        .get_test_book(book_id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    // Get practice tests for this book
    let practice_tests = state
        .test_management_service
        .list_practice_tests_by_test_book(book_id)
        .await
        .map_err(|e| handle_service_error("service_call", e))?;

    // Filter by subject if provided
    let filtered_tests: Vec<_> = if let Some(subject_id) = subject_id {
        practice_tests
            .into_iter()
            .filter(|pt| pt.subject_id == subject_id)
            .collect()
    } else {
        practice_tests
    };

    // Get status for each test
    let mut tests_with_status = Vec::new();
    for test in filtered_tests {
        // Get latest result for this user and test
        let latest_result = match state
            .test_result_repo
            .find_latest_by_user_and_practice_test(user.id, test.id)
            .await
        {
            Ok(result) => result,
            Err(e) => {
                // Log error and continue with None (test is available)
                error!("Error checking test result: {:?}", e);
                None
            }
        };

        let (status, last_solved_at, result_id, hours_until_retake) = if let Some(result) = latest_result {
            // Check if 24 hours have passed
            use chrono::{Utc, Duration};
            let duration = Utc::now() - result.solved_at;
            let hours_since = duration.num_seconds() as f64 / 3600.0;
            
            if hours_since < 24.0 {
                (
                    "waiting".to_string(),
                    Some(result.solved_at),
                    Some(result.id),
                    Some(24.0 - hours_since),
                )
            } else {
                (
                    "solved".to_string(),
                    Some(result.solved_at),
                    Some(result.id),
                    None,
                )
            }
        } else {
            ("available".to_string(), None, None, None)
        };

        tests_with_status.push(PracticeTestWithStatusResponse {
            id: test.id,
            name: test.name,
            test_number: test.test_number,
            question_count: test.question_count,
            answer_key: test.answer_key,
            test_book_id: test.test_book_id,
            subject_id: test.subject_id,
            created_at: test.created_at,
            status,
            last_solved_at,
            result_id,
            hours_until_retake,
        });
    }

    Ok(Json(ApiResponse::success(tests_with_status)))
}

