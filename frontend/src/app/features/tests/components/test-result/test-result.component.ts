import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TestService } from '../../services/test.service';
import { TestResult, PracticeTest } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div *ngIf="isLoading(); else resultContent">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #resultContent>
        <div *ngIf="testResult() && practiceTest(); else errorContent">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Test Sonucu</h1>
            <p class="mt-2 text-sm text-gray-600">{{ practiceTest()?.name }}</p>
          </div>

          <app-error-message [message]="errorMessage()"></app-error-message>

          <!-- Result Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Doğru</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ testResult()?.correct_count }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Yanlış</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ testResult()?.wrong_count }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Boş</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ testResult()?.empty_count }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg border-2 border-primary-500">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Net</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ testResult()?.net_score?.toFixed(2) || '0.00' }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Retake Info -->
          <div *ngIf="canRetake !== undefined" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700" *ngIf="canRetake">
                  Bu testi tekrar çözebilirsiniz.
                </p>
                <p class="text-sm text-blue-700" *ngIf="!canRetake && hoursUntilRetake">
                  Bu testi tekrar çözmek için {{ hoursUntilRetake.toFixed(1) }} saat beklemeniz gerekiyor.
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-4">
            <button (click)="goToResults()" 
                    class="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Tüm Sonuçlarım
            </button>
            <button (click)="goToTests()" 
                    class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
              Yeni Test Çöz
            </button>
          </div>
        </div>

        <ng-template #errorContent>
          <app-error-message [message]="errorMessage() || 'Sonuç bulunamadı.'"></app-error-message>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: []
})
export class TestResultComponent implements OnInit {
  testResult = signal<TestResult | null>(null);
  practiceTest = signal<PracticeTest | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  canRetake: boolean | undefined;
  hoursUntilRetake: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    const resultId = this.route.snapshot.paramMap.get('id');
    if (resultId) {
      this.loadResult(resultId);
    } else {
      this.errorMessage.set('Sonuç ID bulunamadı.');
      this.isLoading.set(false);
    }
  }

  loadResult(resultId: string): void {
    // In a real app, you'd have a service method to get result by ID
    // For now, we'll navigate to results list
    this.router.navigate(['/results']);
  }

  goToResults(): void {
    this.router.navigate(['/results']);
  }

  goToTests(): void {
    this.router.navigate(['/tests']);
  }
}

