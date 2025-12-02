import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ExamType,
  Lesson,
  Subject,
  TestBook,
  TestBookWithStats,
  TestBookDetail,
  PracticeTest,
  PracticeTestWithStatus,
  PracticeTestsGrouped,
  TestResult,
  SolveTestRequest,
  SolveTestResponse
} from '../../../models/test.models';
import { ApiResponse, PaginatedResponse } from '../../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  constructor(private api: ApiService) {}

  getExamTypes(): Observable<ApiResponse<ExamType[]>> {
    return this.api.get<ExamType[]>('/exam-types');
  }

  getLessons(): Observable<ApiResponse<Lesson[]>> {
    return this.api.get<Lesson[]>('/lessons');
  }

  getSubjects(examTypeId?: string, lessonId?: string): Observable<ApiResponse<Subject[]>> {
    const params: Record<string, string> = {};
    if (examTypeId) params['exam_type_id'] = examTypeId;
    if (lessonId) params['lesson_id'] = lessonId;
    return this.api.get<Subject[]>('/subjects', Object.keys(params).length ? params : undefined);
  }

  getTestBooks(examTypeId?: string, lessonId?: string, subjectId?: string): Observable<ApiResponse<TestBook[]>> {
    const params: Record<string, string> = {};
    if (subjectId) {
      params['subject_id'] = subjectId;
    } else if (examTypeId && lessonId) {
      params['exam_type_id'] = examTypeId;
      params['lesson_id'] = lessonId;
    }
    return this.api.get<TestBook[]>('/test-books', Object.keys(params).length ? params : undefined);
  }

  getPracticeTests(testBookId?: string): Observable<ApiResponse<PracticeTest[]>> {
    const params = testBookId ? { test_book_id: testBookId } : undefined;
    return this.api.get<PracticeTest[]>('/practice-tests', params);
  }

  getPracticeTestsGrouped(testBookId: string): Observable<ApiResponse<PracticeTestsGrouped>> {
    return this.api.get<PracticeTestsGrouped>(`/test-books/${testBookId}/practice-tests-grouped`);
  }

  getPracticeTest(id: string): Observable<ApiResponse<PracticeTest>> {
    return this.api.get<PracticeTest>(`/practice-tests/${id}`);
  }

  solveTest(testId: string, request: SolveTestRequest): Observable<ApiResponse<SolveTestResponse>> {
    return this.api.post<SolveTestResponse>(`/tests/${testId}/solve`, request);
  }

  getTestBooksWithStats(examTypeId?: string, lessonId?: string, search?: string): Observable<ApiResponse<TestBookWithStats[]>> {
    const params: Record<string, string> = {};
    if (examTypeId) params['exam_type_id'] = examTypeId;
    if (lessonId) params['lesson_id'] = lessonId;
    if (search) params['search'] = search;
    return this.api.get<TestBookWithStats[]>('/test-books-with-stats', Object.keys(params).length ? params : undefined);
  }

  getTestBookDetail(id: string): Observable<ApiResponse<TestBookDetail>> {
    // For now, we'll combine multiple calls to get the detail
    // In the future, we can add a dedicated endpoint
    return this.api.get<TestBookDetail>(`/test-books/${id}`);
  }

  getPracticeTestsWithStatus(bookId: string, subjectId?: string): Observable<ApiResponse<PracticeTestWithStatus[]>> {
    const params: Record<string, string> = {};
    if (subjectId) params['subject_id'] = subjectId;
    return this.api.get<PracticeTestWithStatus[]>(`/test-books/${bookId}/practice-tests-with-status`, Object.keys(params).length ? params : undefined);
  }
}
