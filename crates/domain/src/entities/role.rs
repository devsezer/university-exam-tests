use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Role entity representing a role in the system.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    /// Unique identifier for the role
    pub id: Uuid,
    /// Unique role name
    pub name: String,
    /// Optional description of the role
    pub description: Option<String>,
    /// Whether this is a system role (cannot be deleted)
    pub is_system: bool,
    /// Timestamp when the role was created
    pub created_at: DateTime<Utc>,
    /// Timestamp when the role was last updated
    pub updated_at: DateTime<Utc>,
}

impl Role {
    /// Creates a new role with the given details.
    pub fn new(name: String, description: Option<String>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            description,
            is_system: false,
            created_at: now,
            updated_at: now,
        }
    }

    /// Checks if this is a system role.
    pub fn is_system_role(&self) -> bool {
        self.is_system
    }
}

