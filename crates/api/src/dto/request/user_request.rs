use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

/// Request to assign a role to a user.
#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct AssignRoleRequest {
    /// Role ID to assign
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    #[validate(required)]
    pub role_id: Option<Uuid>,
}

/// Request to create a new role.
#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct CreateRoleRequest {
    /// Role name
    #[schema(example = "moderator")]
    #[validate(length(min = 1, max = 50, message = "Role name must be between 1 and 50 characters"))]
    pub name: String,
    /// Optional description
    #[schema(example = "Moderator role with limited permissions")]
    pub description: Option<String>,
}

/// Request to update a role.
#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct UpdateRoleRequest {
    /// Role name
    #[schema(example = "moderator")]
    #[validate(length(min = 1, max = 50, message = "Role name must be between 1 and 50 characters"))]
    pub name: Option<String>,
    /// Optional description
    #[schema(example = "Moderator role with limited permissions")]
    pub description: Option<String>,
}

