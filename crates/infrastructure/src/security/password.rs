use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2, Params,
};
use thiserror::Error;

/// Password-related errors.
#[derive(Debug, Error)]
pub enum PasswordError {
    #[error("Failed to hash password: {0}")]
    HashingError(String),

    #[error("Failed to verify password: {0}")]
    VerificationError(String),

    #[error("Invalid password hash format")]
    InvalidHashFormat,
}

/// Password service for hashing and verifying passwords.
#[derive(Clone)]
pub struct PasswordService {
    argon2: Argon2<'static>,
}

impl Default for PasswordService {
    fn default() -> Self {
        Self::new()
    }
}

impl PasswordService {
    /// Creates a new password service with recommended Argon2id parameters.
    ///
    /// Parameters based on OWASP recommendations:
    /// - Memory: 19456 KB (19 MiB)
    /// - Time: 2 iterations
    /// - Parallelism: 1
    pub fn new() -> Self {
        // Using default Argon2id parameters which are secure for most use cases
        let params = Params::new(19456, 2, 1, None).expect("Invalid Argon2 parameters");

        let argon2 = Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params);

        Self { argon2 }
    }

    /// Hashes a password using Argon2id.
    pub fn hash_password(&self, password: &str) -> Result<String, PasswordError> {
        let salt = SaltString::generate(&mut OsRng);

        let password_hash = self
            .argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| PasswordError::HashingError(e.to_string()))?;

        Ok(password_hash.to_string())
    }

    /// Verifies a password against a hash.
    pub fn verify_password(&self, password: &str, hash: &str) -> Result<bool, PasswordError> {
        let parsed_hash =
            PasswordHash::new(hash).map_err(|_| PasswordError::InvalidHashFormat)?;

        match self.argon2.verify_password(password.as_bytes(), &parsed_hash) {
            Ok(()) => Ok(true),
            Err(argon2::password_hash::Error::Password) => Ok(false),
            Err(e) => Err(PasswordError::VerificationError(e.to_string())),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_and_verify_password() {
        let service = PasswordService::new();
        let password = "secure_password_123!";

        let hash = service.hash_password(password).unwrap();

        // Hash should be different each time due to random salt
        let hash2 = service.hash_password(password).unwrap();
        assert_ne!(hash, hash2);

        // But both should verify correctly
        assert!(service.verify_password(password, &hash).unwrap());
        assert!(service.verify_password(password, &hash2).unwrap());
    }

    #[test]
    fn test_wrong_password() {
        let service = PasswordService::new();
        let password = "secure_password_123!";
        let wrong_password = "wrong_password";

        let hash = service.hash_password(password).unwrap();

        assert!(!service.verify_password(wrong_password, &hash).unwrap());
    }

    #[test]
    fn test_invalid_hash() {
        let service = PasswordService::new();

        let result = service.verify_password("password", "invalid_hash");
        assert!(result.is_err());
    }
}

