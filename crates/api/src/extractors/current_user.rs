use axum::{
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts},
};
use uuid::Uuid;

use crate::errors::AppError;
use crate::state::AppState;
use infrastructure::security::JwtError;

/// Extractor for the current authenticated user.
#[derive(Debug, Clone)]
pub struct CurrentUser {
    /// User ID from the JWT
    pub id: Uuid,
    /// User's roles
    pub roles: Vec<String>,
    /// User's permissions
    pub permissions: Vec<String>,
}

impl CurrentUser {
    /// Checks if the user has a specific role.
    pub fn has_role(&self, role: &str) -> bool {
        self.roles.iter().any(|r| r == role)
    }

    /// Checks if the user has a specific permission.
    pub fn has_permission(&self, permission: &str) -> bool {
        self.permissions.iter().any(|p| p == permission)
    }

    /// Checks if the user is a super admin.
    pub fn is_super_admin(&self) -> bool {
        self.has_role("super_admin")
    }

    /// Checks if the user is an admin (either admin or super_admin).
    pub fn is_admin(&self) -> bool {
        self.has_role("admin") || self.has_role("super_admin")
    }
}

impl FromRequestParts<AppState> for CurrentUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        // Extract the Authorization header
        let auth_header = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .ok_or(AppError::Unauthorized)?;

        // Check for Bearer token
        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or(AppError::Unauthorized)?;

        // Validate the token
        let claims = state
            .jwt_service
            .validate_access_token(token)
            .map_err(|e| match e {
                JwtError::TokenExpired => AppError::TokenExpired,
                _ => AppError::InvalidToken,
            })?;

        Ok(CurrentUser {
            id: claims.sub,
            roles: claims.roles,
            permissions: claims.permissions,
        })
    }
}

/// Optional current user extractor (for endpoints that work with or without auth).
#[derive(Debug, Clone)]
pub struct OptionalCurrentUser(pub Option<CurrentUser>);

impl FromRequestParts<AppState> for OptionalCurrentUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        match CurrentUser::from_request_parts(parts, state).await {
            Ok(user) => Ok(OptionalCurrentUser(Some(user))),
            Err(_) => Ok(OptionalCurrentUser(None)),
        }
    }
}

