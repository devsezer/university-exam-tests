use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::User;
use domain::errors::DomainError;
use domain::repositories::UserRepository;

/// PostgreSQL implementation of the UserRepository trait.
pub struct PgUserRepository {
    pool: PgPool,
}

impl PgUserRepository {
    /// Creates a new PostgreSQL user repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct UserRow {
    id: Uuid,
    username: String,
    email: String,
    password_hash: String,
    is_active: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    deleted_at: Option<DateTime<Utc>>,
    deleted_by: Option<Uuid>,
}

impl From<UserRow> for User {
    fn from(row: UserRow) -> Self {
        User {
            id: row.id,
            username: row.username,
            email: row.email,
            password_hash: row.password_hash,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at,
            deleted_by: row.deleted_by,
        }
    }
}

#[async_trait]
impl UserRepository for PgUserRepository {
    async fn create(&self, user: &User) -> Result<User, DomainError> {
        let row = sqlx::query_as::<_, UserRow>(
            r#"
            INSERT INTO users (id, username, email, password_hash, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, username, email, password_hash, is_active, created_at, updated_at, deleted_at, deleted_by
            "#,
        )
        .bind(user.id)
        .bind(&user.username)
        .bind(&user.email)
        .bind(&user.password_hash)
        .bind(user.is_active)
        .bind(user.created_at)
        .bind(user.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(ref db_err) if db_err.is_unique_violation() => {
                let constraint = db_err.constraint().unwrap_or("");
                if constraint.contains("email") {
                    DomainError::DuplicateEmail(user.email.clone())
                } else if constraint.contains("username") {
                    DomainError::DuplicateUsername(user.username.clone())
                } else {
                    DomainError::DatabaseError(e.to_string())
                }
            }
            _ => DomainError::DatabaseError(e.to_string()),
        })?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, DomainError> {
        let row = sqlx::query_as::<_, UserRow>(
            r#"
            SELECT id, username, email, password_hash, is_active, created_at, updated_at, deleted_at, deleted_by
            FROM users
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, DomainError> {
        let row = sqlx::query_as::<_, UserRow>(
            r#"
            SELECT id, username, email, password_hash, is_active, created_at, updated_at, deleted_at, deleted_by
            FROM users
            WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL
            "#,
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_username(&self, username: &str) -> Result<Option<User>, DomainError> {
        let row = sqlx::query_as::<_, UserRow>(
            r#"
            SELECT id, username, email, password_hash, is_active, created_at, updated_at, deleted_at, deleted_by
            FROM users
            WHERE LOWER(username) = LOWER($1) AND deleted_at IS NULL
            "#,
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(Into::into))
    }

    async fn update(&self, user: &User) -> Result<User, DomainError> {
        let row = sqlx::query_as::<_, UserRow>(
            r#"
            UPDATE users
            SET username = $2, email = $3, password_hash = $4, is_active = $5, updated_at = $6
            WHERE id = $1
            RETURNING id, username, email, password_hash, is_active, created_at, updated_at, deleted_at, deleted_by
            "#,
        )
        .bind(user.id)
        .bind(&user.username)
        .bind(&user.email)
        .bind(&user.password_hash)
        .bind(user.is_active)
        .bind(Utc::now())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(ref db_err) if db_err.is_unique_violation() => {
                let constraint = db_err.constraint().unwrap_or("");
                if constraint.contains("email") {
                    DomainError::DuplicateEmail(user.email.clone())
                } else if constraint.contains("username") {
                    DomainError::DuplicateUsername(user.username.clone())
                } else {
                    DomainError::DatabaseError(e.to_string())
                }
            }
            _ => DomainError::DatabaseError(e.to_string()),
        })?
        .ok_or(DomainError::UserNotFound(user.id))?;

        Ok(row.into())
    }

    async fn soft_delete(&self, id: Uuid, deleted_by: Uuid) -> Result<(), DomainError> {
        let result = sqlx::query(
            r#"
            UPDATE users
            SET deleted_at = NOW(), deleted_by = $2, updated_at = NOW()
            WHERE id = $1 AND deleted_at IS NULL
            "#,
        )
        .bind(id)
        .bind(deleted_by)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(DomainError::UserNotFound(id));
        }

        Ok(())
    }

    async fn restore(&self, id: Uuid) -> Result<(), DomainError> {
        let result = sqlx::query(
            r#"
            UPDATE users
            SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
            WHERE id = $1 AND deleted_at IS NOT NULL
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(DomainError::UserNotDeleted);
        }

        Ok(())
    }

    async fn hard_delete(&self, id: Uuid) -> Result<(), DomainError> {
        let result = sqlx::query(
            r#"
            DELETE FROM users WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(DomainError::UserNotFound(id));
        }

        Ok(())
    }

    async fn email_exists(&self, email: &str) -> Result<bool, DomainError> {
        let result = sqlx::query_scalar::<_, bool>(
            r#"
            SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL)
            "#,
        )
        .bind(email)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(result)
    }

    async fn username_exists(&self, username: &str) -> Result<bool, DomainError> {
        let result = sqlx::query_scalar::<_, bool>(
            r#"
            SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) AND deleted_at IS NULL)
            "#,
        )
        .bind(username)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(result)
    }

    async fn list(
        &self,
        page: u32,
        per_page: u32,
        include_deleted: bool,
    ) -> Result<(Vec<User>, u64), DomainError> {
        let offset = (page.saturating_sub(1)) * per_page;

        let (users, total): (Vec<UserRow>, i64) = if include_deleted {
            let users = sqlx::query_as::<_, UserRow>(
                r#"
                SELECT id, username, email, password_hash, is_active, created_at, updated_at, deleted_at, deleted_by
                FROM users
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
                "#,
            )
            .bind(per_page as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

            let total = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

            (users, total)
        } else {
            let users = sqlx::query_as::<_, UserRow>(
                r#"
                SELECT id, username, email, password_hash, is_active, created_at, updated_at, deleted_at, deleted_by
                FROM users
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
                "#,
            )
            .bind(per_page as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

            let total =
                sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL")
                    .fetch_one(&self.pool)
                    .await
                    .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

            (users, total)
        };

        Ok((users.into_iter().map(Into::into).collect(), total as u64))
    }
}

