use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::Role;
use domain::errors::DomainError;
use domain::repositories::RoleRepository;

/// PostgreSQL implementation of the RoleRepository trait.
pub struct PgRoleRepository {
    pool: PgPool,
}

impl PgRoleRepository {
    /// Creates a new PostgreSQL role repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct RoleRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    is_system: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<RoleRow> for Role {
    fn from(row: RoleRow) -> Self {
        Role {
            id: row.id,
            name: row.name,
            description: row.description,
            is_system: row.is_system,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl RoleRepository for PgRoleRepository {
    async fn create(&self, role: &Role) -> Result<Role, DomainError> {
        let row = sqlx::query_as::<_, RoleRow>(
            r#"
            INSERT INTO roles (id, name, description, is_system, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, description, is_system, created_at, updated_at
            "#,
        )
        .bind(role.id)
        .bind(&role.name)
        .bind(&role.description)
        .bind(role.is_system)
        .bind(role.created_at)
        .bind(role.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Role>, DomainError> {
        let row = sqlx::query_as::<_, RoleRow>(
            r#"
            SELECT id, name, description, is_system, created_at, updated_at
            FROM roles
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn find_by_name(&self, name: &str) -> Result<Option<Role>, DomainError> {
        let row = sqlx::query_as::<_, RoleRow>(
            r#"
            SELECT id, name, description, is_system, created_at, updated_at
            FROM roles
            WHERE LOWER(name) = LOWER($1)
            "#,
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn list(&self) -> Result<Vec<Role>, DomainError> {
        let rows = sqlx::query_as::<_, RoleRow>(
            r#"
            SELECT id, name, description, is_system, created_at, updated_at
            FROM roles
            ORDER BY name ASC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn update(&self, role: &Role) -> Result<Role, DomainError> {
        let row = sqlx::query_as::<_, RoleRow>(
            r#"
            UPDATE roles
            SET name = $2, description = $3, updated_at = $4
            WHERE id = $1
            RETURNING id, name, description, is_system, created_at, updated_at
            "#,
        )
        .bind(role.id)
        .bind(&role.name)
        .bind(&role.description)
        .bind(role.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<(), DomainError> {
        sqlx::query("DELETE FROM roles WHERE id = $1 AND is_system = false")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<Role>, DomainError> {
        let rows = sqlx::query_as::<_, RoleRow>(
            r#"
            SELECT r.id, r.name, r.description, r.is_system, r.created_at, r.updated_at
            FROM roles r
            INNER JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
            ORDER BY r.name ASC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }
}

