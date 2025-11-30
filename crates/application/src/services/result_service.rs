use async_trait::async_trait;
use std::sync::Arc;
use uuid::Uuid;

use domain::errors::DomainError;
use domain::repositories::TestResultRepository;

use crate::dto::TestResultResponse;

/// Errors for result operations.
#[derive(Debug, thiserror::Error)]
pub enum ResultError {
    #[error("Test result not found")]
    TestResultNotFound,

    #[error("Internal error: {0}")]
    InternalError(String),
}

impl From<DomainError> for ResultError {
    fn from(err: DomainError) -> Self {
        ResultError::InternalError(err.to_string())
    }
}

/// Trait for result operations.
#[async_trait]
pub trait ResultService: Send + Sync {
    /// Gets a test result by ID.
    async fn get_result(&self, id: Uuid) -> Result<TestResultResponse, ResultError>;

    /// Lists test results for a user.
    async fn list_user_results(
        &self,
        user_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<TestResultResponse>, u64), ResultError>;

    /// Lists test results with optional filters.
    async fn list_results(
        &self,
        user_id: Option<Uuid>,
        practice_test_id: Option<Uuid>,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<TestResultResponse>, u64), ResultError>;
}

/// Implementation of ResultService.
pub struct ResultServiceImpl<R>
where
    R: TestResultRepository,
{
    test_result_repo: Arc<R>,
}

impl<R> ResultServiceImpl<R>
where
    R: TestResultRepository,
{
    pub fn new(test_result_repo: Arc<R>) -> Self {
        Self { test_result_repo }
    }
}

#[async_trait]
impl<R> ResultService for ResultServiceImpl<R>
where
    R: TestResultRepository + 'static,
{
    async fn get_result(&self, id: Uuid) -> Result<TestResultResponse, ResultError> {
        let result = self
            .test_result_repo
            .find_by_id(id)
            .await?
            .ok_or(ResultError::TestResultNotFound)?;

        Ok(TestResultResponse {
            id: result.id,
            user_id: result.user_id,
            practice_test_id: result.practice_test_id,
            user_answers: result.user_answers,
            correct_count: result.correct_count,
            wrong_count: result.wrong_count,
            empty_count: result.empty_count,
            net_score: result.net_score,
            solved_at: result.solved_at,
        })
    }

    async fn list_user_results(
        &self,
        user_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<TestResultResponse>, u64), ResultError> {
        let (results, total) = self
            .test_result_repo
            .list(Some(user_id), None, page, per_page)
            .await?;

        Ok((
            results
                .into_iter()
                .map(|r| TestResultResponse {
                    id: r.id,
                    user_id: r.user_id,
                    practice_test_id: r.practice_test_id,
                    user_answers: r.user_answers,
                    correct_count: r.correct_count,
                    wrong_count: r.wrong_count,
                    empty_count: r.empty_count,
                    net_score: r.net_score,
                    solved_at: r.solved_at,
                })
                .collect(),
            total,
        ))
    }

    async fn list_results(
        &self,
        user_id: Option<Uuid>,
        practice_test_id: Option<Uuid>,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<TestResultResponse>, u64), ResultError> {
        let (results, total) = self
            .test_result_repo
            .list(user_id, practice_test_id, page, per_page)
            .await?;

        Ok((
            results
                .into_iter()
                .map(|r| TestResultResponse {
                    id: r.id,
                    user_id: r.user_id,
                    practice_test_id: r.practice_test_id,
                    user_answers: r.user_answers,
                    correct_count: r.correct_count,
                    wrong_count: r.wrong_count,
                    empty_count: r.empty_count,
                    net_score: r.net_score,
                    solved_at: r.solved_at,
                })
                .collect(),
            total,
        ))
    }
}

