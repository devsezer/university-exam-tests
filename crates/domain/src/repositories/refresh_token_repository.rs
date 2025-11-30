use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::RefreshToken;
use crate::errors::DomainError;

/// Repository trait for refresh token data access operations.
#[async_trait]
pub trait RefreshTokenRepository: Send + Sync {
    /// Creates a new refresh token in the database.
    async fn create(&self, token: &RefreshToken) -> Result<RefreshToken, DomainError>;

    /// Finds a refresh token by its hash.
    async fn find_by_hash(&self, token_hash: &str) -> Result<Option<RefreshToken>, DomainError>;

    /// Finds a refresh token by its ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<RefreshToken>, DomainError>;

    /// Revokes a specific refresh token.
    async fn revoke(&self, id: Uuid, reason: &str) -> Result<(), DomainError>;

    /// Revokes all refresh tokens for a user.
    async fn revoke_all_for_user(&self, user_id: Uuid, reason: &str) -> Result<u64, DomainError>;

    /// Marks a token as rotated and links to the new token.
    async fn rotate(&self, old_token_id: Uuid, new_token_id: Uuid) -> Result<(), DomainError>;

    /// Deletes expired tokens (cleanup job).
    async fn delete_expired(&self) -> Result<u64, DomainError>;

    /// Counts active tokens for a user.
    async fn count_active_for_user(&self, user_id: Uuid) -> Result<u64, DomainError>;
}

