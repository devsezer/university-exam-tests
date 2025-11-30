use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use domain::entities::TestResult;
use domain::errors::DomainError;
use domain::repositories::TestResultRepository;

/// PostgreSQL implementation of the TestResultRepository trait.
pub struct PgTestResultRepository {
    pool: PgPool,
}

impl PgTestResultRepository {
    /// Creates a new PostgreSQL test result repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Internal row structure for database queries.
#[derive(sqlx::FromRow)]
struct TestResultRow {
    id: Uuid,
    user_id: Uuid,
    practice_test_id: Uuid,
    user_answers: String,
    correct_count: i32,
    wrong_count: i32,
    empty_count: i32,
    net_score: f64,
    solved_at: DateTime<Utc>,
}

impl From<TestResultRow> for TestResult {
    fn from(row: TestResultRow) -> Self {
        TestResult {
            id: row.id,
            user_id: row.user_id,
            practice_test_id: row.practice_test_id,
            user_answers: row.user_answers,
            correct_count: row.correct_count,
            wrong_count: row.wrong_count,
            empty_count: row.empty_count,
            net_score: row.net_score,
            solved_at: row.solved_at,
        }
    }
}

#[async_trait]
impl TestResultRepository for PgTestResultRepository {
    async fn create(&self, test_result: &TestResult) -> Result<TestResult, DomainError> {
        let row = sqlx::query_as::<_, TestResultRow>(
            r#"
            INSERT INTO test_results (id, user_id, practice_test_id, user_answers, correct_count, wrong_count, empty_count, net_score, solved_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, user_id, practice_test_id, user_answers, correct_count, wrong_count, empty_count, net_score, solved_at
            "#,
        )
        .bind(test_result.id)
        .bind(test_result.user_id)
        .bind(test_result.practice_test_id)
        .bind(&test_result.user_answers)
        .bind(test_result.correct_count)
        .bind(test_result.wrong_count)
        .bind(test_result.empty_count)
        .bind(test_result.net_score)
        .bind(test_result.solved_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<TestResult>, DomainError> {
        let row = sqlx::query_as::<_, TestResultRow>(
            r#"
            SELECT id, user_id, practice_test_id, user_answers, correct_count, wrong_count, empty_count, net_score, solved_at
            FROM test_results
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<TestResult>, DomainError> {
        let rows = sqlx::query_as::<_, TestResultRow>(
            r#"
            SELECT id, user_id, practice_test_id, user_answers, correct_count, wrong_count, empty_count, net_score, solved_at
            FROM test_results
            WHERE user_id = $1
            ORDER BY solved_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn find_by_practice_test_id(&self, practice_test_id: Uuid) -> Result<Vec<TestResult>, DomainError> {
        let rows = sqlx::query_as::<_, TestResultRow>(
            r#"
            SELECT id, user_id, practice_test_id, user_answers, correct_count, wrong_count, empty_count, net_score, solved_at
            FROM test_results
            WHERE practice_test_id = $1
            ORDER BY solved_at DESC
            "#,
        )
        .bind(practice_test_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    async fn find_by_user_and_practice_test(
        &self,
        user_id: Uuid,
        practice_test_id: Uuid,
    ) -> Result<Option<TestResult>, DomainError> {
        let row = sqlx::query_as::<_, TestResultRow>(
            r#"
            SELECT id, user_id, practice_test_id, user_answers, correct_count, wrong_count, empty_count, net_score, solved_at
            FROM test_results
            WHERE user_id = $1 AND practice_test_id = $2
            ORDER BY solved_at DESC
            LIMIT 1
            "#,
        )
        .bind(user_id)
        .bind(practice_test_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn find_latest_by_user_and_practice_test(
        &self,
        user_id: Uuid,
        practice_test_id: Uuid,
    ) -> Result<Option<TestResult>, DomainError> {
        let row = sqlx::query_as::<_, TestResultRow>(
            r#"
            SELECT id, user_id, practice_test_id, user_answers, correct_count, wrong_count, empty_count, net_score, solved_at
            FROM test_results
            WHERE user_id = $1 AND practice_test_id = $2
            ORDER BY solved_at DESC
            LIMIT 1
            "#,
        )
        .bind(user_id)
        .bind(practice_test_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok(row.map(|r| r.into()))
    }

    async fn list(
        &self,
        user_id: Option<Uuid>,
        practice_test_id: Option<Uuid>,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<TestResult>, u64), DomainError> {
        let offset = (page - 1) * per_page;

        // Build dynamic WHERE clause
        let mut query = String::from(
            r#"
            SELECT id, user_id, practice_test_id, user_answers, correct_count, wrong_count, empty_count, net_score, solved_at
            FROM test_results
            WHERE 1=1
            "#,
        );
        let mut count_query = String::from("SELECT COUNT(*) FROM test_results WHERE 1=1");

        let mut bind_count = 0;
        let mut params: Vec<Uuid> = Vec::new();

        if let Some(uid) = user_id {
            bind_count += 1;
            query.push_str(&format!(" AND user_id = ${}", bind_count));
            count_query.push_str(&format!(" AND user_id = ${}", bind_count));
            params.push(uid);
        }

        if let Some(ptid) = practice_test_id {
            bind_count += 1;
            query.push_str(&format!(" AND practice_test_id = ${}", bind_count));
            count_query.push_str(&format!(" AND practice_test_id = ${}", bind_count));
            params.push(ptid);
        }

        query.push_str(" ORDER BY solved_at DESC LIMIT $");
        bind_count += 1;
        query.push_str(&bind_count.to_string());
        query.push_str(" OFFSET $");
        bind_count += 1;
        query.push_str(&bind_count.to_string());

        // Execute count query
        let mut count_query_builder = sqlx::query_scalar::<_, i64>(&count_query);
        for param in &params {
            count_query_builder = count_query_builder.bind(param);
        }
        let total: i64 = count_query_builder
            .fetch_one(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        // Execute data query
        let mut query_builder = sqlx::query_as::<_, TestResultRow>(&query);
        for param in &params {
            query_builder = query_builder.bind(param);
        }
        query_builder = query_builder.bind(per_page as i64);
        query_builder = query_builder.bind(offset as i64);

        let rows = query_builder
            .fetch_all(&self.pool)
            .await
            .map_err(|e| DomainError::DatabaseError(e.to_string()))?;

        Ok((rows.into_iter().map(|r| r.into()).collect(), total as u64))
    }
}

