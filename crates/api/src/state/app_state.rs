use std::sync::Arc;

use application::services::{AuthService, AuthServiceImpl, JwtOperations, PasswordOperations};
use infrastructure::config::Settings;
use infrastructure::database::repositories::{PgRefreshTokenRepository, PgUserRepository};
use infrastructure::database::DatabasePool;
use infrastructure::security::{JwtConfig, JwtService, PasswordService};
use uuid::Uuid;

/// Application state shared across all handlers.
#[derive(Clone)]
pub struct AppState {
    /// Database connection pool
    pub db_pool: DatabasePool,
    /// JWT service for token operations
    pub jwt_service: Arc<JwtService>,
    /// Password service for hashing/verification
    pub password_service: Arc<PasswordService>,
    /// Authentication service
    pub auth_service: Arc<dyn AuthService>,
    /// Application settings
    pub settings: Arc<Settings>,
}

impl AppState {
    /// Creates a new application state with all services initialized.
    pub fn new(db_pool: DatabasePool, settings: Settings) -> Self {
        // Initialize JWT service
        let jwt_config = JwtConfig::new(
            settings.jwt.secret.clone(),
            settings.jwt.access_token_expiration_minutes,
            settings.jwt.refresh_token_expiration_days,
        );
        let jwt_service = Arc::new(JwtService::new(jwt_config));

        // Initialize password service
        let password_service = Arc::new(PasswordService::new());

        // Initialize repositories
        let user_repo = Arc::new(PgUserRepository::new(db_pool.clone()));
        let refresh_token_repo = Arc::new(PgRefreshTokenRepository::new(db_pool.clone()));

        // Create adapters for the auth service
        let jwt_adapter = Arc::new(JwtAdapter(jwt_service.clone()));
        let password_adapter = Arc::new(PasswordAdapter(password_service.clone()));

        // Initialize auth service
        let auth_service: Arc<dyn AuthService> = Arc::new(AuthServiceImpl::new(
            user_repo,
            refresh_token_repo,
            jwt_adapter,
            password_adapter,
        ));

        Self {
            db_pool,
            jwt_service,
            password_service,
            auth_service,
            settings: Arc::new(settings),
        }
    }
}

/// Adapter to implement JwtOperations for JwtService
struct JwtAdapter(Arc<JwtService>);

impl JwtOperations for JwtAdapter {
    fn generate_access_token(
        &self,
        user_id: Uuid,
        roles: Vec<String>,
        permissions: Vec<String>,
    ) -> Result<String, String> {
        self.0
            .generate_access_token(user_id, roles, permissions)
            .map_err(|e| e.to_string())
    }

    fn access_token_expiration_minutes(&self) -> i64 {
        self.0.access_token_expiration_minutes()
    }

    fn refresh_token_expiration_days(&self) -> i64 {
        self.0.refresh_token_expiration_days()
    }
}

/// Adapter to implement PasswordOperations for PasswordService
struct PasswordAdapter(Arc<PasswordService>);

impl PasswordOperations for PasswordAdapter {
    fn hash_password(&self, password: &str) -> Result<String, String> {
        self.0.hash_password(password).map_err(|e| e.to_string())
    }

    fn verify_password(&self, password: &str, hash: &str) -> Result<bool, String> {
        self.0
            .verify_password(password, hash)
            .map_err(|e| e.to_string())
    }
}

