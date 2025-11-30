use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Refresh token entity for managing user sessions.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefreshToken {
    /// Unique identifier for the refresh token
    pub id: Uuid,
    /// ID of the user this token belongs to
    pub user_id: Uuid,
    /// SHA-256 hash of the token (the actual token is never stored)
    pub token_hash: String,
    /// When the token expires
    pub expires_at: DateTime<Utc>,
    /// When the token was created
    pub created_at: DateTime<Utc>,
    /// When the token was revoked (None if still valid)
    pub revoked_at: Option<DateTime<Utc>>,
    /// Reason for revocation
    pub revoked_reason: Option<String>,
    /// ID of the token that replaced this one (for rotation tracking)
    pub replaced_by: Option<Uuid>,
    /// User agent string from the client
    pub user_agent: Option<String>,
    /// IP address of the client
    pub ip_address: Option<String>,
}

impl RefreshToken {
    /// Creates a new refresh token.
    pub fn new(
        user_id: Uuid,
        token_hash: String,
        expires_at: DateTime<Utc>,
        user_agent: Option<String>,
        ip_address: Option<String>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            token_hash,
            expires_at,
            created_at: Utc::now(),
            revoked_at: None,
            revoked_reason: None,
            replaced_by: None,
            user_agent,
            ip_address,
        }
    }

    /// Checks if the token is expired.
    pub fn is_expired(&self) -> bool {
        Utc::now() > self.expires_at
    }

    /// Checks if the token has been revoked.
    pub fn is_revoked(&self) -> bool {
        self.revoked_at.is_some()
    }

    /// Checks if the token is valid (not expired and not revoked).
    pub fn is_valid(&self) -> bool {
        !self.is_expired() && !self.is_revoked()
    }

    /// Revokes the token with a reason.
    pub fn revoke(&mut self, reason: &str) {
        self.revoked_at = Some(Utc::now());
        self.revoked_reason = Some(reason.to_string());
    }

    /// Marks this token as replaced by another token (for rotation).
    pub fn rotate(&mut self, new_token_id: Uuid) {
        self.revoked_at = Some(Utc::now());
        self.revoked_reason = Some("rotated".to_string());
        self.replaced_by = Some(new_token_id);
    }
}

/// Revocation reasons for refresh tokens.
pub mod revocation_reasons {
    pub const LOGOUT: &str = "logout";
    pub const LOGOUT_ALL: &str = "logout_all";
    pub const ROTATED: &str = "rotated";
    pub const PASSWORD_CHANGED: &str = "password_changed";
    pub const ACCOUNT_DEACTIVATED: &str = "account_deactivated";
    pub const ADMIN_REVOKED: &str = "admin_revoked";
}

