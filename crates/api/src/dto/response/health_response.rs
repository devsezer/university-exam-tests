use chrono::{DateTime, Utc};
use serde::Serialize;
use utoipa::ToSchema;

/// Liveness probe response.
#[derive(Debug, Serialize, ToSchema)]
pub struct LivenessResponse {
    /// Status: "alive" or "dead"
    #[schema(example = "alive")]
    pub status: String,
    /// Current timestamp
    pub timestamp: DateTime<Utc>,
}

/// Readiness probe response.
#[derive(Debug, Serialize, ToSchema)]
pub struct ReadinessResponse {
    /// Status: "ready", "degraded", or "not_ready"
    #[schema(example = "ready")]
    pub status: String,
    /// Current timestamp
    pub timestamp: DateTime<Utc>,
    /// Health check details
    pub checks: HealthChecks,
}

/// Health check details for each dependency.
#[derive(Debug, Serialize, ToSchema)]
pub struct HealthChecks {
    /// Database health
    pub database: HealthCheckResult,
}

/// Individual health check result.
#[derive(Debug, Serialize, ToSchema)]
pub struct HealthCheckResult {
    /// Status: "healthy" or "unhealthy"
    #[schema(example = "healthy")]
    pub status: String,
    /// Latency in milliseconds (if healthy)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub latency_ms: Option<i64>,
    /// Error message (if unhealthy)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl LivenessResponse {
    pub fn alive() -> Self {
        Self {
            status: "alive".to_string(),
            timestamp: Utc::now(),
        }
    }

    pub fn dead() -> Self {
        Self {
            status: "dead".to_string(),
            timestamp: Utc::now(),
        }
    }
}

impl ReadinessResponse {
    pub fn ready(checks: HealthChecks) -> Self {
        Self {
            status: "ready".to_string(),
            timestamp: Utc::now(),
            checks,
        }
    }

    pub fn degraded(checks: HealthChecks) -> Self {
        Self {
            status: "degraded".to_string(),
            timestamp: Utc::now(),
            checks,
        }
    }

    pub fn not_ready(checks: HealthChecks) -> Self {
        Self {
            status: "not_ready".to_string(),
            timestamp: Utc::now(),
            checks,
        }
    }
}

impl HealthCheckResult {
    pub fn healthy(latency_ms: i64) -> Self {
        Self {
            status: "healthy".to_string(),
            latency_ms: Some(latency_ms),
            error: None,
        }
    }

    pub fn unhealthy(error: impl Into<String>) -> Self {
        Self {
            status: "unhealthy".to_string(),
            latency_ms: None,
            error: Some(error.into()),
        }
    }
}

