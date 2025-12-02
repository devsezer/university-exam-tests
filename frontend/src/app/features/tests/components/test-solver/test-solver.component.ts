import { Component, OnInit, signal, computed, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestService } from '../../services/test.service';
import { PracticeTest, SolveTestRequest } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-test-solver',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div *ngIf="isLoading(); else testContent">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #testContent>
        <div *ngIf="practiceTest(); else errorContent">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">{{ practiceTest()?.name }}</h1>
            <p class="mt-2 text-sm text-gray-600">{{ practiceTest()?.question_count }} soru</p>
          </div>

          <app-error-message [message]="errorMessage()"></app-error-message>

          <!-- Progress Bar -->
          <div class="mb-6 bg-gray-200 rounded-full h-2.5">
            <div class="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                 [style.width.%]="progressPercentage()"></div>
          </div>
          <p class="text-sm text-gray-600 mb-6">
            {{ answeredCount() }} / {{ practiceTest()?.question_count }} soru cevaplandı
          </p>

          <!-- Questions -->
          <div class="bg-white shadow rounded-lg p-6 space-y-6">
            <div *ngFor="let question of questions(); let i = index" 
                 class="border-b border-gray-200 pb-6 last:border-b-0">
              <div class="flex items-start">
                <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-800 font-medium text-sm mr-4">
                  {{ i + 1 }}
                </span>
                <div class="flex-1">
                  <p class="text-lg font-medium text-gray-900 mb-4">Soru {{ i + 1 }}</p>
                  <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <label *ngFor="let option of ['A', 'B', 'C', 'D', 'E']" 
                           class="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
                           [class.border-primary-500]="answers()[i] === option"
                           [class.bg-primary-50]="answers()[i] === option"
                           [class.border-gray-300]="answers()[i] !== option">
                      <input type="radio" 
                             [name]="'question-' + i" 
                             [value]="option"
                             [(ngModel)]="answers()[i]"
                             (change)="updateAnswer(i, option)"
                             class="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500">
                      <span class="text-sm font-medium">{{ option }}</span>
                    </label>
                  </div>
                  <button (click)="clearAnswer(i)" 
                          class="mt-2 text-sm text-gray-500 hover:text-gray-700">
                    Cevabı Temizle
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="mt-6 flex justify-end space-x-4">
            <button (click)="goBack()" 
                    class="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              İptal
            </button>
            <button (click)="submitTest()" 
                    [disabled]="isSubmitting()"
                    class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
              <span *ngIf="!isSubmitting()">Testi Bitir</span>
              <span *ngIf="isSubmitting()">Gönderiliyor...</span>
            </button>
          </div>
        </div>

        <ng-template #errorContent>
          <app-error-message [message]="errorMessage() || 'Test yüklenemedi.'"></app-error-message>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: []
})
export class TestSolverComponent implements OnInit {
  practiceTest = signal<PracticeTest | null>(null);
  answers = signal<string[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  private destroyRef = inject(DestroyRef);

  answeredCount = computed(() => {
    return this.answers().filter(a => a && a.trim() !== '').length;
  });

  progressPercentage = computed(() => {
    const total = this.practiceTest()?.question_count || 0;
    if (total === 0) return 0;
    return (this.answeredCount() / total) * 100;
  });

  questions = computed(() => {
    const count = this.practiceTest()?.question_count || 0;
    return Array.from({ length: count }, (_, i) => i);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    const testId = this.route.snapshot.paramMap.get('id');
    if (testId) {
      this.loadTest(testId);
    } else {
      this.errorMessage.set('Test ID bulunamadı.');
      this.isLoading.set(false);
    }
  }

  loadTest(testId: string): void {
    this.isLoading.set(true);
    this.testService.getPracticeTest(testId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.practiceTest.set(response.data);
          // Initialize answers array with empty strings
          const questionCount = response.data.question_count;
          this.answers.set(Array(questionCount).fill(''));
        } else {
          this.errorMessage.set('Test bulunamadı.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Test yüklenirken bir hata oluştu.');
      }
    });
  }

  updateAnswer(index: number, value: string): void {
    const newAnswers = [...this.answers()];
    newAnswers[index] = value;
    this.answers.set(newAnswers);
  }

  clearAnswer(index: number): void {
    const newAnswers = [...this.answers()];
    newAnswers[index] = '';
    this.answers.set(newAnswers);
  }

  submitTest(): void {
    if (!this.practiceTest()) return;

    const userAnswers = this.answers().map(a => a || '_').join('');
    const request: SolveTestRequest = { user_answers: userAnswers };

    this.isSubmitting.set(true);
    this.testService.solveTest(this.practiceTest()!.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success && response.data) {
          this.router.navigate(['/tests/result', response.data.result.id]);
        } else {
          this.errorMessage.set(response.error?.message || 'Test gönderilirken bir hata oluştu.');
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.error?.message || 'Test gönderilirken bir hata oluştu.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tests']);
  }
}

