use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use validator::Validate;

use crate::dto::request::{
    CreateExamTypeRequest, CreatePracticeTestRequest, CreateSubjectRequest, CreateTestBookRequest,
    SolveTestRequest, UpdateExamTypeRequest, UpdatePracticeTestRequest, UpdateSubjectRequest,
    UpdateTestBookRequest,
};
use crate::dto::response::{
    ApiResponse, ExamTypeResponse, MessageResponse, PaginatedResponse, PracticeTestResponse,
    SolveTestResponse, SubjectResponse, TestBookResponse, TestResultResponse,
};
use crate::errors::AppError;
use crate::extractors::CurrentUser;
use crate::state::AppState;

// ExamType Handlers

/// Create a new exam type (Admin only)
#[utoipa::path(
    post,
    path = "/api/v1/admin/exam-types",
    request_body = CreateExamTypeRequest,
    responses(
        (status = 201, description = "Exam type created successfully", body = ApiResponse<ExamTypeResponse>),
        (status = 400, description = "Validation error"),
    ),
    tag = "admin"
)]
pub async fn create_exam_type(
    State(state): State<AppState>,
    Json(request): Json<CreateExamTypeRequest>,
) -> Result<(StatusCode, Json<ApiResponse<ExamTypeResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_exam_type(request.into_app_request())
        .await
        .map_err(|e| AppError::from(e))?;

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
        (status = 404, description = "Exam type not found"),
    ),
    tag = "admin"
)]
pub async fn get_exam_type(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<ExamTypeResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_exam_type(id)
        .await
        .map_err(|e| AppError::from(e))?;

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
        .map_err(|e| AppError::from(e))?;

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
        (status = 404, description = "Exam type not found"),
    ),
    tag = "admin"
)]
pub async fn update_exam_type(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateExamTypeRequest>,
) -> Result<Json<ApiResponse<ExamTypeResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_exam_type(id, request.into_app_request())
        .await
        .map_err(|e| AppError::from(e))?;

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
        (status = 404, description = "Exam type not found"),
    ),
    tag = "admin"
)]
pub async fn delete_exam_type(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_exam_type(id)
        .await
        .map_err(|e| AppError::from(e))?;

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
    ),
    tag = "admin"
)]
pub async fn create_subject(
    State(state): State<AppState>,
    Json(request): Json<CreateSubjectRequest>,
) -> Result<(StatusCode, Json<ApiResponse<SubjectResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_subject(request.into_app_request())
        .await
        .map_err(|e| AppError::from(e))?;

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
        (status = 404, description = "Subject not found"),
    ),
    tag = "admin"
)]
pub async fn get_subject(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<SubjectResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_subject(id)
        .await
        .map_err(|e| AppError::from(e))?;

    Ok(Json(ApiResponse::success(result.into())))
}

/// List subjects by exam type
#[utoipa::path(
    get,
    path = "/api/v1/subjects",
    params(("exam_type_id" = Option<Uuid>, Query, description = "Filter by exam type ID")),
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

    let results = if let Some(exam_type_id) = exam_type_id {
        state
            .test_management_service
            .list_subjects_by_exam_type(exam_type_id)
            .await
            .map_err(|e| AppError::from(e))?
    } else {
        vec![] // Return empty if no exam_type_id provided
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
        (status = 404, description = "Subject not found"),
    ),
    tag = "admin"
)]
pub async fn update_subject(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateSubjectRequest>,
) -> Result<Json<ApiResponse<SubjectResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_subject(id, request.into_app_request())
        .await
        .map_err(|e| AppError::from(e))?;

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
        (status = 404, description = "Subject not found"),
    ),
    tag = "admin"
)]
pub async fn delete_subject(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_subject(id)
        .await
        .map_err(|e| AppError::from(e))?;

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
    ),
    tag = "admin"
)]
pub async fn create_test_book(
    State(state): State<AppState>,
    Json(request): Json<CreateTestBookRequest>,
) -> Result<(StatusCode, Json<ApiResponse<TestBookResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_test_book(request.into_app_request())
        .await
        .map_err(|e| AppError::from(e))?;

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
        (status = 404, description = "Test book not found"),
    ),
    tag = "admin"
)]
pub async fn get_test_book(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<TestBookResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_test_book(id)
        .await
        .map_err(|e| AppError::from(e))?;

    Ok(Json(ApiResponse::success(result.into())))
}

/// List test books by subject
#[utoipa::path(
    get,
    path = "/api/v1/test-books",
    params(("subject_id" = Option<Uuid>, Query, description = "Filter by subject ID")),
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

    let results = if let Some(subject_id) = subject_id {
        state
            .test_management_service
            .list_test_books_by_subject(subject_id)
            .await
            .map_err(|e| AppError::from(e))?
    } else {
        vec![]
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
        (status = 404, description = "Test book not found"),
    ),
    tag = "admin"
)]
pub async fn update_test_book(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateTestBookRequest>,
) -> Result<Json<ApiResponse<TestBookResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_test_book(id, request.into_app_request())
        .await
        .map_err(|e| AppError::from(e))?;

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
        (status = 404, description = "Test book not found"),
    ),
    tag = "admin"
)]
pub async fn delete_test_book(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_test_book(id)
        .await
        .map_err(|e| AppError::from(e))?;

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
    ),
    tag = "admin"
)]
pub async fn create_practice_test(
    State(state): State<AppState>,
    Json(request): Json<CreatePracticeTestRequest>,
) -> Result<(StatusCode, Json<ApiResponse<PracticeTestResponse>>), AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .create_practice_test(request.into_app_request())
        .await
        .map_err(|e| AppError::from(e))?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            result.into(),
            "Practice test created successfully",
        )),
    ))
}

/// Get practice test by ID
#[utoipa::path(
    get,
    path = "/api/v1/admin/practice-tests/{id}",
    params(("id" = Uuid, Path, description = "Practice test ID")),
    responses(
        (status = 200, description = "Practice test retrieved", body = ApiResponse<PracticeTestResponse>),
        (status = 404, description = "Practice test not found"),
    ),
    tag = "admin"
)]
pub async fn get_practice_test(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<PracticeTestResponse>>, AppError> {
    let result = state
        .test_management_service
        .get_practice_test(id)
        .await
        .map_err(|e| AppError::from(e))?;

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
            .map_err(|e| AppError::from(e))?
    } else {
        vec![]
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
        (status = 404, description = "Practice test not found"),
    ),
    tag = "admin"
)]
pub async fn update_practice_test(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdatePracticeTestRequest>,
) -> Result<Json<ApiResponse<PracticeTestResponse>>, AppError> {
    request.validate().map_err(|e| AppError::ValidationError(e.to_string()))?;

    let result = state
        .test_management_service
        .update_practice_test(id, request.into_app_request())
        .await
        .map_err(|e| AppError::from(e))?;

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
        (status = 404, description = "Practice test not found"),
    ),
    tag = "admin"
)]
pub async fn delete_practice_test(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    state
        .test_management_service
        .delete_practice_test(id)
        .await
        .map_err(|e| AppError::from(e))?;

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
        .map_err(|e| AppError::from(e))?;

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
        .map_err(|e| AppError::from(e))?;

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
        .map_err(|e| AppError::from(e))?;

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

