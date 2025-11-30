use async_trait::async_trait;
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use chrono::{Duration, Utc};
use sha2::{Digest, Sha256};
use std::sync::Arc;
use uuid::Uuid;

use domain::entities::{RefreshToken, User};
use domain::errors::DomainError;
use domain::repositories::{RefreshTokenRepository, UserRepository};

use crate::dto::{
    AuthResponse, LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, RegisterResponse,
    TokenResponse, UserResponse,
};

/// Authentication service errors.
#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Account is deactivated")]
    AccountDeactivated,

    #[error("Account is deleted")]
    AccountDeleted,

    #[error("Email already exists")]
    DuplicateEmail,

    #[error("Username already exists")]
    DuplicateUsername,

    #[error("Invalid refresh token")]
    InvalidRefreshToken,

    #[error("Refresh token expired")]
    RefreshTokenExpired,

    #[error("Refresh token revoked")]
    RefreshTokenRevoked,

    #[error("User not found")]
    UserNotFound,

    #[error("Internal error: {0}")]
    InternalError(String),
}

impl From<DomainError> for AuthError {
    fn from(err: DomainError) -> Self {
        match err {
            DomainError::DuplicateEmail(_) => AuthError::DuplicateEmail,
            DomainError::DuplicateUsername(_) => AuthError::DuplicateUsername,
            DomainError::InvalidCredentials => AuthError::InvalidCredentials,
            DomainError::AccountDeactivated => AuthError::AccountDeactivated,
            DomainError::AccountDeleted => AuthError::AccountDeleted,
            DomainError::RefreshTokenExpired => AuthError::RefreshTokenExpired,
            DomainError::RefreshTokenRevoked => AuthError::RefreshTokenRevoked,
            DomainError::RefreshTokenNotFound => AuthError::InvalidRefreshToken,
            DomainError::UserNotFound(_) | DomainError::UserNotFoundByEmail(_) => {
                AuthError::UserNotFound
            }
            _ => AuthError::InternalError(err.to_string()),
        }
    }
}

/// Trait for JWT operations (to be implemented by infrastructure).
pub trait JwtOperations: Send + Sync {
    fn generate_access_token(
        &self,
        user_id: Uuid,
        roles: Vec<String>,
        permissions: Vec<String>,
    ) -> Result<String, String>;

    fn access_token_expiration_minutes(&self) -> i64;
    fn refresh_token_expiration_days(&self) -> i64;
}

/// Trait for password operations (to be implemented by infrastructure).
pub trait PasswordOperations: Send + Sync {
    fn hash_password(&self, password: &str) -> Result<String, String>;
    fn verify_password(&self, password: &str, hash: &str) -> Result<bool, String>;
}

/// Authentication service trait.
#[async_trait]
pub trait AuthService: Send + Sync {
    /// Registers a new user.
    async fn register(&self, request: RegisterRequest) -> Result<RegisterResponse, AuthError>;

    /// Authenticates a user and returns tokens.
    async fn login(
        &self,
        request: LoginRequest,
        user_agent: Option<String>,
        ip_address: Option<String>,
    ) -> Result<AuthResponse, AuthError>;

    /// Refreshes an access token using a refresh token.
    async fn refresh_token(
        &self,
        request: RefreshRequest,
        user_agent: Option<String>,
        ip_address: Option<String>,
    ) -> Result<TokenResponse, AuthError>;

    /// Logs out a user by revoking refresh tokens.
    async fn logout(&self, user_id: Uuid, request: LogoutRequest) -> Result<(), AuthError>;

    /// Gets the current user's information.
    async fn get_current_user(&self, user_id: Uuid) -> Result<UserResponse, AuthError>;
}

/// Implementation of the authentication service.
pub struct AuthServiceImpl<U, R, J, P>
where
    U: UserRepository,
    R: RefreshTokenRepository,
    J: JwtOperations,
    P: PasswordOperations,
{
    user_repo: Arc<U>,
    refresh_token_repo: Arc<R>,
    jwt_service: Arc<J>,
    password_service: Arc<P>,
}

impl<U, R, J, P> AuthServiceImpl<U, R, J, P>
where
    U: UserRepository,
    R: RefreshTokenRepository,
    J: JwtOperations,
    P: PasswordOperations,
{
    /// Creates a new authentication service.
    pub fn new(
        user_repo: Arc<U>,
        refresh_token_repo: Arc<R>,
        jwt_service: Arc<J>,
        password_service: Arc<P>,
    ) -> Self {
        Self {
            user_repo,
            refresh_token_repo,
            jwt_service,
            password_service,
        }
    }

    /// Generates a random refresh token and returns (raw_token, hash).
    fn generate_refresh_token(&self) -> (String, String) {
        use rand::Rng;
        let bytes: [u8; 32] = rand::rng().random();
        let raw_token = URL_SAFE_NO_PAD.encode(bytes);

        let mut hasher = Sha256::new();
        hasher.update(raw_token.as_bytes());
        let hash = format!("{:x}", hasher.finalize());

        (raw_token, hash)
    }

    /// Hashes a refresh token for storage/lookup.
    fn hash_refresh_token(&self, token: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(token.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    /// Creates user response from user entity.
    fn user_to_response(&self, user: &User) -> UserResponse {
        UserResponse {
            id: user.id,
            username: user.username.clone(),
            email: user.email.clone(),
            is_active: user.is_active,
            roles: vec!["user".to_string()], // Default role for now
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}

#[async_trait]
impl<U, R, J, P> AuthService for AuthServiceImpl<U, R, J, P>
where
    U: UserRepository + 'static,
    R: RefreshTokenRepository + 'static,
    J: JwtOperations + 'static,
    P: PasswordOperations + 'static,
{
    async fn register(&self, mut request: RegisterRequest) -> Result<RegisterResponse, AuthError> {
        // Normalize input
        request.normalize();

        // Check for existing email
        if self.user_repo.email_exists(&request.email).await? {
            return Err(AuthError::DuplicateEmail);
        }

        // Check for existing username
        if self.user_repo.username_exists(&request.username).await? {
            return Err(AuthError::DuplicateUsername);
        }

        // Hash password
        let password_hash = self
            .password_service
            .hash_password(&request.password)
            .map_err(|e| AuthError::InternalError(e))?;

        // Create user
        let user = User::new(request.username, request.email, password_hash);
        let created_user = self.user_repo.create(&user).await?;

        Ok(RegisterResponse {
            id: created_user.id,
            username: created_user.username,
            email: created_user.email,
            created_at: created_user.created_at,
        })
    }

    async fn login(
        &self,
        mut request: LoginRequest,
        user_agent: Option<String>,
        ip_address: Option<String>,
    ) -> Result<AuthResponse, AuthError> {
        // Normalize input
        request.normalize();

        // Find user by email
        let user = self
            .user_repo
            .find_by_email(&request.email)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;

        // Check if user is deleted
        if user.is_deleted() {
            return Err(AuthError::AccountDeleted);
        }

        // Check if user is active
        if !user.is_active {
            return Err(AuthError::AccountDeactivated);
        }

        // Verify password
        let is_valid = self
            .password_service
            .verify_password(&request.password, &user.password_hash)
            .map_err(|e| AuthError::InternalError(e))?;

        if !is_valid {
            return Err(AuthError::InvalidCredentials);
        }

        // Generate tokens
        let access_token = self
            .jwt_service
            .generate_access_token(user.id, vec!["user".to_string()], vec![])
            .map_err(|e| AuthError::InternalError(e))?;

        let (raw_refresh_token, refresh_token_hash) = self.generate_refresh_token();

        // Calculate expiration
        let refresh_expires_at =
            Utc::now() + Duration::days(self.jwt_service.refresh_token_expiration_days());

        // Store refresh token
        let refresh_token = RefreshToken::new(
            user.id,
            refresh_token_hash,
            refresh_expires_at,
            user_agent,
            ip_address,
        );
        self.refresh_token_repo.create(&refresh_token).await?;

        Ok(AuthResponse {
            access_token,
            refresh_token: raw_refresh_token,
            token_type: "Bearer".to_string(),
            expires_in: self.jwt_service.access_token_expiration_minutes() * 60,
            refresh_expires_in: self.jwt_service.refresh_token_expiration_days() * 24 * 60 * 60,
            user: self.user_to_response(&user),
        })
    }

    async fn refresh_token(
        &self,
        request: RefreshRequest,
        user_agent: Option<String>,
        ip_address: Option<String>,
    ) -> Result<TokenResponse, AuthError> {
        // Hash the provided token for lookup
        let token_hash = self.hash_refresh_token(&request.refresh_token);

        // Find the token
        let stored_token = self
            .refresh_token_repo
            .find_by_hash(&token_hash)
            .await?
            .ok_or(AuthError::InvalidRefreshToken)?;

        // Check if token is revoked
        if stored_token.is_revoked() {
            return Err(AuthError::RefreshTokenRevoked);
        }

        // Check if token is expired
        if stored_token.is_expired() {
            return Err(AuthError::RefreshTokenExpired);
        }

        // Get the user
        let user = self
            .user_repo
            .find_by_id(stored_token.user_id)
            .await?
            .ok_or(AuthError::UserNotFound)?;

        // Check if user is deleted or deactivated
        if user.is_deleted() {
            return Err(AuthError::AccountDeleted);
        }
        if !user.is_active {
            return Err(AuthError::AccountDeactivated);
        }

        // Generate new tokens
        let access_token = self
            .jwt_service
            .generate_access_token(user.id, vec!["user".to_string()], vec![])
            .map_err(|e| AuthError::InternalError(e))?;

        let (new_raw_refresh_token, new_refresh_token_hash) = self.generate_refresh_token();

        // Calculate expiration
        let refresh_expires_at =
            Utc::now() + Duration::days(self.jwt_service.refresh_token_expiration_days());

        // Create new refresh token
        let new_refresh_token = RefreshToken::new(
            user.id,
            new_refresh_token_hash,
            refresh_expires_at,
            user_agent,
            ip_address,
        );
        let created_token = self.refresh_token_repo.create(&new_refresh_token).await?;

        // Rotate old token (mark as replaced)
        self.refresh_token_repo
            .rotate(stored_token.id, created_token.id)
            .await?;

        Ok(TokenResponse {
            access_token,
            refresh_token: new_raw_refresh_token,
            token_type: "Bearer".to_string(),
            expires_in: self.jwt_service.access_token_expiration_minutes() * 60,
            refresh_expires_in: self.jwt_service.refresh_token_expiration_days() * 24 * 60 * 60,
        })
    }

    async fn logout(&self, user_id: Uuid, request: LogoutRequest) -> Result<(), AuthError> {
        if request.all_devices {
            // Revoke all refresh tokens for the user
            self.refresh_token_repo
                .revoke_all_for_user(user_id, "logout_all")
                .await?;
        } else if let Some(refresh_token) = request.refresh_token {
            // Revoke specific token
            let token_hash = self.hash_refresh_token(&refresh_token);
            if let Some(stored_token) = self.refresh_token_repo.find_by_hash(&token_hash).await? {
                // Verify the token belongs to the user
                if stored_token.user_id == user_id {
                    self.refresh_token_repo
                        .revoke(stored_token.id, "logout")
                        .await?;
                }
            }
        }

        Ok(())
    }

    async fn get_current_user(&self, user_id: Uuid) -> Result<UserResponse, AuthError> {
        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or(AuthError::UserNotFound)?;

        if user.is_deleted() {
            return Err(AuthError::AccountDeleted);
        }

        Ok(self.user_to_response(&user))
    }
}

