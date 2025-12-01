import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { TestResult } from '../../../models/test.models';
import { ApiResponse, PaginatedResponse } from '../../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  constructor(private api: ApiService) {}

  getMyResults(): Observable<ApiResponse<TestResult[]>> {
    return this.api.get<PaginatedResponse<TestResult>>('/my-results').pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            ...response,
            data: response.data.items
          };
        }
        return response as any;
      })
    );
  }

  getResult(id: string): Observable<ApiResponse<TestResult>> {
    return this.api.get<TestResult>(`/my-results/${id}`);
  }
}

