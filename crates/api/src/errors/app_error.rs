use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use thiserror::Error;

use application::services::{
    AuthError, ResultError, TestManagementError, TestSolvingError,
};
use infrastructure::security::JwtError;

/// Application error type that implements IntoResponse for Axum.
#[derive(Debug, Error)]
pub enum AppError {
    // Authentication errors
    #[error("Unauthorized")]
    Unauthorized,

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Account is deactivated")]
    AccountDeactivated,

    #[error("Account is deleted")]
    AccountDeleted,

    #[error("Token expired")]
    TokenExpired,

    #[error("Invalid token")]
    InvalidToken,

    #[error("Refresh token expired")]
    RefreshTokenExpired,

    #[error("Refresh token revoked")]
    RefreshTokenRevoked,

    #[error("Invalid refresh token")]
    InvalidRefreshToken,

    // Authorization errors
    #[error("Forbidden: insufficient permissions")]
    Forbidden,

    // Validation errors
    #[error("Validation error: {0}")]
    ValidationError(String),

    // Resource errors
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Cannot retake test yet")]
    CannotRetakeYet,

    // Server errors
    #[error("Internal server error")]
    InternalServerError,

    #[error("Service unavailable")]
    ServiceUnavailable,
}

/// Error response structure for API responses.
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct ErrorResponse {
    pub success: bool,
    pub error: ErrorDetail,
}

/// Detailed error information.
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct ErrorDetail {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<Vec<String>>,
}

impl AppError {
    /// Returns the error code for this error.
    fn error_code(&self) -> &'static str {
        match self {
            AppError::Unauthorized => "UNAUTHORIZED",
            AppError::InvalidCredentials => "INVALID_CREDENTIALS",
            AppError::AccountDeactivated => "ACCOUNT_DEACTIVATED",
            AppError::AccountDeleted => "ACCOUNT_DELETED",
            AppError::TokenExpired => "TOKEN_EXPIRED",
            AppError::InvalidToken => "INVALID_TOKEN",
            AppError::RefreshTokenExpired => "REFRESH_TOKEN_EXPIRED",
            AppError::RefreshTokenRevoked => "REFRESH_TOKEN_REVOKED",
            AppError::InvalidRefreshToken => "INVALID_REFRESH_TOKEN",
            AppError::Forbidden => "FORBIDDEN",
            AppError::ValidationError(_) => "VALIDATION_ERROR",
            AppError::NotFound(_) => "NOT_FOUND",
            AppError::Conflict(_) => "CONFLICT",
            AppError::CannotRetakeYet => "CANNOT_RETAKE_YET",
            AppError::InternalServerError => "INTERNAL_ERROR",
            AppError::ServiceUnavailable => "SERVICE_UNAVAILABLE",
        }
    }

    /// Returns the HTTP status code for this error.
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::Unauthorized
            | AppError::InvalidCredentials
            | AppError::TokenExpired
            | AppError::InvalidToken
            | AppError::RefreshTokenExpired
            | AppError::RefreshTokenRevoked
            | AppError::InvalidRefreshToken => StatusCode::UNAUTHORIZED,
            AppError::AccountDeactivated | AppError::AccountDeleted | AppError::Forbidden => {
                StatusCode::FORBIDDEN
            }
            AppError::ValidationError(_) => StatusCode::BAD_REQUEST,
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
            AppError::Conflict(_) => StatusCode::CONFLICT,
            AppError::CannotRetakeYet => StatusCode::FORBIDDEN,
            AppError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::ServiceUnavailable => StatusCode::SERVICE_UNAVAILABLE,
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let error_response = ErrorResponse {
            success: false,
            error: ErrorDetail {
                code: self.error_code().to_string(),
                message: self.to_string(),
                details: None,
            },
        };

        (status, Json(error_response)).into_response()
    }
}

impl From<AuthError> for AppError {
    fn from(err: AuthError) -> Self {
        match err {
            AuthError::ValidationError(msg) => AppError::ValidationError(msg),
            AuthError::InvalidCredentials => AppError::InvalidCredentials,
            AuthError::AccountDeactivated => AppError::AccountDeactivated,
            AuthError::AccountDeleted => AppError::AccountDeleted,
            AuthError::DuplicateEmail => AppError::Conflict("Email already exists".to_string()),
            AuthError::DuplicateUsername => {
                AppError::Conflict("Username already exists".to_string())
            }
            AuthError::InvalidRefreshToken => AppError::InvalidRefreshToken,
            AuthError::RefreshTokenExpired => AppError::RefreshTokenExpired,
            AuthError::RefreshTokenRevoked => AppError::RefreshTokenRevoked,
            AuthError::UserNotFound => AppError::NotFound("User not found".to_string()),
            AuthError::InternalError(_) => AppError::InternalServerError,
        }
    }
}

impl From<JwtError> for AppError {
    fn from(err: JwtError) -> Self {
        match err {
            JwtError::TokenExpired => AppError::TokenExpired,
            JwtError::InvalidToken | JwtError::DecodingError(_) => AppError::InvalidToken,
            JwtError::EncodingError(_) => AppError::InternalServerError,
        }
    }
}

impl From<TestManagementError> for AppError {
    fn from(err: TestManagementError) -> Self {
        match err {
            TestManagementError::LessonNotFound => AppError::NotFound("Lesson not found".to_string()),
            TestManagementError::ExamTypeNotFound => AppError::NotFound("Exam type not found".to_string()),
            TestManagementError::SubjectNotFound => AppError::NotFound("Subject not found".to_string()),
            TestManagementError::TestBookNotFound => AppError::NotFound("Test book not found".to_string()),
            TestManagementError::PracticeTestNotFound => AppError::NotFound("Practice test not found".to_string()),
            TestManagementError::DuplicateLessonName => AppError::Conflict("Lesson name already exists".to_string()),
            TestManagementError::DuplicateExamTypeName => AppError::Conflict("Exam type name already exists".to_string()),
            TestManagementError::DuplicateSubjectName => AppError::Conflict("Subject name already exists for this exam type".to_string()),
            TestManagementError::DuplicateTestNumber => AppError::Conflict("Test number already exists for this test book".to_string()),
            TestManagementError::InternalError(_) => AppError::InternalServerError,
        }
    }
}

impl From<TestSolvingError> for AppError {
    fn from(err: TestSolvingError) -> Self {
        match err {
            TestSolvingError::PracticeTestNotFound => AppError::NotFound("Practice test not found".to_string()),
            TestSolvingError::CannotRetakeYet => AppError::CannotRetakeYet,
            TestSolvingError::AnswerKeyLengthMismatch => AppError::ValidationError("Answer key length mismatch".to_string()),
            TestSolvingError::UserAnswersLengthMismatch => AppError::ValidationError("User answers length mismatch".to_string()),
            TestSolvingError::InternalError(_) => AppError::InternalServerError,
        }
    }
}

impl From<ResultError> for AppError {
    fn from(err: ResultError) -> Self {
        match err {
            ResultError::TestResultNotFound => AppError::NotFound("Test result not found".to_string()),
            ResultError::InternalError(_) => AppError::InternalServerError,
        }
    }
}

/// Creates a validation error response from a list of validation errors.
pub fn validation_error(errors: Vec<String>) -> AppError {
    AppError::ValidationError(errors.join(", "))
}

