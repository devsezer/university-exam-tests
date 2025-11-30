use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::ExamType;
use domain::errors::DomainError;
use domain::repositories::ExamTypeRepository;

/// PostgreSQL implementation of the ExamTypeRepository trait.
pub struct PgExamTypeRepository {
    pool: PgPool,
}

impl PgExamTypeRepository {
    /// Creates a new PostgreSQL exam type repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct ExamTypeRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    created_at: DateTime<Utc>,
}

impl From<ExamTypeRow> for ExamType {
    fn from(row: ExamTypeRow) -> Self {
        ExamType {
            id: row.id,
            name: row.name,
            description: row.description,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl ExamTypeRepository for PgExamTypeRepository {
    async fn create(&self, exam_type: &ExamType) -> Result<ExamType, DomainError> {
        let row = sqlx::query_as::<_, ExamTypeRow>(
            r#"
            INSERT INTO exam_types (id, name, description, created_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, description, created_at
            "#,
        )
        .bind(exam_type.id)
        .bind(&exam_type.name)
        .bind(&exam_type.description)
        .bind(exam_type.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<ExamType>, DomainError> {
        let row = sqlx::query_as::<_, ExamTypeRow>(
            r#"
            SELECT id, name, description, created_at
            FROM exam_types
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn find_by_name(&self, name: &str) -> Result<Option<ExamType>, DomainError> {
        let row = sqlx::query_as::<_, ExamTypeRow>(
            r#"
            SELECT id, name, description, created_at
            FROM exam_types
            WHERE LOWER(name) = LOWER($1)
            "#,
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn update(&self, exam_type: &ExamType) -> Result<ExamType, DomainError> {
        let row = sqlx::query_as::<_, ExamTypeRow>(
            r#"
            UPDATE exam_types
            SET name = $2, description = $3
            WHERE id = $1
            RETURNING id, name, description, created_at
            "#,
        )
        .bind(exam_type.id)
        .bind(&exam_type.name)
        .bind(&exam_type.description)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<(), DomainError> {
        sqlx::query("DELETE FROM exam_types WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn list_all(&self) -> Result<Vec<ExamType>, DomainError> {
        let rows = sqlx::query_as::<_, ExamTypeRow>(
            r#"
            SELECT id, name, description, created_at
            FROM exam_types
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }
}

