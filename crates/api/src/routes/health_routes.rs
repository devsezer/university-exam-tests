use axum::{routing::get, Router};

use crate::handlers::{liveness, readiness};
use crate::state::AppState;

/// Creates the health check routes.
pub fn health_routes() -> Router<AppState> {
    Router::new()
        .route("/health/live", get(liveness))
        .route("/health/ready", get(readiness))
}

