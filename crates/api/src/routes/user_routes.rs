use axum::Router;

use crate::state::AppState;

/// Creates the admin user management routes (protected, admin only).
/// User management operations will be added here.
pub fn admin_user_routes() -> Router<AppState> {
    Router::new()
}
