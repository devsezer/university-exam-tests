import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ExamTypesListComponent } from './components/exam-types/exam-types-list.component';
import { ExamTypeFormComponent } from './components/exam-types/exam-type-form.component';
import { SubjectsListComponent } from './components/subjects/subjects-list.component';
import { SubjectFormComponent } from './components/subjects/subject-form.component';
import { TestBooksListComponent } from './components/test-books/test-books-list.component';
import { TestBookFormComponent } from './components/test-books/test-book-form.component';
import { PracticeTestsListComponent } from './components/practice-tests/practice-tests-list.component';
import { PracticeTestFormComponent } from './components/practice-tests/practice-test-form.component';

export const adminRoutes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'exam-types', component: ExamTypesListComponent },
  { path: 'exam-types/new', component: ExamTypeFormComponent },
  { path: 'exam-types/:id/edit', component: ExamTypeFormComponent },
  { path: 'subjects', component: SubjectsListComponent },
  { path: 'subjects/new', component: SubjectFormComponent },
  { path: 'subjects/:id/edit', component: SubjectFormComponent },
  { path: 'test-books', component: TestBooksListComponent },
  { path: 'test-books/new', component: TestBookFormComponent },
  { path: 'test-books/:id/edit', component: TestBookFormComponent },
  { path: 'practice-tests', component: PracticeTestsListComponent },
  { path: 'practice-tests/new', component: PracticeTestFormComponent },
  { path: 'practice-tests/:id/edit', component: PracticeTestFormComponent },
];

