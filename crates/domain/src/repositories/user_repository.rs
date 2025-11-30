use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::User;
use crate::errors::DomainError;

/// Repository trait for user data access operations.
#[async_trait]
pub trait UserRepository: Send + Sync {
    /// Creates a new user in the database.
    async fn create(&self, user: &User) -> Result<User, DomainError>;

    /// Finds a user by their unique ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, DomainError>;

    /// Finds a user by their email address (case-insensitive).
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, DomainError>;

    /// Finds a user by their username (case-insensitive).
    async fn find_by_username(&self, username: &str) -> Result<Option<User>, DomainError>;

    /// Updates an existing user.
    async fn update(&self, user: &User) -> Result<User, DomainError>;

    /// Performs a soft delete on a user.
    async fn soft_delete(&self, id: Uuid, deleted_by: Uuid) -> Result<(), DomainError>;

    /// Restores a soft-deleted user.
    async fn restore(&self, id: Uuid) -> Result<(), DomainError>;

    /// Permanently deletes a user (use with caution).
    async fn hard_delete(&self, id: Uuid) -> Result<(), DomainError>;

    /// Checks if an email is already taken.
    async fn email_exists(&self, email: &str) -> Result<bool, DomainError>;

    /// Checks if a username is already taken.
    async fn username_exists(&self, username: &str) -> Result<bool, DomainError>;

    /// Lists all users with pagination, optionally including soft-deleted users.
    async fn list(
        &self,
        page: u32,
        per_page: u32,
        include_deleted: bool,
    ) -> Result<(Vec<User>, u64), DomainError>;

    /// Assigns a role to a user.
    async fn assign_role(
        &self,
        user_id: Uuid,
        role_id: Uuid,
        assigned_by: Option<Uuid>,
    ) -> Result<(), DomainError>;

    /// Removes a role from a user.
    async fn remove_role(&self, user_id: Uuid, role_id: Uuid) -> Result<(), DomainError>;

    /// Gets all role names for a user.
    async fn get_user_roles(&self, user_id: Uuid) -> Result<Vec<String>, DomainError>;
}

