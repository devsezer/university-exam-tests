use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::Lesson;
use domain::errors::DomainError;
use domain::repositories::LessonRepository;

/// PostgreSQL implementation of the LessonRepository trait.
pub struct PgLessonRepository {
    pool: PgPool,
}

impl PgLessonRepository {
    /// Creates a new PostgreSQL lesson repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct LessonRow {
    id: Uuid,
    name: String,
    created_at: DateTime<Utc>,
}

impl From<LessonRow> for Lesson {
    fn from(row: LessonRow) -> Self {
        Lesson {
            id: row.id,
            name: row.name,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl LessonRepository for PgLessonRepository {
    async fn create(&self, lesson: &Lesson) -> Result<Lesson, DomainError> {
        let row = sqlx::query_as::<_, LessonRow>(
            r#"
            INSERT INTO lessons (id, name, created_at)
            VALUES ($1, $2, $3)
            RETURNING id, name, created_at
            "#,
        )
        .bind(lesson.id)
        .bind(&lesson.name)
        .bind(lesson.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Lesson>, DomainError> {
        let row = sqlx::query_as::<_, LessonRow>(
            r#"
            SELECT id, name, created_at
            FROM lessons
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn find_by_name(&self, name: &str) -> Result<Option<Lesson>, DomainError> {
        let row = sqlx::query_as::<_, LessonRow>(
            r#"
            SELECT id, name, created_at
            FROM lessons
            WHERE name = $1
            "#,
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn list_all(&self) -> Result<Vec<Lesson>, DomainError> {
        let rows = sqlx::query_as::<_, LessonRow>(
            r#"
            SELECT id, name, created_at
            FROM lessons
            ORDER BY name ASC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn update(&self, lesson: &Lesson) -> Result<Lesson, DomainError> {
        let row = sqlx::query_as::<_, LessonRow>(
            r#"
            UPDATE lessons
            SET name = $2
            WHERE id = $1
            RETURNING id, name, created_at
            "#,
        )
        .bind(lesson.id)
        .bind(&lesson.name)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<(), DomainError> {
        sqlx::query("DELETE FROM lessons WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }
}

