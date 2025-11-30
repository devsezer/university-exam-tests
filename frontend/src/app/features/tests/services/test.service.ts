import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ExamType,
  Lesson,
  Subject,
  TestBook,
  PracticeTest,
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

  getTestBooks(subjectId?: string): Observable<ApiResponse<TestBook[]>> {
    const params = subjectId ? { subject_id: subjectId } : undefined;
    return this.api.get<TestBook[]>('/test-books', params);
  }

  getPracticeTests(testBookId?: string): Observable<ApiResponse<PracticeTest[]>> {
    const params = testBookId ? { test_book_id: testBookId } : undefined;
    return this.api.get<PracticeTest[]>('/practice-tests', params);
  }

  getPracticeTest(id: string): Observable<ApiResponse<PracticeTest>> {
    return this.api.get<PracticeTest>(`/practice-tests/${id}`);
  }

  solveTest(testId: string, request: SolveTestRequest): Observable<ApiResponse<SolveTestResponse>> {
    return this.api.post<SolveTestResponse>(`/tests/${testId}/solve`, request);
  }
}
