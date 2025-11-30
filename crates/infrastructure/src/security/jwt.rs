use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

/// JWT-related errors.
#[derive(Debug, Error)]
pub enum JwtError {
    #[error("Failed to encode token: {0}")]
    EncodingError(String),

    #[error("Failed to decode token: {0}")]
    DecodingError(String),

    #[error("Token has expired")]
    TokenExpired,

    #[error("Invalid token")]
    InvalidToken,
}

/// JWT claims structure.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    /// Subject (user ID)
    pub sub: Uuid,
    /// Expiration time (as Unix timestamp)
    pub exp: i64,
    /// Issued at (as Unix timestamp)
    pub iat: i64,
    /// JWT ID (unique identifier for this token)
    pub jti: Uuid,
    /// User's roles
    #[serde(default)]
    pub roles: Vec<String>,
    /// User's permissions (flattened from roles)
    #[serde(default)]
    pub permissions: Vec<String>,
}

impl Claims {
    /// Creates new claims for a user.
    pub fn new(
        user_id: Uuid,
        roles: Vec<String>,
        permissions: Vec<String>,
        expiration_minutes: i64,
    ) -> Self {
        let now = Utc::now();
        let exp = now + Duration::minutes(expiration_minutes);

        Self {
            sub: user_id,
            exp: exp.timestamp(),
            iat: now.timestamp(),
            jti: Uuid::new_v4(),
            roles,
            permissions,
        }
    }

    /// Checks if the token has expired.
    pub fn is_expired(&self) -> bool {
        Utc::now().timestamp() > self.exp
    }
}

/// JWT configuration.
#[derive(Debug, Clone)]
pub struct JwtConfig {
    /// Secret key for signing tokens
    pub secret: String,
    /// Access token expiration in minutes
    pub access_token_expiration_minutes: i64,
    /// Refresh token expiration in days
    pub refresh_token_expiration_days: i64,
    /// Issuer name
    pub issuer: Option<String>,
}

impl JwtConfig {
    /// Creates a new JWT configuration.
    pub fn new(
        secret: String,
        access_token_expiration_minutes: i64,
        refresh_token_expiration_days: i64,
    ) -> Self {
        Self {
            secret,
            access_token_expiration_minutes,
            refresh_token_expiration_days,
            issuer: None,
        }
    }

    /// Sets the issuer for the JWT configuration.
    pub fn with_issuer(mut self, issuer: String) -> Self {
        self.issuer = Some(issuer);
        self
    }
}

/// JWT service for encoding and decoding tokens.
#[derive(Clone)]
pub struct JwtService {
    config: JwtConfig,
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl JwtService {
    /// Creates a new JWT service with the given configuration.
    pub fn new(config: JwtConfig) -> Self {
        let encoding_key = EncodingKey::from_secret(config.secret.as_bytes());
        let decoding_key = DecodingKey::from_secret(config.secret.as_bytes());

        Self {
            config,
            encoding_key,
            decoding_key,
        }
    }

    /// Generates an access token for a user.
    pub fn generate_access_token(
        &self,
        user_id: Uuid,
        roles: Vec<String>,
        permissions: Vec<String>,
    ) -> Result<String, JwtError> {
        let claims = Claims::new(
            user_id,
            roles,
            permissions,
            self.config.access_token_expiration_minutes,
        );

        encode(&Header::default(), &claims, &self.encoding_key)
            .map_err(|e| JwtError::EncodingError(e.to_string()))
    }

    /// Validates and decodes an access token.
    pub fn validate_access_token(&self, token: &str) -> Result<Claims, JwtError> {
        let mut validation = Validation::default();
        validation.validate_exp = true;

        let token_data = decode::<Claims>(token, &self.decoding_key, &validation).map_err(|e| {
            match e.kind() {
                jsonwebtoken::errors::ErrorKind::ExpiredSignature => JwtError::TokenExpired,
                _ => JwtError::DecodingError(e.to_string()),
            }
        })?;

        Ok(token_data.claims)
    }

    /// Gets the access token expiration in minutes.
    pub fn access_token_expiration_minutes(&self) -> i64 {
        self.config.access_token_expiration_minutes
    }

    /// Gets the refresh token expiration in days.
    pub fn refresh_token_expiration_days(&self) -> i64 {
        self.config.refresh_token_expiration_days
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> JwtConfig {
        JwtConfig::new("test-secret-key-at-least-32-chars-long".to_string(), 15, 7)
    }

    #[test]
    fn test_generate_and_validate_token() {
        let service = JwtService::new(test_config());
        let user_id = Uuid::new_v4();
        let roles = vec!["user".to_string()];
        let permissions = vec!["read".to_string()];

        let token = service
            .generate_access_token(user_id, roles.clone(), permissions.clone())
            .unwrap();
        let claims = service.validate_access_token(&token).unwrap();

        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.roles, roles);
        assert_eq!(claims.permissions, permissions);
    }

    #[test]
    fn test_invalid_token() {
        let service = JwtService::new(test_config());
        let result = service.validate_access_token("invalid-token");

        assert!(result.is_err());
    }
}

