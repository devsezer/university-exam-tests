use serde::Deserialize;
use utoipa::ToSchema;
use validator::Validate;

/// Request body for user registration.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct RegisterRequest {
    /// Username (3-50 characters, alphanumeric and underscores)
    #[schema(example = "john_doe", min_length = 3, max_length = 50)]
    #[validate(length(min = 3, max = 50, message = "Username must be between 3 and 50 characters"))]
    pub username: String,

    /// Email address
    #[schema(example = "john@example.com")]
    #[validate(email(message = "Invalid email format"))]
    pub email: String,

    /// Password (minimum 8 characters)
    #[schema(example = "SecureP@ss123", min_length = 8)]
    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,
}

/// Request body for user login.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    /// Email address
    #[schema(example = "john@example.com")]
    #[validate(email(message = "Invalid email format"))]
    pub email: String,

    /// Password
    #[schema(example = "SecureP@ss123")]
    #[validate(length(min = 1, message = "Password is required"))]
    pub password: String,
}

/// Request body for token refresh.
#[derive(Debug, Clone, Deserialize, Validate, ToSchema)]
pub struct RefreshTokenRequest {
    /// The refresh token received during login
    #[schema(example = "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...")]
    #[validate(length(min = 1, message = "Refresh token is required"))]
    pub refresh_token: String,
}

/// Request body for logout.
#[derive(Debug, Clone, Deserialize, Default, ToSchema)]
pub struct LogoutRequest {
    /// Optional: specific refresh token to revoke
    #[schema(example = "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...")]
    pub refresh_token: Option<String>,

    /// Whether to logout from all devices
    #[schema(example = false, default = false)]
    #[serde(default)]
    pub all_devices: bool,
}

impl RegisterRequest {
    /// Converts to the application layer DTO.
    pub fn into_app_request(self) -> application::dto::RegisterRequest {
        application::dto::RegisterRequest {
            username: self.username,
            email: self.email,
            password: self.password,
        }
    }
}

impl LoginRequest {
    /// Converts to the application layer DTO.
    pub fn into_app_request(self) -> application::dto::LoginRequest {
        application::dto::LoginRequest {
            email: self.email,
            password: self.password,
        }
    }
}

impl RefreshTokenRequest {
    /// Converts to the application layer DTO.
    pub fn into_app_request(self) -> application::dto::RefreshRequest {
        application::dto::RefreshRequest {
            refresh_token: self.refresh_token,
        }
    }
}

impl LogoutRequest {
    /// Converts to the application layer DTO.
    pub fn into_app_request(self) -> application::dto::LogoutRequest {
        application::dto::LogoutRequest {
            refresh_token: self.refresh_token,
            all_devices: self.all_devices,
        }
    }
}

