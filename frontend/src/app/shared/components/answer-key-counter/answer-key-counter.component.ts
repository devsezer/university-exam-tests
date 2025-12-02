import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface QuestionStatus {
  number: number;
  answer: string | null;
  hasAnswer: boolean;
}

@Component({
  selector: 'app-answer-key-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="questionCount > 0" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <!-- Status Message -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Doğru Cevap Sayısı</span>
          <span class="text-sm font-semibold"
                [class.text-green-600]="isValidCount()"
                [class.text-red-600]="!isValidCount()">
            {{ validAnswerCount() }} / {{ questionCount }} doğru cevap
          </span>
        </div>
        
        <!-- Warning Messages -->
        <div *ngIf="!isValidCount()" class="mt-2 p-3 rounded-md"
             [class.bg-red-50]="hasTooManyAnswers()"
             [class.border-red-200]="hasTooManyAnswers()"
             [class.bg-yellow-50]="hasTooFewAnswers()"
             [class.border-yellow-200]="hasTooFewAnswers()"
             [class.border]="true">
          <div class="flex items-start gap-2">
            <svg *ngIf="hasTooManyAnswers()" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <svg *ngIf="hasTooFewAnswers()" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div class="flex-1">
              <p *ngIf="hasTooManyAnswers()" class="text-sm font-medium text-red-800">
                Uyarı: {{ questionCount }} soru belirtilmiş ancak {{ validAnswerCount() }} doğru cevap girilmiş. 
                <span class="font-bold">{{ validAnswerCount() - questionCount }} fazla</span> cevap var.
              </p>
              <p *ngIf="hasTooFewAnswers()" class="text-sm font-medium text-yellow-800">
                Uyarı: {{ questionCount }} soru belirtilmiş ancak sadece {{ validAnswerCount() }} doğru cevap girilmiş. 
                <span class="font-bold">{{ questionCount - validAnswerCount() }} eksik</span> cevap var.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Success Message -->
        <div *ngIf="isValidCount() && validAnswerCount() > 0" class="mt-2 p-3 rounded-md bg-green-50 border border-green-200">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm font-medium text-green-800">
              Tüm doğru cevaplar girildi ({{ questionCount }} / {{ questionCount }}).
            </p>
          </div>
        </div>
      </div>

      <!-- Question Indicators Grid -->
      <div class="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2">
        <div *ngFor="let question of questions(); trackBy: trackByNumber"
             class="relative aspect-square flex items-center justify-center rounded-md border-2 transition-all duration-200 cursor-default"
             [class.bg-green-100]="question.hasAnswer"
             [class.border-green-500]="question.hasAnswer"
             [class.bg-gray-100]="!question.hasAnswer"
             [class.border-gray-300]="!question.hasAnswer"
             [class.shadow-sm]="question.hasAnswer">
          <!-- Question Number (always visible) -->
          <span class="text-xs font-medium"
                [class.text-green-700]="question.hasAnswer"
                [class.text-gray-600]="!question.hasAnswer">
            {{ question.number }}
          </span>
          <!-- Answer Letter (only if answered) -->
          <span *ngIf="question.hasAnswer && question.answer"
                class="absolute top-0.5 right-0.5 text-[10px] font-bold text-green-700">
            {{ question.answer }}
          </span>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded bg-green-100 border-2 border-green-500"></div>
          <span>Doğru cevap girildi</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
          <span>Henüz girilmedi</span>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AnswerKeyCounterComponent {
  @Input() set questionCount(value: number) {
    this._questionCount.set(value || 0);
  }
  get questionCount(): number {
    return this._questionCount();
  }

  @Input() set answerKey(value: string) {
    this._answerKey.set(value || '');
  }
  get answerKey(): string {
    return this._answerKey();
  }

  private _questionCount = signal(0);
  private _answerKey = signal('');

  // Count valid answers (A, B, C, D, E only)
  validAnswerCount = computed(() => {
    const key = this._answerKey().trim().toUpperCase();
    let count = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key[i];
      if (['A', 'B', 'C', 'D', 'E'].includes(char)) {
        count++;
      }
    }
    return count;
  });

  // Check if answer count matches question count
  isValidCount = computed(() => {
    return this.validAnswerCount() === this._questionCount();
  });

  // Check if there are too many answers
  hasTooManyAnswers = computed(() => {
    return this.validAnswerCount() > this._questionCount();
  });

  // Check if there are too few answers
  hasTooFewAnswers = computed(() => {
    return this.validAnswerCount() < this._questionCount() && this.validAnswerCount() > 0;
  });

  // Parse answer key and create question status array
  questions = computed<QuestionStatus[]>(() => {
    const count = this._questionCount();
    const key = this._answerKey().trim().toUpperCase();
    const questions: QuestionStatus[] = [];

    for (let i = 0; i < count; i++) {
      const char = key[i];
      const isValidAnswer = char && ['A', 'B', 'C', 'D', 'E'].includes(char);

      questions.push({
        number: i + 1,
        answer: isValidAnswer ? char : null,
        hasAnswer: isValidAnswer || false
      });
    }

    return questions;
  });

  trackByNumber(index: number, question: QuestionStatus): number {
    return question.number;
  }
}

