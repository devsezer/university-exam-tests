use axum::{
    routing::{delete, get, post, put},
    Router,
};

use crate::handlers::{delete_user, get_user, list_users, restore_user, update_user};
use crate::state::AppState;

/// Creates the admin user management routes (protected, admin only).
pub fn admin_user_routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/admin/users", get(list_users))
        .route("/api/v1/admin/users/{id}", get(get_user))
        .route("/api/v1/admin/users/{id}", put(update_user))
        .route("/api/v1/admin/users/{id}", delete(delete_user))
        .route("/api/v1/admin/users/{id}/restore", post(restore_user))
}
