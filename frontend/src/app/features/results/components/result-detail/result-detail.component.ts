import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultsService } from '../../services/results.service';
import { TestService } from '../../../tests/services/test.service';
import { TestResult, PracticeTest } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-result-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <button (click)="goBack()" 
                class="text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Geri Dön
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Sonuç Detayı</h1>
      </div>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div *ngIf="isLoading(); else resultContent">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #resultContent>
        <div *ngIf="result(); else errorContent">
          <div class="bg-white shadow rounded-lg p-6 mb-6">
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

          <div class="bg-white shadow rounded-lg p-6">
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
  `,
  styles: []
})
export class ResultDetailComponent implements OnInit {
  result = signal<TestResult | null>(null);
  practiceTest = signal<PracticeTest | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultsService: ResultsService,
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

  goBack(): void {
    this.router.navigate(['/results']);
  }
}

