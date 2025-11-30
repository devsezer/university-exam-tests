use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::PracticeTest;
use domain::errors::DomainError;
use domain::repositories::PracticeTestRepository;

/// PostgreSQL implementation of the PracticeTestRepository trait.
pub struct PgPracticeTestRepository {
    pool: PgPool,
}

impl PgPracticeTestRepository {
    /// Creates a new PostgreSQL practice test repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct PracticeTestRow {
    id: Uuid,
    name: String,
    test_number: i32,
    question_count: i32,
    answer_key: String,
    test_book_id: Uuid,
    subject_id: Uuid,
    created_at: DateTime<Utc>,
}

impl From<PracticeTestRow> for PracticeTest {
    fn from(row: PracticeTestRow) -> Self {
        PracticeTest {
            id: row.id,
            name: row.name,
            test_number: row.test_number,
            question_count: row.question_count,
            answer_key: row.answer_key,
            test_book_id: row.test_book_id,
            subject_id: row.subject_id,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl PracticeTestRepository for PgPracticeTestRepository {
    async fn create(&self, practice_test: &PracticeTest) -> Result<PracticeTest, DomainError> {
        let row = sqlx::query_as::<_, PracticeTestRow>(
            r#"
            INSERT INTO practice_tests (id, name, test_number, question_count, answer_key, test_book_id, subject_id, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, test_number, question_count, answer_key, test_book_id, subject_id, created_at
            "#,
        )
        .bind(practice_test.id)
        .bind(&practice_test.name)
        .bind(practice_test.test_number)
        .bind(practice_test.question_count)
        .bind(&practice_test.answer_key)
        .bind(practice_test.test_book_id)
        .bind(practice_test.subject_id)
        .bind(practice_test.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<PracticeTest>, DomainError> {
        let row = sqlx::query_as::<_, PracticeTestRow>(
            r#"
            SELECT id, name, test_number, question_count, answer_key, test_book_id, subject_id, created_at
            FROM practice_tests
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn find_by_test_book_id(&self, test_book_id: Uuid) -> Result<Vec<PracticeTest>, DomainError> {
        let rows = sqlx::query_as::<_, PracticeTestRow>(
            r#"
            SELECT id, name, test_number, question_count, answer_key, test_book_id, subject_id, created_at
            FROM practice_tests
            WHERE test_book_id = $1
            ORDER BY test_number ASC
            "#,
        )
        .bind(test_book_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn update(&self, practice_test: &PracticeTest) -> Result<PracticeTest, DomainError> {
        let row = sqlx::query_as::<_, PracticeTestRow>(
            r#"
            UPDATE practice_tests
            SET name = $2, test_number = $3, question_count = $4, answer_key = $5, test_book_id = $6, subject_id = $7
            WHERE id = $1
            RETURNING id, name, test_number, question_count, answer_key, test_book_id, subject_id, created_at
            "#,
        )
        .bind(practice_test.id)
        .bind(&practice_test.name)
        .bind(practice_test.test_number)
        .bind(practice_test.question_count)
        .bind(&practice_test.answer_key)
        .bind(practice_test.test_book_id)
        .bind(practice_test.subject_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<(), DomainError> {
        sqlx::query("DELETE FROM practice_tests WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn list_all(&self) -> Result<Vec<PracticeTest>, DomainError> {
        let rows = sqlx::query_as::<_, PracticeTestRow>(
            r#"
            SELECT id, name, test_number, question_count, answer_key, test_book_id, subject_id, created_at
            FROM practice_tests
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }
}

