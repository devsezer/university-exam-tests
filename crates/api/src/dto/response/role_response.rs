use chrono::{DateTime, Utc};
use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

/// Role response DTO.
#[derive(Debug, Serialize, ToSchema)]
pub struct RoleResponse {
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub id: Uuid,
    #[schema(example = "admin")]
    pub name: String,
    #[schema(example = "Administrator with full system access")]
    pub description: Option<String>,
    pub is_system: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<domain::entities::Role> for RoleResponse {
    fn from(role: domain::entities::Role) -> Self {
        Self {
            id: role.id,
            name: role.name,
            description: role.description,
            is_system: role.is_system,
            created_at: role.created_at,
            updated_at: role.updated_at,
        }
    }
}

