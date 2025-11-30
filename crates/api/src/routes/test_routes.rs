use axum::{
    routing::{delete, get, post, put},
    Router,
};

use crate::handlers::{
    create_exam_type, create_practice_test, create_subject, create_test_book, delete_exam_type,
    delete_practice_test, delete_subject, delete_test_book, get_exam_type, get_practice_test,
    get_result, get_subject, get_test_book, list_exam_types, list_my_results, list_practice_tests,
    list_subjects, list_test_books, solve_test, update_exam_type, update_practice_test,
    update_subject, update_test_book,
};
use crate::state::AppState;

/// Creates the test routes (public endpoints).
pub fn test_routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/exam-types", get(list_exam_types))
        .route("/api/v1/subjects", get(list_subjects))
        .route("/api/v1/test-books", get(list_test_books))
        .route("/api/v1/practice-tests", get(list_practice_tests))
        .route("/api/v1/tests/{id}/solve", post(solve_test))
        .route("/api/v1/my-results", get(list_my_results))
        .route("/api/v1/my-results/{id}", get(get_result))
}

/// Creates the admin test management routes (protected, admin only).
pub fn admin_test_routes() -> Router<AppState> {
    Router::new()
        // ExamType routes
        .route("/api/v1/admin/exam-types", post(create_exam_type))
        .route("/api/v1/admin/exam-types/{id}", get(get_exam_type))
        .route("/api/v1/admin/exam-types/{id}", put(update_exam_type))
        .route("/api/v1/admin/exam-types/{id}", delete(delete_exam_type))
        // Subject routes
        .route("/api/v1/admin/subjects", post(create_subject))
        .route("/api/v1/admin/subjects/{id}", get(get_subject))
        .route("/api/v1/admin/subjects/{id}", put(update_subject))
        .route("/api/v1/admin/subjects/{id}", delete(delete_subject))
        // TestBook routes
        .route("/api/v1/admin/test-books", post(create_test_book))
        .route("/api/v1/admin/test-books/{id}", get(get_test_book))
        .route("/api/v1/admin/test-books/{id}", put(update_test_book))
        .route("/api/v1/admin/test-books/{id}", delete(delete_test_book))
        // PracticeTest routes
        .route("/api/v1/admin/practice-tests", post(create_practice_test))
        .route("/api/v1/admin/practice-tests/{id}", get(get_practice_test))
        .route("/api/v1/admin/practice-tests/{id}", put(update_practice_test))
        .route("/api/v1/admin/practice-tests/{id}", delete(delete_practice_test))
}

