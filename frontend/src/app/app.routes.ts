import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { BookDetailComponent } from './features/dashboard/components/book-detail/book-detail.component';
import { TestSolverComponent } from './features/tests/components/test-solver/test-solver.component';
import { TestResultComponent } from './features/tests/components/test-result/test-result.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  {
    path: 'dashboard/books/:id',
    component: BookDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'tests/solve/:id',
    component: TestSolverComponent,
    canActivate: [authGuard]
  },
  {
    path: 'tests/result/:id',
    component: TestResultComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'results', 
    loadChildren: () => import('./features/results/results.routes').then(m => m.resultsRoutes),
    canActivate: [authGuard]
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
