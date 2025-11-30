use thiserror::Error;
use uuid::Uuid;

/// Domain-level errors representing business rule violations and domain-specific issues.
#[derive(Debug, Error)]
pub enum DomainError {
    // Validation errors
    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Invalid email format: {0}")]
    InvalidEmail(String),

    #[error("Invalid username: {0}")]
    InvalidUsername(String),

    #[error("Password does not meet requirements: {0}")]
    InvalidPassword(String),

    // Not found errors
    #[error("User not found: {0}")]
    UserNotFound(Uuid),

    #[error("User not found with email: {0}")]
    UserNotFoundByEmail(String),

    #[error("User not found with username: {0}")]
    UserNotFoundByUsername(String),

    #[error("Refresh token not found")]
    RefreshTokenNotFound,

    #[error("Role not found: {0}")]
    RoleNotFound(Uuid),

    #[error("Permission not found: {0}")]
    PermissionNotFound(Uuid),

    // Conflict errors
    #[error("Email already exists: {0}")]
    DuplicateEmail(String),

    #[error("Username already exists: {0}")]
    DuplicateUsername(String),

    #[error("Role already exists: {0}")]
    DuplicateRole(String),

    #[error("Permission already exists: {0}")]
    DuplicatePermission(String),

    // Authentication/Authorization errors
    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Account is deactivated")]
    AccountDeactivated,

    #[error("Account is deleted")]
    AccountDeleted,

    #[error("Refresh token expired")]
    RefreshTokenExpired,

    #[error("Refresh token revoked")]
    RefreshTokenRevoked,

    #[error("Insufficient permissions")]
    InsufficientPermissions,

    // Business rule violations
    #[error("Cannot delete own account")]
    CannotDeleteSelf,

    #[error("Cannot delete system role: {0}")]
    CannotDeleteSystemRole(String),

    #[error("Cannot modify system role: {0}")]
    CannotModifySystemRole(String),

    #[error("User is already deleted")]
    UserAlreadyDeleted,

    #[error("User is not deleted")]
    UserNotDeleted,

    // Infrastructure errors (should be mapped from infra layer)
    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Cache error: {0}")]
    CacheError(String),

    #[error("Internal error: {0}")]
    InternalError(String),
}

impl DomainError {
    /// Returns true if this is a not-found type error.
    pub fn is_not_found(&self) -> bool {
        matches!(
            self,
            DomainError::UserNotFound(_)
                | DomainError::UserNotFoundByEmail(_)
                | DomainError::UserNotFoundByUsername(_)
                | DomainError::RefreshTokenNotFound
                | DomainError::RoleNotFound(_)
                | DomainError::PermissionNotFound(_)
        )
    }

    /// Returns true if this is a conflict/duplicate type error.
    pub fn is_conflict(&self) -> bool {
        matches!(
            self,
            DomainError::DuplicateEmail(_)
                | DomainError::DuplicateUsername(_)
                | DomainError::DuplicateRole(_)
                | DomainError::DuplicatePermission(_)
        )
    }

    /// Returns true if this is an authentication/authorization error.
    pub fn is_auth_error(&self) -> bool {
        matches!(
            self,
            DomainError::InvalidCredentials
                | DomainError::AccountDeactivated
                | DomainError::AccountDeleted
                | DomainError::RefreshTokenExpired
                | DomainError::RefreshTokenRevoked
                | DomainError::InsufficientPermissions
        )
    }
}

