export interface ExamType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  exam_type_id: string;
  created_at: string;
}

export interface TestBook {
  id: string;
  name: string;
  exam_type_id: string;
  subject_id: string;
  published_year: number;
  created_at: string;
}

export interface PracticeTest {
  id: string;
  name: string;
  test_number: number;
  question_count: number;
  answer_key: string;
  test_book_id: string;
  created_at: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  practice_test_id: string;
  user_answers: string;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
  net_score: number;
  solved_at: string;
}

export interface SolveTestRequest {
  user_answers: string; // "ABCD_BCD..." format (_ = boş)
}

export interface SolveTestResponse {
  result: TestResult;
  can_retake: boolean;
  hours_until_retake?: number;
}

// Admin Request DTOs
export interface CreateExamTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateExamTypeRequest {
  name?: string;
  description?: string;
}

export interface CreateSubjectRequest {
  name: string;
  exam_type_id: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  exam_type_id?: string;
}

export interface CreateTestBookRequest {
  name: string;
  exam_type_id: string;
  subject_id: string;
  published_year: number;
}

export interface UpdateTestBookRequest {
  name?: string;
  exam_type_id?: string;
  subject_id?: string;
  published_year?: number;
}

export interface CreatePracticeTestRequest {
  name: string;
  test_number: number;
  question_count: number;
  answer_key: string;
  test_book_id: string;
}

export interface UpdatePracticeTestRequest {
  name?: string;
  test_number?: number;
  question_count?: number;
  answer_key?: string;
  test_book_id?: string;
}

