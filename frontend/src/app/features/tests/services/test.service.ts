import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ExamType,
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

  getSubjects(examTypeId?: string): Observable<ApiResponse<Subject[]>> {
    const params = examTypeId ? { exam_type_id: examTypeId } : undefined;
    return this.api.get<Subject[]>('/subjects', params);
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

