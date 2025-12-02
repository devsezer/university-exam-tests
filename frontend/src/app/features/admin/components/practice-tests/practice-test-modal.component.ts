import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { TestBook, Subject, CreatePracticeTestRequest, ExamType, Lesson } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { AnswerKeyCounterComponent } from '../../../../shared/components/answer-key-counter/answer-key-counter.component';

@Component({
  selector: 'app-practice-test-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorMessageComponent, AnswerKeyCounterComponent],
  template: `
    <div *ngIf="isOpen()" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="close()"></div>

      <!-- Modal -->
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <!-- Header -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                Yeni Test Ekle
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

            <div *ngIf="isLoading(); else formContent">
              <app-loading-spinner></app-loading-spinner>
            </div>

            <ng-template #formContent>
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Test Kitabı (Readonly) -->
                <div *ngIf="testBook()">
                  <label class="block text-sm font-medium text-gray-700">Test Kitabı</label>
                  <div class="mt-1 px-4 py-3 bg-gray-50 rounded-md border border-gray-300 text-sm text-gray-700">
                    {{ testBook()!.name }}
                  </div>
                </div>

                <!-- Sınav Türü (Readonly) -->
                <div *ngIf="testBook() && examTypeName()">
                  <label class="block text-sm font-medium text-gray-700">Sınav Türü</label>
                  <div class="mt-1 px-4 py-3 bg-gray-50 rounded-md border border-gray-300 text-sm text-gray-700">
                    {{ examTypeName() }}
                  </div>
                </div>

                <!-- Ders (Readonly) -->
                <div *ngIf="testBook() && lessonName()">
                  <label class="block text-sm font-medium text-gray-700">Ders</label>
                  <div class="mt-1 px-4 py-3 bg-gray-50 rounded-md border border-gray-300 text-sm text-gray-700">
                    {{ lessonName() }}
                  </div>
                </div>

                <!-- Konu -->
                <div *ngIf="testBookId">
                  <label for="subject_id" class="block text-sm font-medium text-gray-700">Konu *</label>
                  <select id="subject_id" 
                          formControlName="subject_id"
                          [disabled]="isLoadingSubjects()"
                          class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100">
                    <option [value]="null" disabled>Konu seçiniz</option>
                    @for (subject of filteredSubjects(); track subject.id) {
                      <option [value]="subject.id">
                        {{ subject.name }}
                      </option>
                    }
                  </select>
                  <div *ngIf="isLoadingSubjects()" class="mt-2">
                    <app-loading-spinner></app-loading-spinner>
                  </div>
                  <div *ngIf="form.get('subject_id')?.invalid && form.get('subject_id')?.touched" 
                       class="mt-1 text-sm text-red-600">
                    Konu seçilmelidir
                  </div>
                </div>

                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Ad *</label>
                  <input id="name" 
                         type="text" 
                         formControlName="name"
                         class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                         placeholder="Örn: Deneme 1">
                  <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" 
                       class="mt-1 text-sm text-red-600">
                    Ad gereklidir (1-255 karakter)
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="test_number" class="block text-sm font-medium text-gray-700">Test Numarası *</label>
                    <input id="test_number" 
                           type="number" 
                           formControlName="test_number"
                           min="1"
                           class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                           placeholder="1">
                    <div *ngIf="form.get('test_number')?.invalid && form.get('test_number')?.touched" 
                         class="mt-1 text-sm text-red-600">
                      Test numarası en az 1 olmalıdır
                    </div>
                  </div>

                  <div>
                    <label for="question_count" class="block text-sm font-medium text-gray-700">Soru Sayısı *</label>
                    <input id="question_count" 
                           type="number" 
                           formControlName="question_count"
                           min="1"
                           class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                           placeholder="40">
                    <div *ngIf="form.get('question_count')?.invalid && form.get('question_count')?.touched" 
                         class="mt-1 text-sm text-red-600">
                      Soru sayısı en az 1 olmalıdır
                    </div>
                  </div>
                </div>

                <div>
                  <label for="answer_key" class="block text-sm font-medium text-gray-700">Doğru Cevaplar *</label>
                  <textarea id="answer_key" 
                            formControlName="answer_key"
                            rows="4"
                            class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-mono"
                            placeholder="ABCDABCDABCD... (Her soru için A, B, C, D, E harflerinden biri)"></textarea>
                  <div class="mt-1 text-sm text-gray-500">
                    Her soru için A, B, C, D, E harflerinden biri kullanın. Soru sayısı kadar cevap girmelisiniz.
                  </div>
                  <app-answer-key-counter 
                    [questionCount]="form.get('question_count')?.value || 0"
                    [answerKey]="form.get('answer_key')?.value || ''">
                  </app-answer-key-counter>
                  <div *ngIf="form.get('answer_key')?.invalid && form.get('answer_key')?.touched" 
                       class="mt-1 text-sm text-red-600">
                    Doğru cevaplar gereklidir
                  </div>
                </div>

                <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button type="button" 
                          (click)="close()"
                          class="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    İptal
                  </button>
                  <button type="submit" 
                          [disabled]="isSubmitting() || form.invalid"
                          class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span *ngIf="!isSubmitting()">Kaydet</span>
                    <span *ngIf="isSubmitting()">Kaydediliyor...</span>
                  </button>
                </div>
              </form>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PracticeTestModalComponent implements OnInit {
  @Input() testBookId: string | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form: FormGroup;
  isOpen = signal(false);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  filteredSubjects = signal<Subject[]>([]);
  isLoadingSubjects = signal(false);
  testBook = signal<TestBook | null>(null);
  examTypeName = signal<string>('');
  lessonName = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.form = this.fb.group({
      subject_id: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      test_number: [1, [Validators.required, Validators.min(1)]],
      question_count: [40, [Validators.required, Validators.min(1)]],
      answer_key: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  open(): void {
    this.isOpen.set(true);
    this.errorMessage.set(null);
    if (this.testBookId) {
      this.loadTestBook();
      this.loadTestBookSubjects(this.testBookId);
    } else {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.form.reset({
      test_number: 1,
      question_count: 40
    });
    this.errorMessage.set(null);
    this.closed.emit();
  }

  loadTestBook(): void {
    if (!this.testBookId) return;
    this.adminService.getTestBook(this.testBookId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.testBook.set(response.data);
          this.loadExamTypeAndLesson(response.data.exam_type_id, response.data.lesson_id);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadExamTypeAndLesson(examTypeId: string, lessonId: string): void {
    this.adminService.listExamTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const examType = response.data.find(et => et.id === examTypeId);
          if (examType) {
            this.examTypeName.set(examType.name);
          }
        }
        this.adminService.listLessons().subscribe({
          next: (response) => {
            if (response.success && response.data) {
              const lesson = response.data.find(l => l.id === lessonId);
              if (lesson) {
                this.lessonName.set(lesson.name);
              }
            }
          }
        });
      }
    });
  }

  loadTestBookSubjects(testBookId: string): void {
    this.isLoadingSubjects.set(true);
    this.adminService.getTestBookSubjects(testBookId).subscribe({
      next: (response) => {
        this.isLoadingSubjects.set(false);
        if (response.success && response.data) {
          this.filteredSubjects.set(response.data);
        } else {
          this.errorMessage.set(response.message || 'Konular yüklenemedi.');
          this.filteredSubjects.set([]);
        }
      },
      error: (error) => {
        this.isLoadingSubjects.set(false);
        this.errorMessage.set(error.error?.error?.message || 'Konular yüklenirken bir hata oluştu.');
        this.filteredSubjects.set([]);
      }
    });
  }


  onSubmit(): void {
    if (this.form.valid && this.testBookId) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.form.value;
      const request: CreatePracticeTestRequest = {
        name: formValue.name,
        test_number: formValue.test_number,
        question_count: formValue.question_count,
        answer_key: formValue.answer_key,
        test_book_id: this.testBookId,
        subject_id: formValue.subject_id
      };

      this.adminService.createPracticeTest(request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
          this.close();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error.error?.error?.message || 'Kayıt başarısız.');
        }
      });
    }
  }
}

