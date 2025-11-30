use axum::{
    extract::{Path, Query, State},
    Json,
};
use uuid::Uuid;
use validator::Validate;
use tracing::error;
use std::collections::HashMap;

use domain::repositories::UserRepository;

use crate::dto::request::UpdateUserRequest;
use crate::dto::response::{ApiResponse, MessageResponse, PaginatedResponse, UserResponse, PaginationInfo};
use crate::errors::AppError;
use crate::extractors::RequireAdmin;
use crate::state::AppState;

/// List all users (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/users",
    params(
        ("page" = Option<u32>, Query, description = "Page number", example = 1),
        ("per_page" = Option<u32>, Query, description = "Items per page", example = 20),
        ("include_deleted" = Option<bool>, Query, description = "Include soft-deleted users", example = false)
    ),
    responses(
        (status = 200, description = "Users retrieved", body = ApiResponse<PaginatedResponse<UserResponse>>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn list_users(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Query(params): Query<HashMap<String, String>>,
) -> Result<Json<ApiResponse<PaginatedResponse<UserResponse>>>, AppError> {
    let page = params
        .get("page")
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(1);
    let per_page = params
        .get("per_page")
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(20)
        .min(100);
    let include_deleted = params
        .get("include_deleted")
        .and_then(|s| s.parse::<bool>().ok())
        .unwrap_or(false);

    let (users, total) = state
        .user_repo
        .list(page, per_page, include_deleted)
        .await
        .map_err(|e| {
            error!("Failed to list users: {:?}", e);
            AppError::InternalServerError
        })?;

    // Convert users to UserResponse with roles
    let mut user_responses = Vec::new();
    for user in users {
        let roles = state
            .user_repo
            .get_user_roles(user.id)
            .await
            .map_err(|e| {
                error!(user_id = ?user.id, "Failed to get user roles: {:?}", e);
                AppError::InternalServerError
            })?;

        user_responses.push(UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
            is_active: user.is_active,
            roles,
            created_at: user.created_at,
            updated_at: user.updated_at,
        });
    }

    let total_pages = if total > 0 {
        ((total as f64) / (per_page as f64)).ceil() as u32
    } else {
        0
    };

    Ok(Json(ApiResponse::success(PaginatedResponse {
        items: user_responses,
        pagination: PaginationInfo {
            page,
            per_page,
            total_items: total,
            total_pages,
        },
    })))
}

/// Get user by ID (Admin only)
#[utoipa::path(
    get,
    path = "/api/v1/admin/users/{id}",
    params(("id" = Uuid, Path, description = "User ID")),
    responses(
        (status = 200, description = "User retrieved", body = ApiResponse<UserResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "User not found"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn get_user(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    let user = state
        .user_repo
        .find_by_id(id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to find user: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    // Check if user is deleted (unless we're explicitly including deleted users)
    if user.is_deleted() {
        return Err(AppError::NotFound("User not found".to_string()));
    }

    let roles = state
        .user_repo
        .get_user_roles(user.id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to get user roles: {:?}", e);
            AppError::InternalServerError
        })?;

    Ok(Json(ApiResponse::success(UserResponse {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        roles,
        created_at: user.created_at,
        updated_at: user.updated_at,
    })))
}

/// Update user (Admin only)
#[utoipa::path(
    put,
    path = "/api/v1/admin/users/{id}",
    params(("id" = Uuid, Path, description = "User ID")),
    request_body = UpdateUserRequest,
    responses(
        (status = 200, description = "User updated successfully", body = ApiResponse<UserResponse>),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "User not found"),
        (status = 409, description = "Email or username already exists"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn update_user(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateUserRequest>,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    request
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    // Get existing user
    let mut user = state
        .user_repo
        .find_by_id(id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to find user: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    if user.is_deleted() {
        return Err(AppError::NotFound("User not found".to_string()));
    }

    // Check for duplicate email if email is being updated
    if let Some(ref new_email) = request.email {
        if new_email != &user.email {
            if state.user_repo.email_exists(new_email).await.map_err(|e| {
                error!("Failed to check email existence: {:?}", e);
                AppError::InternalServerError
            })? {
                return Err(AppError::Conflict("Email already exists".to_string()));
            }
        }
    }

    // Check for duplicate username if username is being updated
    if let Some(ref new_username) = request.username {
        if new_username != &user.username {
            if state.user_repo.username_exists(new_username).await.map_err(|e| {
                error!("Failed to check username existence: {:?}", e);
                AppError::InternalServerError
            })? {
                return Err(AppError::Conflict("Username already exists".to_string()));
            }
        }
    }

    // Update user fields
    if let Some(username) = request.username {
        user.username = username;
    }
    if let Some(email) = request.email {
        user.email = email;
    }
    if let Some(is_active) = request.is_active {
        user.is_active = is_active;
    }
    user.updated_at = chrono::Utc::now();

    // Save updated user
    let updated_user = state
        .user_repo
        .update(&user)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to update user: {:?}", e);
            AppError::InternalServerError
        })?;

    // Get user roles
    let roles = state
        .user_repo
        .get_user_roles(updated_user.id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to get user roles: {:?}", e);
            AppError::InternalServerError
        })?;

    Ok(Json(ApiResponse::success_with_message(
        UserResponse {
            id: updated_user.id,
            username: updated_user.username,
            email: updated_user.email,
            is_active: updated_user.is_active,
            roles,
            created_at: updated_user.created_at,
            updated_at: updated_user.updated_at,
        },
        "User updated successfully",
    )))
}

/// Delete user (soft delete, Admin only)
#[utoipa::path(
    delete,
    path = "/api/v1/admin/users/{id}",
    params(("id" = Uuid, Path, description = "User ID")),
    responses(
        (status = 200, description = "User deleted successfully", body = ApiResponse<MessageResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "User not found"),
        (status = 400, description = "Cannot delete own account"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn delete_user(
    State(state): State<AppState>,
    admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MessageResponse>>, AppError> {
    // Prevent self-deletion
    if admin.0.id == id {
        return Err(AppError::ValidationError(
            "Cannot delete your own account".to_string(),
        ));
    }

    // Verify user exists
    let user = state
        .user_repo
        .find_by_id(id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to find user: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    if user.is_deleted() {
        return Err(AppError::NotFound("User not found".to_string()));
    }

    // Soft delete user
    state
        .user_repo
        .soft_delete(id, admin.0.id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to delete user: {:?}", e);
            AppError::InternalServerError
        })?;

    Ok(Json(ApiResponse::success_with_message(
        MessageResponse::new("User deleted successfully"),
        format!("User '{}' deleted", user.username),
    )))
}

/// Restore soft-deleted user (Admin only)
#[utoipa::path(
    post,
    path = "/api/v1/admin/users/{id}/restore",
    params(("id" = Uuid, Path, description = "User ID")),
    responses(
        (status = 200, description = "User restored successfully", body = ApiResponse<UserResponse>),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required"),
        (status = 404, description = "User not found"),
        (status = 400, description = "User is not deleted"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "admin"
)]
pub async fn restore_user(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    // Get user (including deleted ones)
    let user = state
        .user_repo
        .find_by_id(id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to find user: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    // Check if user is actually deleted
    if !user.is_deleted() {
        return Err(AppError::ValidationError(
            "User is not deleted".to_string(),
        ));
    }

    // Restore user
    state
        .user_repo
        .restore(id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to restore user: {:?}", e);
            AppError::InternalServerError
        })?;

    // Get updated user
    let restored_user = state
        .user_repo
        .find_by_id(id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to get restored user: {:?}", e);
            AppError::InternalServerError
        })?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    // Get user roles
    let roles = state
        .user_repo
        .get_user_roles(restored_user.id)
        .await
        .map_err(|e| {
            error!(user_id = ?id, "Failed to get user roles: {:?}", e);
            AppError::InternalServerError
        })?;

    Ok(Json(ApiResponse::success_with_message(
        UserResponse {
            id: restored_user.id,
            username: restored_user.username,
            email: restored_user.email,
            is_active: restored_user.is_active,
            roles,
            created_at: restored_user.created_at,
            updated_at: restored_user.updated_at,
        },
        "User restored successfully",
    )))
}
