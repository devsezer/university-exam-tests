import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsService } from '../../../features/results/services/results.service';
import { TestService } from '../../../features/tests/services/test.service';
import { TestResult, PracticeTest } from '../../../models/test.models';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
  selector: 'app-result-modal',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div *ngIf="isOpen()" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="close()"></div>

      <!-- Modal -->
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                Sonuç Detayı
              </h3>
              <button (click)="close()" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pt-5">
            <app-error-message [message]="errorMessage()"></app-error-message>

            <div *ngIf="isLoading(); else resultContent">
              <app-loading-spinner></app-loading-spinner>
            </div>

            <ng-template #resultContent>
              <div *ngIf="result(); else errorContent">
                <div class="bg-gray-50 rounded-lg p-6 mb-6">
                  <div class="mb-4">
                    <p class="text-sm text-gray-500">Çözülme Tarihi</p>
                    <p class="text-lg font-medium text-gray-900">{{ formatDate(result()!.solved_at) }}</p>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p class="text-sm text-gray-500">Doğru</p>
                      <p class="text-2xl font-bold text-green-600">{{ result()!.correct_count }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Yanlış</p>
                      <p class="text-2xl font-bold text-red-600">{{ result()!.wrong_count }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Boş</p>
                      <p class="text-2xl font-bold text-gray-600">{{ result()!.empty_count }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Net</p>
                      <p class="text-2xl font-bold text-primary-600">{{ result()!.net_score.toFixed(2) }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="text-xl font-bold text-gray-900 mb-4">Cevaplar</h2>
                  <div class="grid grid-cols-10 gap-2">
                    <div *ngFor="let answer of getAnswers(); let i = index" 
                         class="text-center p-2 rounded border-2"
                         [class.bg-green-100]="answer.status === 'correct'"
                         [class.border-green-500]="answer.status === 'correct'"
                         [class.bg-red-100]="answer.status === 'wrong'"
                         [class.border-red-500]="answer.status === 'wrong'"
                         [class.bg-gray-100]="answer.status === 'empty'"
                         [class.border-gray-300]="answer.status === 'empty'">
                      <div class="text-xs text-gray-600">{{ i + 1 }}</div>
                      <div class="font-medium" 
                           [class.text-green-700]="answer.status === 'correct'"
                           [class.text-red-700]="answer.status === 'wrong'"
                           [class.text-gray-700]="answer.status === 'empty'">
                        {{ answer.user || '_' }}
                      </div>
                      <div *ngIf="answer.status === 'wrong'" class="text-xs text-gray-500 mt-1">
                        Doğru: {{ answer.correct }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ng-template #errorContent>
                <app-error-message [message]="errorMessage() || 'Sonuç bulunamadı.'"></app-error-message>
              </ng-template>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ResultModalComponent implements OnInit, OnChanges {
  @Input() resultId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  result = signal<TestResult | null>(null);
  practiceTest = signal<PracticeTest | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isOpen = signal(false);

  constructor(
    private resultsService: ResultsService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    // Initial load if resultId is provided
    if (this.resultId) {
      this.open();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resultId'] && !changes['resultId'].firstChange) {
      if (this.resultId) {
        this.open();
      } else {
        this.close();
      }
    }
  }

  open(): void {
    if (!this.resultId) return;
    
    this.isOpen.set(true);
    this.errorMessage.set(null);
    this.loadResult(this.resultId);
  }

  close(): void {
    this.isOpen.set(false);
    this.result.set(null);
    this.practiceTest.set(null);
    this.closed.emit();
  }

  loadResult(id: string): void {
    this.isLoading.set(true);
    this.resultsService.getResult(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.result.set(response.data);
          // Load practice test to get answer key
          this.loadPracticeTest(response.data.practice_test_id);
        } else {
          this.isLoading.set(false);
          this.errorMessage.set('Sonuç bulunamadı.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Sonuç yüklenirken bir hata oluştu.');
      }
    });
  }

  loadPracticeTest(id: string): void {
    this.testService.getPracticeTest(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.practiceTest.set(response.data);
        } else {
          this.errorMessage.set('Test bilgileri yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Test bilgileri yüklenirken bir hata oluştu.');
      }
    });
  }

  getAnswers(): Array<{ user: string; correct: string; status: 'correct' | 'wrong' | 'empty' }> {
    const result = this.result();
    const practiceTest = this.practiceTest();
    
    if (!result || !practiceTest) return [];

    const userAnswers = result.user_answers.split('');
    const correctAnswers = practiceTest.answer_key.split('');

    return userAnswers.map((userAnswer, index) => {
      const correctAnswer = correctAnswers[index] || '';
      
      if (userAnswer === '_' || userAnswer === ' ') {
        return { 
          user: '', 
          correct: correctAnswer,
          status: 'empty' as const 
        };
      }
      
      // Compare user answer with correct answer (case insensitive)
      if (userAnswer.toUpperCase() === correctAnswer.toUpperCase()) {
        return { 
          user: userAnswer, 
          correct: correctAnswer,
          status: 'correct' as const 
        };
      } else {
        return { 
          user: userAnswer, 
          correct: correctAnswer,
          status: 'wrong' as const 
        };
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

