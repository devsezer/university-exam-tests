use axum::{
    routing::{delete, get, post, put},
    Router,
};

use crate::handlers::{
    assign_role_to_user, create_role, delete_role, get_role, list_roles, remove_role_from_user,
    update_role,
};
use crate::state::AppState;

/// Creates the admin role management routes (protected, admin only).
pub fn admin_role_routes() -> Router<AppState> {
    Router::new()
        // Role CRUD routes
        .route("/api/v1/admin/roles", get(list_roles))
        .route("/api/v1/admin/roles", post(create_role))
        .route("/api/v1/admin/roles/{id}", get(get_role))
        .route("/api/v1/admin/roles/{id}", put(update_role))
        .route("/api/v1/admin/roles/{id}", delete(delete_role))
        // User role assignment routes
        .route("/api/v1/admin/users/{id}/roles", post(assign_role_to_user))
        .route(
            "/api/v1/admin/users/{id}/roles/{role_id}",
            delete(remove_role_from_user),
        )
}

