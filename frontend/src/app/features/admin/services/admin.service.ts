import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ExamType,
  Lesson,
  Subject,
  TestBook,
  PracticeTest,
  CreateExamTypeRequest,
  UpdateExamTypeRequest,
  CreateLessonRequest,
  UpdateLessonRequest,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  CreateTestBookRequest,
  UpdateTestBookRequest,
  CreatePracticeTestRequest,
  UpdatePracticeTestRequest
} from '../../../models/test.models';
import { ApiResponse, PaginatedResponse } from '../../../models/api.models';
import { User, UpdateUserRequest, ListUsersParams, AssignRoleRequest } from '../../../models/user.models';
import { Role } from '../../../models/role.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private api: ApiService) {}

  // Exam Types
  createExamType(data: CreateExamTypeRequest): Observable<ApiResponse<ExamType>> {
    return this.api.post<ExamType>('/admin/exam-types', data);
  }

  updateExamType(id: string, data: UpdateExamTypeRequest): Observable<ApiResponse<ExamType>> {
    return this.api.put<ExamType>(`/admin/exam-types/${id}`, data);
  }

  deleteExamType(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/admin/exam-types/${id}`);
  }

  getExamType(id: string): Observable<ApiResponse<ExamType>> {
    return this.api.get<ExamType>(`/admin/exam-types/${id}`);
  }

  listExamTypes(): Observable<ApiResponse<ExamType[]>> {
    return this.api.get<ExamType[]>('/exam-types');
  }

  // Lessons
  createLesson(data: CreateLessonRequest): Observable<ApiResponse<Lesson>> {
    return this.api.post<Lesson>('/admin/lessons', data);
  }

  updateLesson(id: string, data: UpdateLessonRequest): Observable<ApiResponse<Lesson>> {
    return this.api.put<Lesson>(`/admin/lessons/${id}`, data);
  }

  deleteLesson(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/admin/lessons/${id}`);
  }

  getLesson(id: string): Observable<ApiResponse<Lesson>> {
    return this.api.get<Lesson>(`/admin/lessons/${id}`);
  }

  listLessons(): Observable<ApiResponse<Lesson[]>> {
    return this.api.get<Lesson[]>('/lessons');
  }

  // Subjects
  createSubject(data: CreateSubjectRequest): Observable<ApiResponse<Subject>> {
    return this.api.post<Subject>('/admin/subjects', data);
  }

  updateSubject(id: string, data: UpdateSubjectRequest): Observable<ApiResponse<Subject>> {
    return this.api.put<Subject>(`/admin/subjects/${id}`, data);
  }

  deleteSubject(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/admin/subjects/${id}`);
  }

  getSubject(id: string): Observable<ApiResponse<Subject>> {
    return this.api.get<Subject>(`/admin/subjects/${id}`);
  }

  listSubjects(examTypeId?: string, lessonId?: string): Observable<ApiResponse<Subject[]>> {
    const params: Record<string, string> = {};
    if (examTypeId) params['exam_type_id'] = examTypeId;
    if (lessonId) params['lesson_id'] = lessonId;
    return this.api.get<Subject[]>('/subjects', Object.keys(params).length ? params : undefined);
  }

  // Test Books
  createTestBook(data: CreateTestBookRequest): Observable<ApiResponse<TestBook>> {
    return this.api.post<TestBook>('/admin/test-books', data);
  }

  updateTestBook(id: string, data: UpdateTestBookRequest): Observable<ApiResponse<TestBook>> {
    return this.api.put<TestBook>(`/admin/test-books/${id}`, data);
  }

  deleteTestBook(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/admin/test-books/${id}`);
  }

  getTestBook(id: string): Observable<ApiResponse<TestBook>> {
    return this.api.get<TestBook>(`/admin/test-books/${id}`);
  }

  listTestBooks(subjectId?: string): Observable<ApiResponse<TestBook[]>> {
    const params = subjectId ? { subject_id: subjectId } : undefined;
    return this.api.get<TestBook[]>('/test-books', params);
  }

  getTestBookSubjects(testBookId: string): Observable<ApiResponse<Subject[]>> {
    return this.api.get<Subject[]>(`/test-books/${testBookId}/subjects`);
  }

  // Practice Tests
  createPracticeTest(data: CreatePracticeTestRequest): Observable<ApiResponse<PracticeTest>> {
    return this.api.post<PracticeTest>('/admin/practice-tests', data);
  }

  updatePracticeTest(id: string, data: UpdatePracticeTestRequest): Observable<ApiResponse<PracticeTest>> {
    return this.api.put<PracticeTest>(`/admin/practice-tests/${id}`, data);
  }

  deletePracticeTest(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/admin/practice-tests/${id}`);
  }

  getPracticeTest(id: string): Observable<ApiResponse<PracticeTest>> {
    return this.api.get<PracticeTest>(`/admin/practice-tests/${id}`);
  }

  listPracticeTests(testBookId?: string): Observable<ApiResponse<PracticeTest[]>> {
    const params = testBookId ? { test_book_id: testBookId } : undefined;
    return this.api.get<PracticeTest[]>('/practice-tests', params);
  }

  // User Management
  listUsers(params?: ListUsersParams): Observable<ApiResponse<PaginatedResponse<User>>> {
    return this.api.get<PaginatedResponse<User>>('/admin/users', params);
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.api.get<User>(`/admin/users/${id}`);
  }

  updateUser(id: string, data: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.api.put<User>(`/admin/users/${id}`, data);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/admin/users/${id}`);
  }

  restoreUser(id: string): Observable<ApiResponse<User>> {
    return this.api.post<User>(`/admin/users/${id}/restore`, {});
  }

  assignRoleToUser(userId: string, roleId: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(`/admin/users/${userId}/roles`, { role_id: roleId });
  }

  removeRoleFromUser(userId: string, roleId: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/admin/users/${userId}/roles/${roleId}`);
  }

  // Role Management
  listRoles(): Observable<ApiResponse<Role[]>> {
    return this.api.get<Role[]>('/admin/roles');
  }
}
