import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TestResult } from '../../../models/test.models';
import { ApiResponse, PaginatedResponse } from '../../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  constructor(private api: ApiService) {}

  getMyResults(): Observable<ApiResponse<TestResult[]>> {
    return this.api.get<TestResult[]>('/my-results');
  }

  getResult(id: string): Observable<ApiResponse<TestResult>> {
    return this.api.get<TestResult>(`/my-results/${id}`);
  }
}

