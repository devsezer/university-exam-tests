use async_trait::async_trait;
use chrono::Utc;
use std::sync::Arc;
use uuid::Uuid;

use domain::entities::TestResult;
use domain::errors::DomainError;
use domain::repositories::{PracticeTestRepository, TestResultRepository};

use crate::dto::{SolveTestRequest, SolveTestResponse, TestResultResponse};

/// Errors for test solving operations.
#[derive(Debug, thiserror::Error)]
pub enum TestSolvingError {
    #[error("Practice test not found")]
    PracticeTestNotFound,

    #[error("Cannot retake test yet. Must wait 24 hours since last attempt")]
    CannotRetakeYet,

    #[error("Answer key length mismatch")]
    AnswerKeyLengthMismatch,

    #[error("User answers length mismatch")]
    UserAnswersLengthMismatch,

    #[error("Internal error: {0}")]
    InternalError(String),
}

impl From<DomainError> for TestSolvingError {
    fn from(err: DomainError) -> Self {
        TestSolvingError::InternalError(err.to_string())
    }
}

/// Trait for test solving operations.
#[async_trait]
pub trait TestSolvingService: Send + Sync {
    /// Solves a practice test and returns the result.
    async fn solve_test(
        &self,
        user_id: Uuid,
        practice_test_id: Uuid,
        request: SolveTestRequest,
    ) -> Result<SolveTestResponse, TestSolvingError>;
}

/// Implementation of TestSolvingService.
pub struct TestSolvingServiceImpl<P, R>
where
    P: PracticeTestRepository,
    R: TestResultRepository,
{
    practice_test_repo: Arc<P>,
    test_result_repo: Arc<R>,
}

impl<P, R> TestSolvingServiceImpl<P, R>
where
    P: PracticeTestRepository,
    R: TestResultRepository,
{
    pub fn new(practice_test_repo: Arc<P>, test_result_repo: Arc<R>) -> Self {
        Self {
            practice_test_repo,
            test_result_repo,
        }
    }

    /// Evaluates user answers against the answer key.
    fn evaluate_answers(
        &self,
        answer_key: &str,
        user_answers: &str,
    ) -> Result<(i32, i32, i32), TestSolvingError> {
        if answer_key.len() != user_answers.len() {
            return Err(TestSolvingError::AnswerKeyLengthMismatch);
        }

        let mut correct = 0;
        let mut wrong = 0;
        let mut empty = 0;

        for (key_char, user_char) in answer_key.chars().zip(user_answers.chars()) {
            if user_char == '_' || user_char == ' ' {
                empty += 1;
            } else if key_char.to_uppercase().next() == user_char.to_uppercase().next() {
                correct += 1;
            } else {
                wrong += 1;
            }
        }

        Ok((correct, wrong, empty))
    }

    /// Checks if user can retake the test (24 hour rule).
    async fn can_retake_test(
        &self,
        user_id: Uuid,
        practice_test_id: Uuid,
    ) -> Result<(bool, Option<f64>), TestSolvingError> {
        let latest_result = self
            .test_result_repo
            .find_latest_by_user_and_practice_test(user_id, practice_test_id)
            .await?;

        if let Some(result) = latest_result {
            let hours_since = (Utc::now() - result.solved_at).num_seconds() as f64 / 3600.0;
            if hours_since < 24.0 {
                return Ok((false, Some(24.0 - hours_since)));
            }
        }

        Ok((true, None))
    }
}

#[async_trait]
impl<P, R> TestSolvingService for TestSolvingServiceImpl<P, R>
where
    P: PracticeTestRepository + 'static,
    R: TestResultRepository + 'static,
{
    async fn solve_test(
        &self,
        user_id: Uuid,
        practice_test_id: Uuid,
        request: SolveTestRequest,
    ) -> Result<SolveTestResponse, TestSolvingError> {
        // Get practice test
        let practice_test = self
            .practice_test_repo
            .find_by_id(practice_test_id)
            .await?
            .ok_or(TestSolvingError::PracticeTestNotFound)?;

        // Check if user can retake (24 hour rule)
        let (can_retake, _hours_until) = self.can_retake_test(user_id, practice_test_id).await?;
        if !can_retake {
            return Err(TestSolvingError::CannotRetakeYet);
        }

        // Validate answer lengths match
        if request.user_answers.len() != practice_test.answer_key.len() {
            return Err(TestSolvingError::UserAnswersLengthMismatch);
        }

        // Evaluate answers
        let (correct, wrong, empty) =
            self.evaluate_answers(&practice_test.answer_key, &request.user_answers)?;

        // Create test result
        let test_result = TestResult::new(
            user_id,
            practice_test_id,
            request.user_answers,
            correct,
            wrong,
            empty,
        );

        // Save result
        let saved_result = self.test_result_repo.create(&test_result).await?;

        Ok(SolveTestResponse {
            result: TestResultResponse {
                id: saved_result.id,
                user_id: saved_result.user_id,
                practice_test_id: saved_result.practice_test_id,
                user_answers: saved_result.user_answers,
                correct_count: saved_result.correct_count,
                wrong_count: saved_result.wrong_count,
                empty_count: saved_result.empty_count,
                net_score: saved_result.net_score,
                solved_at: saved_result.solved_at,
            },
            can_retake: true,
            hours_until_retake: None,
        })
    }
}

