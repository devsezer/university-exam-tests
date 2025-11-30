use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;

use domain::errors::DomainError;
use domain::repositories::TestBookSubjectRepository;

/// PostgreSQL implementation of the TestBookSubjectRepository trait.
pub struct PgTestBookSubjectRepository {
    pool: PgPool,
}

impl PgTestBookSubjectRepository {
    /// Creates a new PostgreSQL test book subject repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl TestBookSubjectRepository for PgTestBookSubjectRepository {
    async fn add_subject(
        &self,
        test_book_id: Uuid,
        subject_id: Uuid,
    ) -> Result<(), DomainError> {
        sqlx::query(
            r#"
            INSERT INTO test_book_subjects (test_book_id, subject_id)
            VALUES ($1, $2)
            ON CONFLICT (test_book_id, subject_id) DO NOTHING
            "#,
        )
        .bind(test_book_id)
        .bind(subject_id)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn remove_subject(
        &self,
        test_book_id: Uuid,
        subject_id: Uuid,
    ) -> Result<(), DomainError> {
        sqlx::query(
            r#"
            DELETE FROM test_book_subjects
            WHERE test_book_id = $1 AND subject_id = $2
            "#,
        )
        .bind(test_book_id)
        .bind(subject_id)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn set_subjects(
        &self,
        test_book_id: Uuid,
        subject_ids: &[Uuid],
    ) -> Result<(), DomainError> {
        // Start a transaction
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        // Delete all existing relationships
        sqlx::query("DELETE FROM test_book_subjects WHERE test_book_id = $1")
            .bind(test_book_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        // Insert new relationships
        for subject_id in subject_ids {
            sqlx::query(
                r#"
                INSERT INTO test_book_subjects (test_book_id, subject_id)
                VALUES ($1, $2)
                "#,
            )
            .bind(test_book_id)
            .bind(*subject_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;
        }

        // Commit transaction
        tx.commit()
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn find_subject_ids_by_test_book_id(
        &self,
        test_book_id: Uuid,
    ) -> Result<Vec<Uuid>, DomainError> {
        let rows = sqlx::query_scalar::<_, Uuid>(
            r#"
            SELECT subject_id
            FROM test_book_subjects
            WHERE test_book_id = $1
            ORDER BY created_at ASC
            "#,
        )
        .bind(test_book_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows)
    }

    async fn find_test_book_ids_by_subject_id(
        &self,
        subject_id: Uuid,
    ) -> Result<Vec<Uuid>, DomainError> {
        let rows = sqlx::query_scalar::<_, Uuid>(
            r#"
            SELECT test_book_id
            FROM test_book_subjects
            WHERE subject_id = $1
            ORDER BY created_at ASC
            "#,
        )
        .bind(subject_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows)
    }

    async fn delete_by_test_book_id(&self, test_book_id: Uuid) -> Result<(), DomainError> {
        sqlx::query("DELETE FROM test_book_subjects WHERE test_book_id = $1")
            .bind(test_book_id)
            .execute(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(())
    }
}

