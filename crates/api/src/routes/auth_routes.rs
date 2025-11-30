use axum::{
    routing::{get, post},
    Router,
};

use crate::handlers::{get_current_user, login, logout, refresh_token, register};
use crate::state::AppState;

/// Creates the authentication routes.
pub fn auth_routes() -> Router<AppState> {
    Router::new()
        // Public routes
        .route("/api/v1/auth/register", post(register))
        .route("/api/v1/auth/login", post(login))
        .route("/api/v1/auth/refresh", post(refresh_token))
        // Protected routes
        .route("/api/v1/auth/logout", post(logout))
        .route("/api/v1/auth/me", get(get_current_user))
}

