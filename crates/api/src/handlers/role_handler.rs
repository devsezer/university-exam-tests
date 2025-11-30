use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use domain::entities::Role;
use domain::repositories::{RoleRepository, UserRepository};
use uuid::Uuid;
use validator::Validate;
use tracing::error;

use crate::dto::request::{AssignRoleRequest, CreateRoleRequest, UpdateRoleRequest};
use crate::dto::response::{ApiResponse, MessageResponse, RoleResponse};
use crate::errors::AppError;
use crate::extractors::RequireAdmin;
use crate::state::AppState;

/// List all roles
#[utoipa::path(
    get,
    path = "/api/v1/admin/roles",
    responses(
        (status = 200, description = "Roles retrieved", body = ApiResponse<Vec<RoleResponse>>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn list_roles(
    State(state): State<AppState>,
    _admin: RequireAdmin,
) -> Result<Json<ApiResponse<Vec<RoleResponse>>>, AppError> {
    let roles = state
        .role_repo
        .list()
        .await
        .map_err(|e| {
            error!("Failed to list roles: {:?}", e);
            AppError::InternalServerError
        })?;

    let role_responses: Vec<RoleResponse> = roles.into_iter().map(RoleResponse::from).collect();

    Ok(Json(ApiResponse::success(role_responses)))
}

/// Create a new role
#[utoipa::path(
    post,
    path = "/api/v1/admin/roles",
    request_body = CreateRoleRequest,
    responses(
        (status = 201, description = "Role created successfully", body = ApiResponse<RoleResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 409, description = "Role name already exists"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn create_role(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Json(request): Json<CreateRoleRequest>,
) -> Result<(StatusCode, Json<ApiResponse<RoleResponse>>), AppError> {
    request
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    // Check if role name already exists
    if let Some(_existing_role) = state
        .role_repo
        .find_by_name(&request.name)
        .await
        .map_err(|e| {
            error!("Failed to check role name existence: {:?}", e);
            AppError::InternalServerError
        })?
    {
        return Err(AppError::Conflict(format!(
            "Role '{}' already exists",
            request.name
        )));
    }

    // Create new role
    let role = Role::new(request.name, request.description);
    let created_role = state
        .role_repo
        .create(&role)
        .await
        .map_err(|e| {
            error!("Failed to create role: {:?}", e);
            AppError::InternalServerError
        })?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            RoleResponse::from(created_role),
            "Role created successfully",
        )),
    ))
}

/// Get role by ID
#[utoipa::path(
    get,
    path = "/api/v1/admin/roles/{id}",
    params(("id" = Uuid, Path, description = "Role ID")),
    responses(
        (status = 200, description = "Role retrieved", body = ApiResponse<RoleResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Role not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn get_role(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<RoleResponse>>, AppError> {
    let role = state
        .role_repo
        .find_by_id(id)
        .await
        .map_err(|e| {
            error!(role_id = ?id, "Failed to find role: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("Role not found".to_string()))?;

    Ok(Json(ApiResponse::success(RoleResponse::from(role))))
}

/// Update a role
#[utoipa::path(
    put,
    path = "/api/v1/admin/roles/{id}",
    params(("id" = Uuid, Path, description = "Role ID")),
    request_body = UpdateRoleRequest,
    responses(
        (status = 200, description = "Role updated successfully", body = ApiResponse<RoleResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Role not found"),
        (status = 409, description = "Role name already exists"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn update_role(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateRoleRequest>,
) -> Result<Json<ApiResponse<RoleResponse>>, AppError> {
    request
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    // Get existing role
    let mut role = state
        .role_repo
        .find_by_id(id)
        .await
        .map_err(|e| {
            error!(role_id = ?id, "Failed to find role: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("Role not found".to_string()))?;

    // Check if it's a system role - don't allow updating system roles
    if role.is_system {
        return Err(AppError::ValidationError(
            "Cannot update system role".to_string(),
        ));
    }

    // Check if new name conflicts with existing role
    if let Some(new_name) = &request.name {
        if new_name != &role.name {
            if let Some(_existing_role) = state
                .role_repo
                .find_by_name(new_name)
                .await
                .map_err(|e| {
                    error!(role_name = new_name, "Failed to check role name: {:?}", e);
                    AppError::InternalServerError
                })?
            {
                return Err(AppError::Conflict(format!(
                    "Role '{}' already exists",
                    new_name
                )));
            }
        }
    }

    // Update role fields
    if let Some(name) = request.name {
        role.name = name;
    }
    if let Some(description) = request.description {
        role.description = Some(description);
    }
    role.updated_at = chrono::Utc::now();

    // Save updated role
    let updated_role = state
        .role_repo
        .update(&role)
        .await
        .map_err(|e| {
            error!(role_id = ?id, "Failed to update role: {:?}", e);
            AppError::InternalServerError
        })?;

    Ok(Json(ApiResponse::success_with_message(
        RoleResponse::from(updated_role),
        "Role updated successfully",
    )))
}

/// Delete a role
#[utoipa::path(
    delete,
    path = "/api/v1/admin/roles/{id}",
    params(("id" = Uuid, Path, description = "Role ID")),
    responses(
        (status = 200, description = "Role deleted successfully", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "Role not found"),
        (status = 400, description = "Cannot delete system role"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn delete_role(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    // Get role to check if it's a system role
    let role = state
        .role_repo
        .find_by_id(id)
        .await
        .map_err(|e| {
            error!(role_id = ?id, "Failed to find role: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("Role not found".to_string()))?;

    // Check if it's a system role - don't allow deleting system roles
    if role.is_system {
        return Err(AppError::ValidationError(
            "Cannot delete system role".to_string(),
        ));
    }

    // Delete role
    state
        .role_repo
        .delete(id)
        .await
        .map_err(|e| {
            error!(role_id = ?id, role_name = %role.name, "Failed to delete role: {:?}", e);
            AppError::InternalServerError
        })?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse::new("Role deleted successfully"),
        format!("Role '{}' deleted", role.name),
    )))
}

/// Assign a role to a user
#[utoipa::path(
    post,
    path = "/api/v1/admin/users/{id}/roles",
    params(("id" = Uuid, Path, description = "User ID")),
    request_body = AssignRoleRequest,
    responses(
        (status = 200, description = "Role assigned successfully", body = ApiResponse<MessageResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "User or role not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn assign_role_to_user(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(user_id): Path<Uuid>,
    Json(request): Json<AssignRoleRequest>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    request
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    let role_id = request.role_id.ok_or_else(|| {
        AppError::ValidationError("role_id is required".to_string())
    })?;

    // Verify user exists
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await
        .map_err(|e| {
            error!(user_id = ?user_id, "Failed to find user: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    if user.is_deleted() {
        return Err(AppError::NotFound("User not found".to_string()));
    }

    // Verify role exists
    let role = state
        .role_repo
        .find_by_id(role_id)
        .await
        .map_err(|e| {
            error!(role_id = ?role_id, "Failed to find role: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("Role not found".to_string()))?;

    // Assign role
    state
        .user_repo
        .assign_role(user_id, role_id, None)
        .await
        .map_err(|e| {
            error!(
                user_id = ?user_id,
                role_id = ?role_id,
                role_name = %role.name,
                "Failed to assign role: {:?}",
                e
            );
            AppError::InternalServerError
        })?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse::new("Role assigned successfully"),
        format!("Role '{}' assigned to user", role.name),
    )))
}

/// Remove a role from a user
#[utoipa::path(
    delete,
    path = "/api/v1/admin/users/{id}/roles/{role_id}",
    params(
        ("id" = Uuid, Path, description = "User ID"),
        ("role_id" = Uuid, Path, description = "Role ID")
    ),
    responses(
        (status = 200, description = "Role removed successfully", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "User or role not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn remove_role_from_user(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path((user_id, role_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    // Verify user exists
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await
        .map_err(|e| {
            error!(user_id = ?user_id, "Failed to find user: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    if user.is_deleted() {
        return Err(AppError::NotFound("User not found".to_string()));
    }

    // Verify role exists
    let role = state
        .role_repo
        .find_by_id(role_id)
        .await
        .map_err(|e| {
            error!(role_id = ?role_id, "Failed to find role: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("Role not found".to_string()))?;

    // Check if it's a system role - don't allow removing system roles
    if role.is_system {
        return Err(AppError::ValidationError(
            "Cannot remove system role".to_string(),
        ));
    }

    // Remove role
    state
        .user_repo
        .remove_role(user_id, role_id)
        .await
        .map_err(|e| {
            error!(
                user_id = ?user_id,
                role_id = ?role_id,
                role_name = %role.name,
                "Failed to remove role: {:?}",
                e
            );
            AppError::InternalServerError
        })?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse::new("Role removed successfully"),
        format!("Role '{}' removed from user", role.name),
    )))
}

