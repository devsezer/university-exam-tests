use async_trait::async_trait;
use std::sync::Arc;
use uuid::Uuid;

use domain::entities::{ExamType, Lesson, PracticeTest, Subject, TestBook};
use domain::errors::DomainError;
use domain::repositories::{
    ExamTypeRepository, LessonRepository, PracticeTestRepository, SubjectRepository,
    TestBookRepository, TestBookSubjectRepository,
};

use crate::dto::{
    CreateExamTypeRequest, CreateLessonRequest, CreatePracticeTestRequest, CreateSubjectRequest,
    CreateTestBookRequest, ExamTypeResponse, LessonResponse, PracticeTestResponse, SubjectResponse,
    TestBookResponse, UpdateExamTypeRequest, UpdateLessonRequest, UpdatePracticeTestRequest,
    UpdateSubjectRequest, UpdateTestBookRequest,
};

/// Errors for test management operations.
#[derive(Debug, thiserror::Error)]
pub enum TestManagementError {
    #[error("Lesson not found")]
    LessonNotFound,

    #[error("Exam type not found")]
    ExamTypeNotFound,

    #[error("Subject not found")]
    SubjectNotFound,

    #[error("Test book not found")]
    TestBookNotFound,

    #[error("Practice test not found")]
    PracticeTestNotFound,

    #[error("Duplicate lesson name")]
    DuplicateLessonName,

    #[error("Duplicate exam type name")]
    DuplicateExamTypeName,

    #[error("Duplicate subject name for exam type")]
    DuplicateSubjectName,

    #[error("A test with this name and number already exists for this test book and subject")]
    DuplicateTestNumber,

    #[error("Internal error: {0}")]
    InternalError(String),
}

impl From<DomainError> for TestManagementError {
    fn from(err: DomainError) -> Self {
        // Check for duplicate practice test constraint violation
        if let DomainError::DatabaseError(ref msg) = err {
            if msg.contains("practice_tests_book_subject_name_number_unique") {
                return TestManagementError::DuplicateTestNumber;
            }
        }
        TestManagementError::InternalError(err.to_string())
    }
}

/// Trait for test management operations.
#[async_trait]
pub trait TestManagementService: Send + Sync {
    // Lesson operations
    async fn create_lesson(
        &self,
        request: CreateLessonRequest,
    ) -> Result<LessonResponse, TestManagementError>;
    async fn get_lesson(&self, id: Uuid) -> Result<LessonResponse, TestManagementError>;
    async fn list_lessons(&self) -> Result<Vec<LessonResponse>, TestManagementError>;
    async fn update_lesson(
        &self,
        id: Uuid,
        request: UpdateLessonRequest,
    ) -> Result<LessonResponse, TestManagementError>;
    async fn delete_lesson(&self, id: Uuid) -> Result<(), TestManagementError>;

    // ExamType operations
    async fn create_exam_type(
        &self,
        request: CreateExamTypeRequest,
    ) -> Result<ExamTypeResponse, TestManagementError>;
    async fn get_exam_type(&self, id: Uuid) -> Result<ExamTypeResponse, TestManagementError>;
    async fn list_exam_types(&self) -> Result<Vec<ExamTypeResponse>, TestManagementError>;
    async fn update_exam_type(
        &self,
        id: Uuid,
        request: UpdateExamTypeRequest,
    ) -> Result<ExamTypeResponse, TestManagementError>;
    async fn delete_exam_type(&self, id: Uuid) -> Result<(), TestManagementError>;

    // Subject operations
    async fn create_subject(
        &self,
        request: CreateSubjectRequest,
    ) -> Result<SubjectResponse, TestManagementError>;
    async fn get_subject(&self, id: Uuid) -> Result<SubjectResponse, TestManagementError>;
    async fn list_subjects_by_exam_type(
        &self,
        exam_type_id: Uuid,
    ) -> Result<Vec<SubjectResponse>, TestManagementError>;
    async fn list_subjects_by_lesson_and_exam_type(
        &self,
        lesson_id: Uuid,
        exam_type_id: Uuid,
    ) -> Result<Vec<SubjectResponse>, TestManagementError>;
    async fn list_all_subjects(&self) -> Result<Vec<SubjectResponse>, TestManagementError>;
    async fn update_subject(
        &self,
        id: Uuid,
        request: UpdateSubjectRequest,
    ) -> Result<SubjectResponse, TestManagementError>;
    async fn delete_subject(&self, id: Uuid) -> Result<(), TestManagementError>;

    // TestBook operations
    async fn create_test_book(
        &self,
        request: CreateTestBookRequest,
    ) -> Result<TestBookResponse, TestManagementError>;
    async fn get_test_book(&self, id: Uuid) -> Result<TestBookResponse, TestManagementError>;
    async fn list_subjects_by_test_book_id(
        &self,
        test_book_id: Uuid,
    ) -> Result<Vec<SubjectResponse>, TestManagementError>;
    async fn list_test_books_by_subject(
        &self,
        subject_id: Uuid,
    ) -> Result<Vec<TestBookResponse>, TestManagementError>;
    async fn list_test_books_by_exam_type(
        &self,
        exam_type_id: Uuid,
    ) -> Result<Vec<TestBookResponse>, TestManagementError>;
    async fn list_test_books_by_exam_type_and_lesson(
        &self,
        exam_type_id: Uuid,
        lesson_id: Uuid,
    ) -> Result<Vec<TestBookResponse>, TestManagementError>;
    async fn list_all_test_books(&self) -> Result<Vec<TestBookResponse>, TestManagementError>;
    async fn update_test_book(
        &self,
        id: Uuid,
        request: UpdateTestBookRequest,
    ) -> Result<TestBookResponse, TestManagementError>;
    async fn delete_test_book(&self, id: Uuid) -> Result<(), TestManagementError>;

    // PracticeTest operations
    async fn create_practice_test(
        &self,
        request: CreatePracticeTestRequest,
    ) -> Result<PracticeTestResponse, TestManagementError>;
    async fn get_practice_test(&self, id: Uuid) -> Result<PracticeTestResponse, TestManagementError>;
    async fn list_practice_tests_by_test_book(
        &self,
        test_book_id: Uuid,
    ) -> Result<Vec<PracticeTestResponse>, TestManagementError>;
    async fn list_practice_tests_grouped_by_subject(
        &self,
        test_book_id: Uuid,
    ) -> Result<std::collections::HashMap<Uuid, Vec<PracticeTestResponse>>, TestManagementError>;
    async fn list_all_practice_tests(&self) -> Result<Vec<PracticeTestResponse>, TestManagementError>;
    async fn update_practice_test(
        &self,
        id: Uuid,
        request: UpdatePracticeTestRequest,
    ) -> Result<PracticeTestResponse, TestManagementError>;
    async fn delete_practice_test(&self, id: Uuid) -> Result<(), TestManagementError>;
}

/// Implementation of TestManagementService.
pub struct TestManagementServiceImpl<L, E, S, T, TB, P>
where
    L: LessonRepository,
    E: ExamTypeRepository,
    S: SubjectRepository,
    T: TestBookRepository,
    TB: TestBookSubjectRepository,
    P: PracticeTestRepository,
{
    lesson_repo: Arc<L>,
    exam_type_repo: Arc<E>,
    subject_repo: Arc<S>,
    test_book_repo: Arc<T>,
    test_book_subject_repo: Arc<TB>,
    practice_test_repo: Arc<P>,
}

impl<L, E, S, T, TB, P> TestManagementServiceImpl<L, E, S, T, TB, P>
where
    L: LessonRepository,
    E: ExamTypeRepository,
    S: SubjectRepository,
    T: TestBookRepository,
    TB: TestBookSubjectRepository,
    P: PracticeTestRepository,
{
    pub fn new(
        lesson_repo: Arc<L>,
        exam_type_repo: Arc<E>,
        subject_repo: Arc<S>,
        test_book_repo: Arc<T>,
        test_book_subject_repo: Arc<TB>,
        practice_test_repo: Arc<P>,
    ) -> Self {
        Self {
            lesson_repo,
            exam_type_repo,
            subject_repo,
            test_book_repo,
            test_book_subject_repo,
            practice_test_repo,
        }
    }
}

#[async_trait]
impl<L, E, S, T, TB, P> TestManagementService for TestManagementServiceImpl<L, E, S, T, TB, P>
where
    L: LessonRepository + 'static,
    E: ExamTypeRepository + 'static,
    S: SubjectRepository + 'static,
    T: TestBookRepository + 'static,
    TB: TestBookSubjectRepository + 'static,
    P: PracticeTestRepository + 'static,
{
    // Lesson operations
    async fn create_lesson(
        &self,
        request: CreateLessonRequest,
    ) -> Result<LessonResponse, TestManagementError> {
        // Check for duplicate name
        if self.lesson_repo.find_by_name(&request.name).await?.is_some() {
            return Err(TestManagementError::DuplicateLessonName);
        }

        let lesson = Lesson::new(request.name);
        let created = self.lesson_repo.create(&lesson).await?;

        Ok(LessonResponse {
            id: created.id,
            name: created.name,
            created_at: created.created_at,
        })
    }

    async fn get_lesson(&self, id: Uuid) -> Result<LessonResponse, TestManagementError> {
        let lesson = self
            .lesson_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::LessonNotFound)?;

        Ok(LessonResponse {
            id: lesson.id,
            name: lesson.name,
            created_at: lesson.created_at,
        })
    }

    async fn list_lessons(&self) -> Result<Vec<LessonResponse>, TestManagementError> {
        let lessons = self.lesson_repo.list_all().await?;

        Ok(lessons
            .into_iter()
            .map(|l| LessonResponse {
                id: l.id,
                name: l.name,
                created_at: l.created_at,
            })
            .collect())
    }

    async fn update_lesson(
        &self,
        id: Uuid,
        request: UpdateLessonRequest,
    ) -> Result<LessonResponse, TestManagementError> {
        let mut lesson = self
            .lesson_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::LessonNotFound)?;

        if let Some(name) = request.name {
            lesson.name = name;
        }

        let updated = self.lesson_repo.update(&lesson).await?;

        Ok(LessonResponse {
            id: updated.id,
            name: updated.name,
            created_at: updated.created_at,
        })
    }

    async fn delete_lesson(&self, id: Uuid) -> Result<(), TestManagementError> {
        self.lesson_repo
            .delete(id)
            .await
            .map_err(|_| TestManagementError::LessonNotFound)?;
        Ok(())
    }

    // ExamType operations
    async fn create_exam_type(
        &self,
        request: CreateExamTypeRequest,
    ) -> Result<ExamTypeResponse, TestManagementError> {
        // Check for duplicate name
        if self.exam_type_repo.find_by_name(&request.name).await?.is_some() {
            return Err(TestManagementError::DuplicateExamTypeName);
        }

        let exam_type = ExamType::new(request.name, request.description);
        let created = self.exam_type_repo.create(&exam_type).await?;

        Ok(ExamTypeResponse {
            id: created.id,
            name: created.name,
            description: created.description,
            created_at: created.created_at,
        })
    }

    async fn get_exam_type(&self, id: Uuid) -> Result<ExamTypeResponse, TestManagementError> {
        let exam_type = self
            .exam_type_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::ExamTypeNotFound)?;

        Ok(ExamTypeResponse {
            id: exam_type.id,
            name: exam_type.name,
            description: exam_type.description,
            created_at: exam_type.created_at,
        })
    }

    async fn list_exam_types(&self) -> Result<Vec<ExamTypeResponse>, TestManagementError> {
        let exam_types = self.exam_type_repo.list_all().await?;

        Ok(exam_types
            .into_iter()
            .map(|et| ExamTypeResponse {
                id: et.id,
                name: et.name,
                description: et.description,
                created_at: et.created_at,
            })
            .collect())
    }

    async fn update_exam_type(
        &self,
        id: Uuid,
        request: UpdateExamTypeRequest,
    ) -> Result<ExamTypeResponse, TestManagementError> {
        let mut exam_type = self
            .exam_type_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::ExamTypeNotFound)?;

        if let Some(name) = request.name {
            exam_type.name = name;
        }
        if let Some(description) = request.description {
            exam_type.description = Some(description);
        }

        let updated = self.exam_type_repo.update(&exam_type).await?;

        Ok(ExamTypeResponse {
            id: updated.id,
            name: updated.name,
            description: updated.description,
            created_at: updated.created_at,
        })
    }

    async fn delete_exam_type(&self, id: Uuid) -> Result<(), TestManagementError> {
        self.exam_type_repo
            .delete(id)
            .await
            .map_err(|_| TestManagementError::ExamTypeNotFound)?;
        Ok(())
    }

    async fn create_subject(
        &self,
        request: CreateSubjectRequest,
    ) -> Result<SubjectResponse, TestManagementError> {
        // Verify lesson exists
        self.lesson_repo
            .find_by_id(request.lesson_id)
            .await?
            .ok_or(TestManagementError::LessonNotFound)?;

        // Verify exam type exists
        self.exam_type_repo
            .find_by_id(request.exam_type_id)
            .await?
            .ok_or(TestManagementError::ExamTypeNotFound)?;

        let subject = Subject::new(request.name, request.lesson_id, request.exam_type_id);
        let created = self.subject_repo.create(&subject).await?;

        Ok(SubjectResponse {
            id: created.id,
            name: created.name,
            lesson_id: created.lesson_id,
            exam_type_id: created.exam_type_id,
            created_at: created.created_at,
        })
    }

    async fn get_subject(&self, id: Uuid) -> Result<SubjectResponse, TestManagementError> {
        let subject = self
            .subject_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::SubjectNotFound)?;

        Ok(SubjectResponse {
            id: subject.id,
            name: subject.name,
            lesson_id: subject.lesson_id,
            exam_type_id: subject.exam_type_id,
            created_at: subject.created_at,
        })
    }

    async fn list_subjects_by_exam_type(
        &self,
        exam_type_id: Uuid,
    ) -> Result<Vec<SubjectResponse>, TestManagementError> {
        let subjects = self.subject_repo.find_by_exam_type_id(exam_type_id).await?;

        Ok(subjects
            .into_iter()
            .map(|s| SubjectResponse {
                id: s.id,
                name: s.name,
                lesson_id: s.lesson_id,
                exam_type_id: s.exam_type_id,
                created_at: s.created_at,
            })
            .collect())
    }

    async fn list_subjects_by_lesson_and_exam_type(
        &self,
        lesson_id: Uuid,
        exam_type_id: Uuid,
    ) -> Result<Vec<SubjectResponse>, TestManagementError> {
        let subjects = self
            .subject_repo
            .find_by_lesson_and_exam_type(lesson_id, exam_type_id)
            .await?;

        Ok(subjects
            .into_iter()
            .map(|s| SubjectResponse {
                id: s.id,
                name: s.name,
                lesson_id: s.lesson_id,
                exam_type_id: s.exam_type_id,
                created_at: s.created_at,
            })
            .collect())
    }

    async fn list_all_subjects(&self) -> Result<Vec<SubjectResponse>, TestManagementError> {
        let subjects = self.subject_repo.list_all().await?;

        Ok(subjects
            .into_iter()
            .map(|s| SubjectResponse {
                id: s.id,
                name: s.name,
                lesson_id: s.lesson_id,
                exam_type_id: s.exam_type_id,
                created_at: s.created_at,
            })
            .collect())
    }

    async fn update_subject(
        &self,
        id: Uuid,
        request: UpdateSubjectRequest,
    ) -> Result<SubjectResponse, TestManagementError> {
        let mut subject = self
            .subject_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::SubjectNotFound)?;

        if let Some(name) = request.name {
            subject.name = name;
        }
        if let Some(lesson_id) = request.lesson_id {
            // Verify lesson exists
            self.lesson_repo
                .find_by_id(lesson_id)
                .await?
                .ok_or(TestManagementError::LessonNotFound)?;
            subject.lesson_id = lesson_id;
        }
        if let Some(exam_type_id) = request.exam_type_id {
            // Verify exam type exists
            self.exam_type_repo
                .find_by_id(exam_type_id)
                .await?
                .ok_or(TestManagementError::ExamTypeNotFound)?;
            subject.exam_type_id = exam_type_id;
        }

        let updated = self.subject_repo.update(&subject).await?;

        Ok(SubjectResponse {
            id: updated.id,
            name: updated.name,
            lesson_id: updated.lesson_id,
            exam_type_id: updated.exam_type_id,
            created_at: updated.created_at,
        })
    }

    async fn delete_subject(&self, id: Uuid) -> Result<(), TestManagementError> {
        self.subject_repo
            .delete(id)
            .await
            .map_err(|_| TestManagementError::SubjectNotFound)?;
        Ok(())
    }

    async fn create_test_book(
        &self,
        request: CreateTestBookRequest,
    ) -> Result<TestBookResponse, TestManagementError> {
        // Verify lesson and exam type exist
        self.lesson_repo
            .find_by_id(request.lesson_id)
            .await?
            .ok_or(TestManagementError::LessonNotFound)?;
        self.exam_type_repo
            .find_by_id(request.exam_type_id)
            .await?
            .ok_or(TestManagementError::ExamTypeNotFound)?;

        // Verify all subjects exist
        for subject_id in &request.subject_ids {
            self.subject_repo
                .find_by_id(*subject_id)
                .await?
                .ok_or(TestManagementError::SubjectNotFound)?;
        }

        let test_book = TestBook::new(
            request.name,
            request.lesson_id,
            request.exam_type_id,
            request.published_year,
        );
        let created = self.test_book_repo.create(&test_book).await?;

        // Add subjects to junction table
        self.test_book_subject_repo
            .set_subjects(created.id, &request.subject_ids)
            .await?;

        // Get subject IDs for response
        let subject_ids = self
            .test_book_subject_repo
            .find_subject_ids_by_test_book_id(created.id)
            .await?;

        Ok(TestBookResponse {
            id: created.id,
            name: created.name,
            lesson_id: created.lesson_id,
            exam_type_id: created.exam_type_id,
            subject_ids,
            published_year: created.published_year,
            created_at: created.created_at,
        })
    }

    async fn get_test_book(&self, id: Uuid) -> Result<TestBookResponse, TestManagementError> {
        let test_book = self
            .test_book_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::TestBookNotFound)?;

        // Get subject IDs from junction table
        let subject_ids = self
            .test_book_subject_repo
            .find_subject_ids_by_test_book_id(id)
            .await?;

        Ok(TestBookResponse {
            id: test_book.id,
            name: test_book.name,
            lesson_id: test_book.lesson_id,
            exam_type_id: test_book.exam_type_id,
            subject_ids,
            published_year: test_book.published_year,
            created_at: test_book.created_at,
        })
    }

    async fn list_subjects_by_test_book_id(
        &self,
        test_book_id: Uuid,
    ) -> Result<Vec<SubjectResponse>, TestManagementError> {
        // Test book'un varlığını kontrol et
        self.test_book_repo
            .find_by_id(test_book_id)
            .await?
            .ok_or(TestManagementError::TestBookNotFound)?;

        // Junction table'dan subject ID'leri al
        let subject_ids = self
            .test_book_subject_repo
            .find_subject_ids_by_test_book_id(test_book_id)
            .await?;

        // Her subject ID için subject bilgilerini getir
        let mut subjects = Vec::new();
        for subject_id in subject_ids {
            let subject = self
                .subject_repo
                .find_by_id(subject_id)
                .await?
                .ok_or(TestManagementError::SubjectNotFound)?;

            subjects.push(SubjectResponse {
                id: subject.id,
                name: subject.name,
                lesson_id: subject.lesson_id,
                exam_type_id: subject.exam_type_id,
                created_at: subject.created_at,
            });
        }

        Ok(subjects)
    }

    async fn list_test_books_by_subject(
        &self,
        subject_id: Uuid,
    ) -> Result<Vec<TestBookResponse>, TestManagementError> {
        let test_books = self.test_book_repo.find_by_subject_id(subject_id).await?;

        // Get subject IDs for each test book
        let mut responses = Vec::new();
        for tb in test_books {
            let subject_ids = self
                .test_book_subject_repo
                .find_subject_ids_by_test_book_id(tb.id)
                .await?;
            responses.push(TestBookResponse {
                id: tb.id,
                name: tb.name,
                lesson_id: tb.lesson_id,
                exam_type_id: tb.exam_type_id,
                subject_ids,
                published_year: tb.published_year,
                created_at: tb.created_at,
            });
        }

        Ok(responses)
    }

    async fn list_test_books_by_exam_type(
        &self,
        exam_type_id: Uuid,
    ) -> Result<Vec<TestBookResponse>, TestManagementError> {
        let test_books = self
            .test_book_repo
            .find_by_exam_type_id(exam_type_id)
            .await?;

        // Get subject IDs for each test book
        let mut responses = Vec::new();
        for tb in test_books {
            let subject_ids = self
                .test_book_subject_repo
                .find_subject_ids_by_test_book_id(tb.id)
                .await?;
            responses.push(TestBookResponse {
                id: tb.id,
                name: tb.name,
                lesson_id: tb.lesson_id,
                exam_type_id: tb.exam_type_id,
                subject_ids,
                published_year: tb.published_year,
                created_at: tb.created_at,
            });
        }

        Ok(responses)
    }

    async fn list_test_books_by_exam_type_and_lesson(
        &self,
        exam_type_id: Uuid,
        lesson_id: Uuid,
    ) -> Result<Vec<TestBookResponse>, TestManagementError> {
        let test_books = self
            .test_book_repo
            .find_by_exam_type_and_lesson(exam_type_id, lesson_id)
            .await?;

        // Get subject IDs for each test book
        let mut responses = Vec::new();
        for tb in test_books {
            let subject_ids = self
                .test_book_subject_repo
                .find_subject_ids_by_test_book_id(tb.id)
                .await?;
            responses.push(TestBookResponse {
                id: tb.id,
                name: tb.name,
                lesson_id: tb.lesson_id,
                exam_type_id: tb.exam_type_id,
                subject_ids,
                published_year: tb.published_year,
                created_at: tb.created_at,
            });
        }

        Ok(responses)
    }

    async fn list_all_test_books(&self) -> Result<Vec<TestBookResponse>, TestManagementError> {
        let test_books = self.test_book_repo.list_all().await?;

        // Get subject IDs for each test book
        let mut responses = Vec::new();
        for tb in test_books {
            let subject_ids = self
                .test_book_subject_repo
                .find_subject_ids_by_test_book_id(tb.id)
                .await?;
            responses.push(TestBookResponse {
                id: tb.id,
                name: tb.name,
                lesson_id: tb.lesson_id,
                exam_type_id: tb.exam_type_id,
                subject_ids,
                published_year: tb.published_year,
                created_at: tb.created_at,
            });
        }

        Ok(responses)
    }

    async fn update_test_book(
        &self,
        id: Uuid,
        request: UpdateTestBookRequest,
    ) -> Result<TestBookResponse, TestManagementError> {
        let mut test_book = self
            .test_book_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::TestBookNotFound)?;

        if let Some(name) = request.name {
            test_book.name = name;
        }
        if let Some(lesson_id) = request.lesson_id {
            self.lesson_repo
                .find_by_id(lesson_id)
                .await?
                .ok_or(TestManagementError::LessonNotFound)?;
            test_book.lesson_id = lesson_id;
        }
        if let Some(exam_type_id) = request.exam_type_id {
            self.exam_type_repo
                .find_by_id(exam_type_id)
                .await?
                .ok_or(TestManagementError::ExamTypeNotFound)?;
            test_book.exam_type_id = exam_type_id;
        }
        if let Some(published_year) = request.published_year {
            test_book.published_year = published_year;
        }

        let updated = self.test_book_repo.update(&test_book).await?;

        // Update subjects if provided
        if let Some(subject_ids) = request.subject_ids {
            // Verify all subjects exist
            for subject_id in &subject_ids {
                self.subject_repo
                    .find_by_id(*subject_id)
                    .await?
                    .ok_or(TestManagementError::SubjectNotFound)?;
            }
            // Update junction table
            self.test_book_subject_repo
                .set_subjects(id, &subject_ids)
                .await?;
        }

        // Get subject IDs for response
        let subject_ids = self
            .test_book_subject_repo
            .find_subject_ids_by_test_book_id(id)
            .await?;

        Ok(TestBookResponse {
            id: updated.id,
            name: updated.name,
            lesson_id: updated.lesson_id,
            exam_type_id: updated.exam_type_id,
            subject_ids,
            published_year: updated.published_year,
            created_at: updated.created_at,
        })
    }

    async fn delete_test_book(&self, id: Uuid) -> Result<(), TestManagementError> {
        self.test_book_repo
            .delete(id)
            .await
            .map_err(|_| TestManagementError::TestBookNotFound)?;
        Ok(())
    }

    async fn create_practice_test(
        &self,
        request: CreatePracticeTestRequest,
    ) -> Result<PracticeTestResponse, TestManagementError> {
        // Verify test book exists
        self.test_book_repo
            .find_by_id(request.test_book_id)
            .await?
            .ok_or(TestManagementError::TestBookNotFound)?;

        // Verify subject exists
        self.subject_repo
            .find_by_id(request.subject_id)
            .await?
            .ok_or(TestManagementError::SubjectNotFound)?;

        // Verify subject belongs to test book
        let test_book_subjects = self
            .test_book_subject_repo
            .find_subject_ids_by_test_book_id(request.test_book_id)
            .await?;
        if !test_book_subjects.contains(&request.subject_id) {
            return Err(TestManagementError::SubjectNotFound);
        }

        let practice_test = PracticeTest::new(
            request.name,
            request.test_number,
            request.question_count,
            request.answer_key,
            request.test_book_id,
            request.subject_id,
        );
        let created = self.practice_test_repo.create(&practice_test).await?;

        Ok(PracticeTestResponse {
            id: created.id,
            name: created.name,
            test_number: created.test_number,
            question_count: created.question_count,
            answer_key: created.answer_key,
            test_book_id: created.test_book_id,
            subject_id: created.subject_id,
            created_at: created.created_at,
        })
    }

    async fn get_practice_test(&self, id: Uuid) -> Result<PracticeTestResponse, TestManagementError> {
        let practice_test = self
            .practice_test_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::PracticeTestNotFound)?;

        Ok(PracticeTestResponse {
            id: practice_test.id,
            name: practice_test.name,
            test_number: practice_test.test_number,
            question_count: practice_test.question_count,
            answer_key: practice_test.answer_key,
            test_book_id: practice_test.test_book_id,
            subject_id: practice_test.subject_id,
            created_at: practice_test.created_at,
        })
    }

    async fn list_practice_tests_by_test_book(
        &self,
        test_book_id: Uuid,
    ) -> Result<Vec<PracticeTestResponse>, TestManagementError> {
        let practice_tests = self
            .practice_test_repo
            .find_by_test_book_id(test_book_id)
            .await?;

        Ok(practice_tests
            .into_iter()
            .map(|pt| PracticeTestResponse {
                id: pt.id,
                name: pt.name,
                test_number: pt.test_number,
                question_count: pt.question_count,
                answer_key: pt.answer_key,
                test_book_id: pt.test_book_id,
                subject_id: pt.subject_id,
                created_at: pt.created_at,
            })
            .collect())
    }

    async fn list_practice_tests_grouped_by_subject(
        &self,
        test_book_id: Uuid,
    ) -> Result<std::collections::HashMap<Uuid, Vec<PracticeTestResponse>>, TestManagementError> {
        // Verify test book exists
        self.test_book_repo
            .find_by_id(test_book_id)
            .await?
            .ok_or(TestManagementError::TestBookNotFound)?;

        let practice_tests = self
            .practice_test_repo
            .find_by_test_book_id(test_book_id)
            .await?;

        // Group by subject_id
        let mut grouped: std::collections::HashMap<Uuid, Vec<PracticeTestResponse>> =
            std::collections::HashMap::new();

        for pt in practice_tests {
            let response = PracticeTestResponse {
                id: pt.id,
                name: pt.name,
                test_number: pt.test_number,
                question_count: pt.question_count,
                answer_key: pt.answer_key,
                test_book_id: pt.test_book_id,
                subject_id: pt.subject_id,
                created_at: pt.created_at,
            };

            grouped
                .entry(pt.subject_id)
                .or_insert_with(Vec::new)
                .push(response);
        }

        Ok(grouped)
    }

    async fn list_all_practice_tests(&self) -> Result<Vec<PracticeTestResponse>, TestManagementError> {
        let practice_tests = self.practice_test_repo.list_all().await?;

        Ok(practice_tests
            .into_iter()
            .map(|pt| PracticeTestResponse {
                id: pt.id,
                name: pt.name,
                test_number: pt.test_number,
                question_count: pt.question_count,
                answer_key: pt.answer_key,
                test_book_id: pt.test_book_id,
                subject_id: pt.subject_id,
                created_at: pt.created_at,
            })
            .collect())
    }

    async fn update_practice_test(
        &self,
        id: Uuid,
        request: UpdatePracticeTestRequest,
    ) -> Result<PracticeTestResponse, TestManagementError> {
        let mut practice_test = self
            .practice_test_repo
            .find_by_id(id)
            .await?
            .ok_or(TestManagementError::PracticeTestNotFound)?;

        // Determine which test_book_id to use for subject validation
        let test_book_id_for_validation = request.test_book_id.unwrap_or(practice_test.test_book_id);

        if let Some(name) = request.name {
            practice_test.name = name;
        }
        if let Some(test_number) = request.test_number {
            practice_test.test_number = test_number;
        }
        if let Some(question_count) = request.question_count {
            practice_test.question_count = question_count;
        }
        if let Some(answer_key) = request.answer_key {
            practice_test.answer_key = answer_key;
        }
        if let Some(test_book_id) = request.test_book_id {
            self.test_book_repo
                .find_by_id(test_book_id)
                .await?
                .ok_or(TestManagementError::TestBookNotFound)?;
            practice_test.test_book_id = test_book_id;
        }
        if let Some(subject_id) = request.subject_id {
            // Verify subject exists
            self.subject_repo
                .find_by_id(subject_id)
                .await?
                .ok_or(TestManagementError::SubjectNotFound)?;

            // Verify subject belongs to test book
            let test_book_subjects = self
                .test_book_subject_repo
                .find_subject_ids_by_test_book_id(test_book_id_for_validation)
                .await?;
            if !test_book_subjects.contains(&subject_id) {
                return Err(TestManagementError::SubjectNotFound);
            }

            practice_test.subject_id = subject_id;
        }

        let updated = self.practice_test_repo.update(&practice_test).await?;

        Ok(PracticeTestResponse {
            id: updated.id,
            name: updated.name,
            test_number: updated.test_number,
            question_count: updated.question_count,
            answer_key: updated.answer_key,
            test_book_id: updated.test_book_id,
            subject_id: updated.subject_id,
            created_at: updated.created_at,
        })
    }

    async fn delete_practice_test(&self, id: Uuid) -> Result<(), TestManagementError> {
        self.practice_test_repo
            .delete(id)
            .await
            .map_err(|_| TestManagementError::PracticeTestNotFound)?;
        Ok(())
    }
}

