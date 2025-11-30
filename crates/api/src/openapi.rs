use utoipa::openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme};
use utoipa::{Modify, OpenApi};

use crate::dto::request::{
    AssignRoleRequest, CreateExamTypeRequest, CreateLessonRequest, CreatePracticeTestRequest,
    CreateRoleRequest, CreateSubjectRequest, CreateTestBookRequest, LoginRequest, LogoutRequest,
    RefreshTokenRequest, RegisterRequest, SolveTestRequest, UpdateExamTypeRequest,
    UpdateLessonRequest, UpdatePracticeTestRequest, UpdateRoleRequest, UpdateSubjectRequest,
    UpdateTestBookRequest,
};
use crate::dto::response::{
    AuthResponse, ExamTypeResponse, HealthCheckResult, HealthChecks, LessonResponse,
    LivenessResponse, MessageResponse, PaginationInfo, PracticeTestResponse, ReadinessResponse,
    RegisterResponse, RoleResponse, SolveTestResponse, SubjectResponse, TestBookResponse,
    TestResultResponse, TokenResponse, UserResponse,
};
use crate::errors::{ErrorDetail, ErrorResponse};

/// OpenAPI documentation configuration.
#[derive(OpenApi)]
#[openapi(
    info(
        title = "Rust API Boilerplate",
        version = "1.0.0",
        description = "A production-ready Rust REST API with Clean Architecture, JWT authentication, and refresh token rotation.",
        license(name = "MIT"),
        contact(
            name = "Engineering Team",
            email = "engineering@example.com"
        )
    ),
    servers(
        (url = "http://localhost:8080", description = "Local development server")
    ),
    paths(
        crate::handlers::register,
        crate::handlers::login,
        crate::handlers::refresh_token,
        crate::handlers::logout,
        crate::handlers::get_current_user,
        crate::handlers::liveness,
        crate::handlers::readiness,
        crate::handlers::create_lesson,
        crate::handlers::get_lesson,
        crate::handlers::list_lessons,
        crate::handlers::list_admin_lessons,
        crate::handlers::update_lesson,
        crate::handlers::delete_lesson,
        crate::handlers::create_exam_type,
        crate::handlers::get_exam_type,
        crate::handlers::list_exam_types,
        crate::handlers::list_admin_exam_types,
        crate::handlers::update_exam_type,
        crate::handlers::delete_exam_type,
        crate::handlers::create_subject,
        crate::handlers::get_subject,
        crate::handlers::list_subjects,
        crate::handlers::list_admin_subjects,
        crate::handlers::update_subject,
        crate::handlers::delete_subject,
        crate::handlers::create_test_book,
        crate::handlers::get_test_book,
        crate::handlers::list_test_books,
        crate::handlers::list_admin_test_books,
        crate::handlers::update_test_book,
        crate::handlers::delete_test_book,
        crate::handlers::create_practice_test,
        crate::handlers::get_practice_test,
        crate::handlers::list_practice_tests,
        crate::handlers::list_admin_practice_tests,
        crate::handlers::update_practice_test,
        crate::handlers::delete_practice_test,
        crate::handlers::solve_test,
        crate::handlers::get_result,
        crate::handlers::list_my_results,
        crate::handlers::list_roles,
        crate::handlers::create_role,
        crate::handlers::get_role,
        crate::handlers::update_role,
        crate::handlers::delete_role,
        crate::handlers::assign_role_to_user,
        crate::handlers::remove_role_from_user,
    ),
    components(
        schemas(
            // Request schemas
            RegisterRequest,
            LoginRequest,
            RefreshTokenRequest,
            LogoutRequest,
            CreateLessonRequest,
            UpdateLessonRequest,
            CreateExamTypeRequest,
            UpdateExamTypeRequest,
            CreateSubjectRequest,
            UpdateSubjectRequest,
            CreateTestBookRequest,
            UpdateTestBookRequest,
            CreatePracticeTestRequest,
            UpdatePracticeTestRequest,
            SolveTestRequest,
            AssignRoleRequest,
            CreateRoleRequest,
            UpdateRoleRequest,
            // Response schemas
            RegisterResponse,
            AuthResponse,
            TokenResponse,
            UserResponse,
            MessageResponse,
            LessonResponse,
            ExamTypeResponse,
            SubjectResponse,
            TestBookResponse,
            PracticeTestResponse,
            TestResultResponse,
            SolveTestResponse,
            RoleResponse,
            PaginationInfo,
            LivenessResponse,
            ReadinessResponse,
            HealthChecks,
            HealthCheckResult,
            // Error schemas
            ErrorResponse,
            ErrorDetail,
        )
    ),
    modifiers(&SecurityAddon),
    tags(
        (name = "auth", description = "Authentication endpoints"),
        (name = "health", description = "Health check endpoints"),
        (name = "admin", description = "Admin endpoints (requires authentication)"),
        (name = "tests", description = "Test management and solving endpoints")
    )
)]
pub struct ApiDoc;

/// Security addon to add bearer authentication to OpenAPI spec.
struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearer_auth",
                SecurityScheme::Http(
                    HttpBuilder::new()
                        .scheme(HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .description(Some("JWT Bearer token authentication"))
                        .build(),
                ),
            );
        }
    }
}

