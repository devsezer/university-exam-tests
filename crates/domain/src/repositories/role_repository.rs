use async_trait::async_trait;
use uuid::Uuid;

use crate::entities::Role;
use crate::errors::DomainError;

/// Repository trait for role data access operations.
#[async_trait]
pub trait RoleRepository: Send + Sync {
    /// Creates a new role in the database.
    async fn create(&self, role: &Role) -> Result<Role, DomainError>;

    /// Finds a role by its unique ID.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Role>, DomainError>;

    /// Finds a role by its name (case-insensitive).
    async fn find_by_name(&self, name: &str) -> Result<Option<Role>, DomainError>;

    /// Lists all roles.
    async fn list(&self) -> Result<Vec<Role>, DomainError>;

    /// Updates an existing role.
    async fn update(&self, role: &Role) -> Result<Role, DomainError>;

    /// Deletes a role by ID.
    async fn delete(&self, id: Uuid) -> Result<(), DomainError>;

    /// Finds all roles assigned to a specific user.
    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<Role>, DomainError>;
}

