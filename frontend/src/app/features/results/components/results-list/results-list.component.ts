import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResultsService } from '../../services/results.service';
import { TestResult } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Sonuçlarım</h1>
        <p class="mt-2 text-sm text-gray-600">Çözdüğünüz tüm testlerin sonuçları</p>
      </div>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div *ngIf="isLoading(); else resultsContent">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #resultsContent>
        <div *ngIf="results().length > 0; else noResults">
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              <li *ngFor="let result of results()" class="hover:bg-gray-50">
                <a [routerLink]="['/results', result.id]" class="block px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          Test ID: {{ result.practice_test_id.substring(0, 8) }}...
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ formatDate(result.solved_at) }}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-4">
                      <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">
                          Net: {{ result.net_score.toFixed(2) }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ result.correct_count }}D / {{ result.wrong_count }}Y / {{ result.empty_count }}B
                        </div>
                      </div>
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <ng-template #noResults>
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz sonuç yok</h3>
            <p class="mt-1 text-sm text-gray-500">İlk testinizi çözmeye başlayın.</p>
            <div class="mt-6">
              <a routerLink="/tests" 
                 class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Test Çöz
              </a>
            </div>
          </div>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: []
})
export class ResultsListComponent implements OnInit {
  results = signal<TestResult[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(private resultsService: ResultsService) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.isLoading.set(true);
    this.resultsService.getMyResults().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.results.set(response.data);
        } else {
          this.errorMessage.set('Sonuçlar yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Sonuçlar yüklenirken bir hata oluştu.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}

