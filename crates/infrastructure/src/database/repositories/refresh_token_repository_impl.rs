use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::RefreshToken;
use domain::errors::DomainError;
use domain::repositories::RefreshTokenRepository;

/// PostgreSQL implementation of the RefreshTokenRepository trait.
pub struct PgRefreshTokenRepository {
    pool: PgPool,
}

impl PgRefreshTokenRepository {
    /// Creates a new PostgreSQL refresh token repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct RefreshTokenRow {
    id: Uuid,
    user_id: Uuid,
    token_hash: String,
    expires_at: DateTime<Utc>,
    created_at: DateTime<Utc>,
    revoked_at: Option<DateTime<Utc>>,
    revoked_reason: Option<String>,
    replaced_by: Option<Uuid>,
    user_agent: Option<String>,
    ip_address: Option<String>,
}

impl From<RefreshTokenRow> for RefreshToken {
    fn from(row: RefreshTokenRow) -> Self {
        RefreshToken {
            id: row.id,
            user_id: row.user_id,
            token_hash: row.token_hash,
            expires_at: row.expires_at,
            created_at: row.created_at,
            revoked_at: row.revoked_at,
            revoked_reason: row.revoked_reason,
            replaced_by: row.replaced_by,
            user_agent: row.user_agent,
            ip_address: row.ip_address,
        }
    }
}

#[async_trait]
impl RefreshTokenRepository for PgRefreshTokenRepository {
    async fn create(&self, token: &RefreshToken) -> Result<RefreshToken, DomainError> {
        let row = sqlx::query_as::<_, RefreshTokenRow>(
            r#"
            INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, user_agent, ip_address)
            VALUES ($1, $2, $3, $4, $5, $6, $7::INET)
            RETURNING id, user_id, token_hash, expires_at, created_at, revoked_at, revoked_reason, replaced_by, user_agent, ip_address::TEXT
            "#,
        )
        .bind(token.id)
        .bind(token.user_id)
        .bind(&token.token_hash)
        .bind(token.expires_at)
        .bind(token.created_at)
        .bind(&token.user_agent)
        .bind(&token.ip_address)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn find_by_hash(&self, token_hash: &str) -> Result<Option<RefreshToken>, DomainError> {
        let row = sqlx::query_as::<_, RefreshTokenRow>(
            r#"
            SELECT id, user_id, token_hash, expires_at, created_at, revoked_at, revoked_reason, replaced_by, user_agent, ip_address::TEXT
            FROM refresh_tokens
            WHERE token_hash = $1
            "#,
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<RefreshToken>, DomainError> {
        let row = sqlx::query_as::<_, RefreshTokenRow>(
            r#"
            SELECT id, user_id, token_hash, expires_at, created_at, revoked_at, revoked_reason, replaced_by, user_agent, ip_address::TEXT
            FROM refresh_tokens
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(Into::into))
    }

    async fn revoke(&self, id: Uuid, reason: &str) -> Result<(), DomainError> {
        let result = sqlx::query(
            r#"
            UPDATE refresh_tokens
            SET revoked_at = NOW(), revoked_reason = $2
            WHERE id = $1 AND revoked_at IS NULL
            "#,
        )
        .bind(id)
        .bind(reason)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(DomainError::RefreshTokenNotFound);
        }

        Ok(())
    }

    async fn revoke_all_for_user(&self, user_id: Uuid, reason: &str) -> Result<u64, DomainError> {
        let result = sqlx::query(
            r#"
            UPDATE refresh_tokens
            SET revoked_at = NOW(), revoked_reason = $2
            WHERE user_id = $1 AND revoked_at IS NULL
            "#,
        )
        .bind(user_id)
        .bind(reason)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(result.rows_affected())
    }

    async fn rotate(&self, old_token_id: Uuid, new_token_id: Uuid) -> Result<(), DomainError> {
        let result = sqlx::query(
            r#"
            UPDATE refresh_tokens
            SET revoked_at = NOW(), revoked_reason = 'rotated', replaced_by = $2
            WHERE id = $1 AND revoked_at IS NULL
            "#,
        )
        .bind(old_token_id)
        .bind(new_token_id)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(DomainError::RefreshTokenNotFound);
        }

        Ok(())
    }

    async fn delete_expired(&self) -> Result<u64, DomainError> {
        let result = sqlx::query(
            r#"
            DELETE FROM refresh_tokens
            WHERE expires_at < NOW()
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(result.rows_affected())
    }

    async fn count_active_for_user(&self, user_id: Uuid) -> Result<u64, DomainError> {
        let count = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)
            FROM refresh_tokens
            WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
            "#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(count as u64)
    }
}

