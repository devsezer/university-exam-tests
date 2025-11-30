use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::Subject;
use domain::errors::DomainError;
use domain::repositories::SubjectRepository;

/// PostgreSQL implementation of the SubjectRepository trait.
pub struct PgSubjectRepository {
    pool: PgPool,
}

impl PgSubjectRepository {
    /// Creates a new PostgreSQL subject repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct SubjectRow {
    id: Uuid,
    name: String,
    lesson_id: Uuid,
    exam_type_id: Uuid,
    created_at: DateTime<Utc>,
}

impl From<SubjectRow> for Subject {
    fn from(row: SubjectRow) -> Self {
        Subject {
            id: row.id,
            name: row.name,
            lesson_id: row.lesson_id,
            exam_type_id: row.exam_type_id,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl SubjectRepository for PgSubjectRepository {
    async fn create(&self, subject: &Subject) -> Result<Subject, DomainError> {
        let row = sqlx::query_as::<_, SubjectRow>(
            r#"
            INSERT INTO subjects (id, name, lesson_id, exam_type_id, created_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, lesson_id, exam_type_id, created_at
            "#,
        )
        .bind(subject.id)
        .bind(&subject.name)
        .bind(subject.lesson_id)
        .bind(subject.exam_type_id)
        .bind(subject.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Subject>, DomainError> {
        let row = sqlx::query_as::<_, SubjectRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, created_at
            FROM subjects
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn find_by_exam_type_id(&self, exam_type_id: Uuid) -> Result<Vec<Subject>, DomainError> {
        let rows = sqlx::query_as::<_, SubjectRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, created_at
            FROM subjects
            WHERE exam_type_id = $1
            ORDER BY name ASC
            "#,
        )
        .bind(exam_type_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn find_by_lesson_and_exam_type(
        &self,
        lesson_id: Uuid,
        exam_type_id: Uuid,
    ) -> Result<Vec<Subject>, DomainError> {
        let rows = sqlx::query_as::<_, SubjectRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, created_at
            FROM subjects
            WHERE lesson_id = $1 AND exam_type_id = $2
            ORDER BY name ASC
            "#,
        )
        .bind(lesson_id)
        .bind(exam_type_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn update(&self, subject: &Subject) -> Result<Subject, DomainError> {
        let row = sqlx::query_as::<_, SubjectRow>(
            r#"
            UPDATE subjects
            SET name = $2, lesson_id = $3, exam_type_id = $4
            WHERE id = $1
            RETURNING id, name, lesson_id, exam_type_id, created_at
            "#,
        )
        .bind(subject.id)
        .bind(&subject.name)
        .bind(subject.lesson_id)
        .bind(subject.exam_type_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<(), DomainError> {
        sqlx::query("DELETE FROM subjects WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn list_all(&self) -> Result<Vec<Subject>, DomainError> {
        let rows = sqlx::query_as::<_, SubjectRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, created_at
            FROM subjects
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }
}

