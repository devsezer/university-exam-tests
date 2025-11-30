use chrono::{DateTime, Utc};
use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

/// Wrapper for successful API responses.
#[derive(Debug, Serialize, ToSchema)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub data: T,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data,
            message: None,
        }
    }

    pub fn success_with_message(data: T, message: impl Into<String>) -> Self {
        Self {
            success: true,
            data,
            message: Some(message.into()),
        }
    }
}

/// Response for successful registration.
#[derive(Debug, Serialize, ToSchema)]
pub struct RegisterResponse {
    /// User ID
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    /// Username
    #[schema(example = "john_doe")]
    pub username: String,
    /// Email address
    #[schema(example = "john@example.com")]
    pub email: String,
    /// When the user was created
    pub created_at: DateTime<Utc>,
}

/// Response for successful authentication (login).
#[derive(Debug, Serialize, ToSchema)]
pub struct AuthResponse {
    /// JWT access token
    #[schema(example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
    pub access_token: String,
    /// Refresh token (opaque)
    #[schema(example = "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...")]
    pub refresh_token: String,
    /// Token type (always "Bearer")
    #[schema(example = "Bearer")]
    pub token_type: String,
    /// Access token expiration in seconds
    #[schema(example = 900)]
    pub expires_in: i64,
    /// Refresh token expiration in seconds
    #[schema(example = 604800)]
    pub refresh_expires_in: i64,
    /// User information
    pub user: UserResponse,
}

/// Response for token refresh.
#[derive(Debug, Serialize, ToSchema)]
pub struct TokenResponse {
    /// New JWT access token
    #[schema(example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
    pub access_token: String,
    /// New refresh token
    #[schema(example = "dGhpcyBpcyBhIG5ldyByZWZyZXNoIHRva2Vu...")]
    pub refresh_token: String,
    /// Token type (always "Bearer")
    #[schema(example = "Bearer")]
    pub token_type: String,
    /// Access token expiration in seconds
    #[schema(example = 900)]
    pub expires_in: i64,
    /// Refresh token expiration in seconds
    #[schema(example = 604800)]
    pub refresh_expires_in: i64,
}

/// User information response.
#[derive(Debug, Serialize, ToSchema)]
pub struct UserResponse {
    /// User ID
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    /// Username
    #[schema(example = "john_doe")]
    pub username: String,
    /// Email address
    #[schema(example = "john@example.com")]
    pub email: String,
    /// Whether the account is active
    #[schema(example = true)]
    pub is_active: bool,
    /// User's roles
    #[schema(example = json!(["user"]))]
    pub roles: Vec<String>,
    /// When the user was created
    pub created_at: DateTime<Utc>,
    /// When the user was last updated
    pub updated_at: DateTime<Utc>,
}

/// Simple message response.
#[derive(Debug, Serialize, ToSchema)]
pub struct MessageResponse {
    pub message: String,
}

impl MessageResponse {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

/// Pagination information.
#[derive(Debug, Serialize, ToSchema)]
pub struct PaginationInfo {
    pub page: u32,
    pub per_page: u32,
    pub total_items: u64,
    pub total_pages: u32,
}

/// Paginated response wrapper.
#[derive(Debug, Serialize, ToSchema)]
pub struct PaginatedResponse<T: Serialize> {
    pub items: Vec<T>,
    pub pagination: PaginationInfo,
}

// Conversion from application layer DTOs

impl From<application::dto::RegisterResponse> for RegisterResponse {
    fn from(resp: application::dto::RegisterResponse) -> Self {
        Self {
            id: resp.id,
            username: resp.username,
            email: resp.email,
            created_at: resp.created_at,
        }
    }
}

impl From<application::dto::AuthResponse> for AuthResponse {
    fn from(resp: application::dto::AuthResponse) -> Self {
        Self {
            access_token: resp.access_token,
            refresh_token: resp.refresh_token,
            token_type: resp.token_type,
            expires_in: resp.expires_in,
            refresh_expires_in: resp.refresh_expires_in,
            user: UserResponse::from(resp.user),
        }
    }
}

impl From<application::dto::TokenResponse> for TokenResponse {
    fn from(resp: application::dto::TokenResponse) -> Self {
        Self {
            access_token: resp.access_token,
            refresh_token: resp.refresh_token,
            token_type: resp.token_type,
            expires_in: resp.expires_in,
            refresh_expires_in: resp.refresh_expires_in,
        }
    }
}

impl From<application::dto::UserResponse> for UserResponse {
    fn from(resp: application::dto::UserResponse) -> Self {
        Self {
            id: resp.id,
            username: resp.username,
            email: resp.email,
            is_active: resp.is_active,
            roles: resp.roles,
            created_at: resp.created_at,
            updated_at: resp.updated_at,
        }
    }
}

