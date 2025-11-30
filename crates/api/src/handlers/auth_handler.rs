use axum::{
    extract::{ConnectInfo, State},
    http::StatusCode,
    Json,
};
use std::net::SocketAddr;
use validator::Validate;
use tracing::error;

use crate::dto::request::{LoginRequest, LogoutRequest, RefreshTokenRequest, RegisterRequest};
use crate::dto::response::{ApiResponse, AuthResponse, MessageResponse, RegisterResponse, TokenResponse, UserResponse};
use crate::errors::AppError;
use crate::extractors::CurrentUser;
use crate::state::AppState;

/// Handler for user registration.
#[utoipa::path(
    post,
    path = "/api/v1/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "User registered successfully", body = ApiResponse<RegisterResponse>),
        (status = 400, description = "Validation error"),
        (status = 409, description = "Email or username already exists"),
    ),
    tag = "auth"
)]
pub async fn register(
    State(state): State<AppState>,
    Json(request): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<ApiResponse<RegisterResponse>>), AppError> {
    // Validate request
    request
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    // Call auth service
    let result = state
        .auth_service
        .register(request.into_app_request())
        .await
        .map_err(|e| {
            error!("Registration failed: {:?}", e);
            AppError::from(e)
        })?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            RegisterResponse::from(result),
            "User registered successfully",
        )),
    ))
}

/// Handler for user login.
#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = ApiResponse<AuthResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Invalid credentials"),
        (status = 403, description = "Account deactivated"),
    ),
    tag = "auth"
)]
pub async fn login(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(request): Json<LoginRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, AppError> {
    // Validate request
    request
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    // Get client info
    let ip_address = Some(addr.ip().to_string());
    let user_agent = None; // Could be extracted from headers

    // Call auth service
    let result = state
        .auth_service
        .login(request.into_app_request(), user_agent, ip_address)
        .await
        .map_err(|e| {
            tracing::error!("Login error: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success_with_message(
        AuthResponse::from(result),
        "Login successful",
    )))
}

/// Handler for token refresh.
#[utoipa::path(
    post,
    path = "/api/v1/auth/refresh",
    request_body = RefreshTokenRequest,
    responses(
        (status = 200, description = "Token refreshed successfully", body = ApiResponse<TokenResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Invalid or expired refresh token"),
    ),
    tag = "auth"
)]
pub async fn refresh_token(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(request): Json<RefreshTokenRequest>,
) -> Result<Json<ApiResponse<TokenResponse>>, AppError> {
    // Validate request
    request
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    // Get client info
    let ip_address = Some(addr.ip().to_string());
    let user_agent = None;

    // Call auth service
    let result = state
        .auth_service
        .refresh_token(request.into_app_request(), user_agent, ip_address)
        .await
        .map_err(|e| {
            error!("Token refresh failed: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success_with_message(
        TokenResponse::from(result),
        "Token refreshed successfully",
    )))
}

/// Handler for user logout.
#[utoipa::path(
    post,
    path = "/api/v1/auth/logout",
    request_body = LogoutRequest,
    responses(
        (status = 200, description = "Logged out successfully", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "auth"
)]
pub async fn logout(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(request): Json<LogoutRequest>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    // Call auth service
    state
        .auth_service
        .logout(current_user.id, request.into_app_request())
        .await
        .map_err(|e| {
            error!(user_id = ?current_user.id, "Logout failed: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success(MessageResponse::new(
        "Logged out successfully",
    ))))
}

/// Handler to get current user information.
#[utoipa::path(
    get,
    path = "/api/v1/auth/me",
    responses(
        (status = 200, description = "Current user information", body = ApiResponse<UserResponse>),
        (status = 401, description = "Unauthorized"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "auth"
)]
pub async fn get_current_user(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    // Call auth service
    let result = state
        .auth_service
        .get_current_user(current_user.id)
        .await
        .map_err(|e| {
            error!(user_id = ?current_user.id, "Failed to get current user: {:?}", e);
            AppError::from(e)
        })?;

    Ok(Json(ApiResponse::success(UserResponse::from(result))))
}

