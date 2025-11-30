use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

/// Request DTO for user registration.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegisterRequest {
    /// Username (3-50 characters, alphanumeric and underscores)
    #[validate(length(min = 3, max = 50, message = "Username must be between 3 and 50 characters"))]
    #[validate(regex(
        path = *USERNAME_REGEX,
        message = "Username can only contain letters, numbers, and underscores"
    ))]
    pub username: String,

    /// Email address
    #[validate(email(message = "Invalid email format"))]
    pub email: String,

    /// Password (minimum 8 characters)
    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,
}

/// Request DTO for user login.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct LoginRequest {
    /// Email address
    #[validate(email(message = "Invalid email format"))]
    pub email: String,

    /// Password
    #[validate(length(min = 1, message = "Password is required"))]
    pub password: String,
}

/// Request DTO for token refresh.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RefreshRequest {
    /// The refresh token
    #[validate(length(min = 1, message = "Refresh token is required"))]
    pub refresh_token: String,
}

/// Request DTO for logout.
#[derive(Debug, Clone, Deserialize, Default)]
pub struct LogoutRequest {
    /// Optional: specific refresh token to revoke
    pub refresh_token: Option<String>,
    /// Whether to logout from all devices
    #[serde(default)]
    pub all_devices: bool,
}

/// Response DTO for successful authentication.
#[derive(Debug, Clone, Serialize)]
pub struct AuthResponse {
    /// JWT access token
    pub access_token: String,
    /// Refresh token (opaque)
    pub refresh_token: String,
    /// Token type (always "Bearer")
    pub token_type: String,
    /// Access token expiration in seconds
    pub expires_in: i64,
    /// Refresh token expiration in seconds
    pub refresh_expires_in: i64,
    /// User information
    pub user: UserResponse,
}

/// Response DTO for token refresh.
#[derive(Debug, Clone, Serialize)]
pub struct TokenResponse {
    /// JWT access token
    pub access_token: String,
    /// New refresh token
    pub refresh_token: String,
    /// Token type (always "Bearer")
    pub token_type: String,
    /// Access token expiration in seconds
    pub expires_in: i64,
    /// Refresh token expiration in seconds
    pub refresh_expires_in: i64,
}

/// Response DTO for user information.
#[derive(Debug, Clone, Serialize)]
pub struct UserResponse {
    /// User ID
    pub id: Uuid,
    /// Username
    pub username: String,
    /// Email address
    pub email: String,
    /// Whether the account is active
    pub is_active: bool,
    /// User's roles
    pub roles: Vec<String>,
    /// When the user was created
    pub created_at: DateTime<Utc>,
    /// When the user was last updated
    pub updated_at: DateTime<Utc>,
}

/// Response DTO for registration success.
#[derive(Debug, Clone, Serialize)]
pub struct RegisterResponse {
    /// User ID
    pub id: Uuid,
    /// Username
    pub username: String,
    /// Email address
    pub email: String,
    /// When the user was created
    pub created_at: DateTime<Utc>,
}

// Lazy regex for username validation
use once_cell::sync::Lazy;
use regex::Regex;

static USERNAME_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[a-zA-Z0-9_]+$").unwrap());

impl RegisterRequest {
    /// Normalizes the request data (lowercase email, trim whitespace).
    pub fn normalize(&mut self) {
        self.username = self.username.trim().to_string();
        self.email = self.email.trim().to_lowercase();
    }
}

impl LoginRequest {
    /// Normalizes the request data (lowercase email, trim whitespace).
    pub fn normalize(&mut self) {
        self.email = self.email.trim().to_lowercase();
    }
}

