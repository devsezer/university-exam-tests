use axum::{extract::State, http::StatusCode, Json};
use std::time::Instant;

use crate::dto::response::{HealthCheckResult, HealthChecks, LivenessResponse, ReadinessResponse};
use crate::state::AppState;

/// Handler for liveness probe.
#[utoipa::path(
    get,
    path = "/health/live",
    responses(
        (status = 200, description = "Application is alive", body = LivenessResponse),
        (status = 503, description = "Application is not responding"),
    ),
    tag = "health"
)]
pub async fn liveness() -> Json<LivenessResponse> {
    Json(LivenessResponse::alive())
}

/// Handler for readiness probe.
#[utoipa::path(
    get,
    path = "/health/ready",
    responses(
        (status = 200, description = "Application is ready", body = ReadinessResponse),
        (status = 503, description = "Application is not ready"),
    ),
    tag = "health"
)]
pub async fn readiness(
    State(state): State<AppState>,
) -> Result<Json<ReadinessResponse>, (StatusCode, Json<ReadinessResponse>)> {
    // Check database connection
    let db_check = check_database(&state).await;

    let checks = HealthChecks { database: db_check };

    // Determine overall status
    if checks.database.status == "healthy" {
        Ok(Json(ReadinessResponse::ready(checks)))
    } else {
        Err((
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ReadinessResponse::not_ready(checks)),
        ))
    }
}

/// Checks database connectivity and returns latency.
async fn check_database(state: &AppState) -> HealthCheckResult {
    let start = Instant::now();

    match sqlx::query("SELECT 1").execute(&state.db_pool).await {
        Ok(_) => {
            let latency_ms = start.elapsed().as_millis() as i64;
            HealthCheckResult::healthy(latency_ms)
        }
        Err(e) => HealthCheckResult::unhealthy(e.to_string()),
    }
}

