import { Routes } from '@angular/router';
import { ResultsListComponent } from './components/results-list/results-list.component';
import { ResultDetailComponent } from './components/result-detail/result-detail.component';

export const resultsRoutes: Routes = [
  { path: '', component: ResultsListComponent },
  { path: ':id', component: ResultDetailComponent }
];

