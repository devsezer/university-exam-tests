import { Routes } from '@angular/router';
import { TestSelectorComponent } from './components/test-selector/test-selector.component';
import { TestSolverComponent } from './components/test-solver/test-solver.component';
import { TestResultComponent } from './components/test-result/test-result.component';

export const testsRoutes: Routes = [
  { path: '', component: TestSelectorComponent },
  { path: 'solve/:id', component: TestSolverComponent },
  { path: 'result/:id', component: TestResultComponent }
];

