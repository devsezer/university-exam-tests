import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ExamTypesListComponent } from './components/exam-types/exam-types-list.component';
import { ExamTypeFormComponent } from './components/exam-types/exam-type-form.component';
import { LessonsListComponent } from './components/lessons/lessons-list.component';
import { LessonFormComponent } from './components/lessons/lesson-form.component';
import { SubjectsListComponent } from './components/subjects/subjects-list.component';
import { SubjectFormComponent } from './components/subjects/subject-form.component';
import { TestBookDetailComponent } from './components/test-books/test-book-detail.component';
import { UsersListComponent } from './components/users/users-list.component';
import { UserFormComponent } from './components/users/user-form.component';
import { UserDetailComponent } from './components/users/user-detail.component';
import { RolesListComponent } from './components/roles/roles-list.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'exam-types', component: ExamTypesListComponent },
      { path: 'exam-types/new', component: ExamTypeFormComponent },
      { path: 'exam-types/:id/edit', component: ExamTypeFormComponent },
      { path: 'lessons', component: LessonsListComponent },
      { path: 'lessons/new', component: LessonFormComponent },
      { path: 'lessons/:id/edit', component: LessonFormComponent },
      { path: 'subjects', component: SubjectsListComponent },
      { path: 'subjects/new', component: SubjectFormComponent },
      { path: 'subjects/:id/edit', component: SubjectFormComponent },
      { path: 'test-books/:id', component: TestBookDetailComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'users/:id', component: UserDetailComponent },
      { path: 'users/:id/edit', component: UserFormComponent },
      { path: 'roles', component: RolesListComponent },
    ]
  }
];
