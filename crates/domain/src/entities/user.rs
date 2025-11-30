use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// User entity representing a registered user in the system.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    /// Unique identifier for the user
    pub id: Uuid,
    /// Unique username (case-insensitive)
    pub username: String,
    /// Unique email address (case-insensitive)
    pub email: String,
    /// Argon2 hashed password
    pub password_hash: String,
    /// Whether the user account is active
    pub is_active: bool,
    /// Timestamp when the user was created
    pub created_at: DateTime<Utc>,
    /// Timestamp when the user was last updated
    pub updated_at: DateTime<Utc>,
    /// Timestamp when the user was soft deleted (None if not deleted)
    pub deleted_at: Option<DateTime<Utc>>,
    /// ID of the user who performed the deletion
    pub deleted_by: Option<Uuid>,
}

impl User {
    /// Creates a new user with the given details.
    pub fn new(username: String, email: String, password_hash: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            username,
            email,
            password_hash,
            is_active: true,
            created_at: now,
            updated_at: now,
            deleted_at: None,
            deleted_by: None,
        }
    }

    /// Checks if the user is soft deleted.
    pub fn is_deleted(&self) -> bool {
        self.deleted_at.is_some()
    }

    /// Marks the user as soft deleted.
    pub fn soft_delete(&mut self, deleted_by: Uuid) {
        self.deleted_at = Some(Utc::now());
        self.deleted_by = Some(deleted_by);
        self.updated_at = Utc::now();
    }

    /// Restores a soft-deleted user.
    pub fn restore(&mut self) {
        self.deleted_at = None;
        self.deleted_by = None;
        self.updated_at = Utc::now();
    }

    /// Deactivates the user account.
    pub fn deactivate(&mut self) {
        self.is_active = false;
        self.updated_at = Utc::now();
    }

    /// Activates the user account.
    pub fn activate(&mut self) {
        self.is_active = true;
        self.updated_at = Utc::now();
    }
}

