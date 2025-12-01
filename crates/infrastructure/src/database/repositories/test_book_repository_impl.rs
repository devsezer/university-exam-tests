use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::TestBook;
use domain::errors::DomainError;
use domain::repositories::TestBookRepository;

/// PostgreSQL implementation of the TestBookRepository trait.
pub struct PgTestBookRepository {
    pool: PgPool,
}

impl PgTestBookRepository {
    /// Creates a new PostgreSQL test book repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct TestBookRow {
    id: Uuid,
    name: String,
    lesson_id: Uuid,
    exam_type_id: Uuid,
    published_year: i16,
    created_at: DateTime<Utc>,
}

impl From<TestBookRow> for TestBook {
    fn from(row: TestBookRow) -> Self {
        TestBook {
            id: row.id,
            name: row.name,
            lesson_id: row.lesson_id,
            exam_type_id: row.exam_type_id,
            published_year: row.published_year as u16,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl TestBookRepository for PgTestBookRepository {
    async fn create(&self, test_book: &TestBook) -> Result<TestBook, DomainError> {
        let row = sqlx::query_as::<_, TestBookRow>(
            r#"
            INSERT INTO test_books (id, name, lesson_id, exam_type_id, published_year, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, lesson_id, exam_type_id, published_year, created_at
            "#,
        )
        .bind(test_book.id)
        .bind(&test_book.name)
        .bind(test_book.lesson_id)
        .bind(test_book.exam_type_id)
        .bind(test_book.published_year as i16)
        .bind(test_book.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<TestBook>, DomainError> {
        let row = sqlx::query_as::<_, TestBookRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, published_year, created_at
            FROM test_books
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn find_by_subject_id(&self, subject_id: Uuid) -> Result<Vec<TestBook>, DomainError> {
        let rows = sqlx::query_as::<_, TestBookRow>(
            r#"
            SELECT tb.id, tb.name, tb.lesson_id, tb.exam_type_id, tb.published_year, tb.created_at
            FROM test_books tb
            INNER JOIN test_book_subjects tbs ON tb.id = tbs.test_book_id
            WHERE tbs.subject_id = $1
            ORDER BY tb.name ASC
            "#,
        )
        .bind(subject_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn find_by_exam_type_id(&self, exam_type_id: Uuid) -> Result<Vec<TestBook>, DomainError> {
        let rows = sqlx::query_as::<_, TestBookRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, published_year, created_at
            FROM test_books
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

    async fn find_by_lesson_id(&self, lesson_id: Uuid) -> Result<Vec<TestBook>, DomainError> {
        let rows = sqlx::query_as::<_, TestBookRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, published_year, created_at
            FROM test_books
            WHERE lesson_id = $1
            ORDER BY name ASC
            "#,
        )
        .bind(lesson_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn find_by_exam_type_and_lesson(
        &self,
        exam_type_id: Uuid,
        lesson_id: Uuid,
    ) -> Result<Vec<TestBook>, DomainError> {
        let rows = sqlx::query_as::<_, TestBookRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, published_year, created_at
            FROM test_books
            WHERE exam_type_id = $1 AND lesson_id = $2
            ORDER BY name ASC
            "#,
        )
        .bind(exam_type_id)
        .bind(lesson_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn update(&self, test_book: &TestBook) -> Result<TestBook, DomainError> {
        let row = sqlx::query_as::<_, TestBookRow>(
            r#"
            UPDATE test_books
            SET name = $2, lesson_id = $3, exam_type_id = $4, published_year = $5
            WHERE id = $1
            RETURNING id, name, lesson_id, exam_type_id, published_year, created_at
            "#,
        )
        .bind(test_book.id)
        .bind(&test_book.name)
        .bind(test_book.lesson_id)
        .bind(test_book.exam_type_id)
        .bind(test_book.published_year as i16)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<(), DomainError> {
        sqlx::query("DELETE FROM test_books WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn list_all(&self) -> Result<Vec<TestBook>, DomainError> {
        let rows = sqlx::query_as::<_, TestBookRow>(
            r#"
            SELECT id, name, lesson_id, exam_type_id, published_year, created_at
            FROM test_books
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }
}

