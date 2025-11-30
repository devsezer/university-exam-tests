use std::env;

/// Application settings loaded from environment variables.
#[derive(Debug, Clone)]
pub struct Settings {
    /// Application configuration
    pub app: AppSettings,
    /// Database configuration
    pub database: DatabaseSettings,
    /// Redis configuration
    pub redis: RedisSettings,
    /// JWT configuration
    pub jwt: JwtSettings,
    /// Rate limiting configuration
    pub rate_limit: RateLimitSettings,
    /// Health check configuration
    pub health: HealthSettings,
    /// Shutdown configuration
    pub shutdown: ShutdownSettings,
    /// CORS configuration
    pub cors: CorsSettings,
}

/// Application-specific settings.
#[derive(Debug, Clone)]
pub struct AppSettings {
    /// Application name
    pub name: String,
    /// Environment (development, staging, production)
    pub env: String,
    /// Host to bind to
    pub host: String,
    /// Port to listen on
    pub port: u16,
    /// Application version
    pub version: String,
}

/// Database connection settings.
#[derive(Debug, Clone)]
pub struct DatabaseSettings {
    /// PostgreSQL connection URL
    pub url: String,
    /// Maximum number of connections in the pool
    pub max_connections: u32,
}

/// Redis connection settings.
#[derive(Debug, Clone)]
pub struct RedisSettings {
    /// Redis connection URL
    pub url: String,
    /// Connection pool size
    pub pool_size: u32,
    /// Default cache TTL in seconds
    pub default_ttl_seconds: u64,
}

/// JWT authentication settings.
#[derive(Debug, Clone)]
pub struct JwtSettings {
    /// Secret key for signing tokens
    pub secret: String,
    /// Access token expiration in minutes
    pub access_token_expiration_minutes: i64,
    /// Refresh token expiration in days
    pub refresh_token_expiration_days: i64,
}

/// Rate limiting settings.
#[derive(Debug, Clone)]
pub struct RateLimitSettings {
    /// Auth endpoint request limit
    pub auth_requests: u32,
    /// Auth endpoint window in seconds
    pub auth_window_seconds: u64,
    /// API endpoint request limit
    pub api_requests: u32,
    /// API endpoint window in seconds
    pub api_window_seconds: u64,
}

/// Health check settings.
#[derive(Debug, Clone)]
pub struct HealthSettings {
    /// Timeout for health checks in milliseconds
    pub timeout_ms: u64,
}

/// Graceful shutdown settings.
#[derive(Debug, Clone)]
pub struct ShutdownSettings {
    /// Shutdown timeout in seconds
    pub timeout_seconds: u64,
}

/// CORS settings.
#[derive(Debug, Clone)]
pub struct CorsSettings {
    /// Allowed origins (comma-separated)
    pub allowed_origins: Vec<String>,
}

impl Settings {
    /// Loads settings from environment variables.
    ///
    /// Falls back to sensible defaults when environment variables are not set.
    pub fn from_env() -> Result<Self, SettingsError> {
        // Load .env file if it exists (ignore errors)
        let _ = dotenvy::dotenv();

        Ok(Self {
            app: AppSettings {
                name: env_or_default("APP_NAME", "rust-api-boilerplate"),
                env: env_or_default("APP_ENV", "development"),
                host: env_or_default("APP_HOST", "0.0.0.0"),
                port: env_or_default("APP_PORT", "8080")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("APP_PORT".to_string()))?,
                version: env_or_default("APP_VERSION", "1.0.0"),
            },
            database: DatabaseSettings {
                url: env::var("DATABASE_URL").map_err(|_| {
                    SettingsError::MissingEnvVar("DATABASE_URL".to_string())
                })?,
                max_connections: env_or_default("DATABASE_MAX_CONNECTIONS", "10")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("DATABASE_MAX_CONNECTIONS".to_string()))?,
            },
            redis: RedisSettings {
                url: env_or_default("REDIS_URL", "redis://localhost:6379"),
                pool_size: env_or_default("REDIS_POOL_SIZE", "10")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("REDIS_POOL_SIZE".to_string()))?,
                default_ttl_seconds: env_or_default("CACHE_DEFAULT_TTL_SECONDS", "300")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("CACHE_DEFAULT_TTL_SECONDS".to_string()))?,
            },
            jwt: JwtSettings {
                secret: env::var("JWT_SECRET")
                    .map_err(|_| SettingsError::MissingEnvVar("JWT_SECRET".to_string()))?,
                access_token_expiration_minutes: env_or_default("JWT_ACCESS_TOKEN_EXPIRATION_MINUTES", "15")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("JWT_ACCESS_TOKEN_EXPIRATION_MINUTES".to_string()))?,
                refresh_token_expiration_days: env_or_default("JWT_REFRESH_TOKEN_EXPIRATION_DAYS", "7")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("JWT_REFRESH_TOKEN_EXPIRATION_DAYS".to_string()))?,
            },
            rate_limit: RateLimitSettings {
                auth_requests: env_or_default("RATE_LIMIT_AUTH_REQUESTS", "5")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("RATE_LIMIT_AUTH_REQUESTS".to_string()))?,
                auth_window_seconds: env_or_default("RATE_LIMIT_AUTH_WINDOW_SECONDS", "60")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("RATE_LIMIT_AUTH_WINDOW_SECONDS".to_string()))?,
                api_requests: env_or_default("RATE_LIMIT_API_REQUESTS", "100")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("RATE_LIMIT_API_REQUESTS".to_string()))?,
                api_window_seconds: env_or_default("RATE_LIMIT_API_WINDOW_SECONDS", "60")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("RATE_LIMIT_API_WINDOW_SECONDS".to_string()))?,
            },
            health: HealthSettings {
                timeout_ms: env_or_default("HEALTH_CHECK_TIMEOUT_MS", "5000")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("HEALTH_CHECK_TIMEOUT_MS".to_string()))?,
            },
            shutdown: ShutdownSettings {
                timeout_seconds: env_or_default("SHUTDOWN_TIMEOUT_SECONDS", "30")
                    .parse()
                    .map_err(|_| SettingsError::InvalidValue("SHUTDOWN_TIMEOUT_SECONDS".to_string()))?,
            },
            cors: CorsSettings {
                allowed_origins: env_or_default("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .collect(),
            },
        })
    }

    /// Checks if the application is running in production mode.
    pub fn is_production(&self) -> bool {
        self.app.env == "production"
    }

    /// Checks if the application is running in development mode.
    pub fn is_development(&self) -> bool {
        self.app.env == "development"
    }

    /// Gets the server address string.
    pub fn server_addr(&self) -> String {
        format!("{}:{}", self.app.host, self.app.port)
    }
}

/// Settings loading errors.
#[derive(Debug, thiserror::Error)]
pub enum SettingsError {
    #[error("Missing required environment variable: {0}")]
    MissingEnvVar(String),

    #[error("Invalid value for environment variable: {0}")]
    InvalidValue(String),
}

/// Helper function to get an environment variable or return a default value.
fn env_or_default(key: &str, default: &str) -> String {
    env::var(key).unwrap_or_else(|_| default.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_env_or_default() {
        // Test with non-existent variable
        let result = env_or_default("NON_EXISTENT_VAR_12345", "default_value");
        assert_eq!(result, "default_value");

        // Test with existing variable
        env::set_var("TEST_VAR_12345", "actual_value");
        let result = env_or_default("TEST_VAR_12345", "default_value");
        assert_eq!(result, "actual_value");
        env::remove_var("TEST_VAR_12345");
    }
}

