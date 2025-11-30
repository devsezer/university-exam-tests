use utoipa::openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme};
use utoipa::{Modify, OpenApi};

use crate::dto::request::{LoginRequest, LogoutRequest, RefreshTokenRequest, RegisterRequest};
use crate::dto::response::{
    AuthResponse, HealthCheckResult, HealthChecks, LivenessResponse, MessageResponse,
    ReadinessResponse, RegisterResponse, TokenResponse, UserResponse,
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
    ),
    components(
        schemas(
            // Request schemas
            RegisterRequest,
            LoginRequest,
            RefreshTokenRequest,
            LogoutRequest,
            // Response schemas
            RegisterResponse,
            AuthResponse,
            TokenResponse,
            UserResponse,
            MessageResponse,
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
        (name = "health", description = "Health check endpoints")
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

