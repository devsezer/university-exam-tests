use std::sync::Arc;

use application::services::{
    AuthService, AuthServiceImpl, JwtOperations, PasswordOperations, ResultService,
    ResultServiceImpl, TestManagementService, TestManagementServiceImpl, TestSolvingService,
    TestSolvingServiceImpl,
};
use infrastructure::config::Settings;
use infrastructure::database::repositories::{
    PgExamTypeRepository, PgPracticeTestRepository, PgRefreshTokenRepository,
    PgSubjectRepository, PgTestBookRepository, PgTestResultRepository, PgUserRepository,
};
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
    /// Test management service
    pub test_management_service: Arc<dyn TestManagementService>,
    /// Test solving service
    pub test_solving_service: Arc<dyn TestSolvingService>,
    /// Result service
    pub result_service: Arc<dyn ResultService>,
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
        let exam_type_repo = Arc::new(PgExamTypeRepository::new(db_pool.clone()));
        let subject_repo = Arc::new(PgSubjectRepository::new(db_pool.clone()));
        let test_book_repo = Arc::new(PgTestBookRepository::new(db_pool.clone()));
        let practice_test_repo = Arc::new(PgPracticeTestRepository::new(db_pool.clone()));
        let test_result_repo = Arc::new(PgTestResultRepository::new(db_pool.clone()));

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

        // Initialize test management service
        let test_management_service: Arc<dyn TestManagementService> = Arc::new(
            TestManagementServiceImpl::new(
                exam_type_repo.clone(),
                subject_repo.clone(),
                test_book_repo.clone(),
                practice_test_repo.clone(),
            ),
        );

        // Initialize test solving service
        let test_solving_service: Arc<dyn TestSolvingService> =
            Arc::new(TestSolvingServiceImpl::new(
                practice_test_repo.clone(),
                test_result_repo.clone(),
            ));

        // Initialize result service
        let result_service: Arc<dyn ResultService> =
            Arc::new(ResultServiceImpl::new(test_result_repo.clone()));

        Self {
            db_pool,
            jwt_service,
            password_service,
            auth_service,
            test_management_service,
            test_solving_service,
            result_service,
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

