import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';

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
    path: 'tests', 
    loadChildren: () => import('./features/tests/tests.routes').then(m => m.testsRoutes),
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
