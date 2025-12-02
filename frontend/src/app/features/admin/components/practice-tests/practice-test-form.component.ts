import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { PracticeTest, TestBook, Subject, CreatePracticeTestRequest, UpdatePracticeTestRequest } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { AnswerKeyCounterComponent } from '../../../../shared/components/answer-key-counter/answer-key-counter.component';

@Component({
  selector: 'app-practice-test-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent, AnswerKeyCounterComponent],
  template: `
    <div class="max-w-2xl py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div class="mb-6">
        <button (click)="goBack()" 
                class="text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Geri Dön
        </button>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode() ? 'Deneme Testi Düzenle' : 'Yeni Deneme Testi' }}
        </h1>
      </div>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div *ngIf="isLoading(); else formContent">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #formContent>
        <div class="bg-white shadow rounded-lg p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="test_book_id" class="block text-sm font-medium text-gray-700">Test Kitabı *</label>
              <select id="test_book_id" 
                      formControlName="test_book_id"
                      (change)="onTestBookChange()"
                      class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                <option [value]="null" disabled>Test kitabı seçiniz</option>
                @for (testBook of testBooks(); track testBook.id) {
                  <option [value]="testBook.id">
                    {{ testBook.name }} ({{ testBook.published_year }})
                  </option>
                }
              </select>
              <div *ngIf="form.get('test_book_id')?.invalid && form.get('test_book_id')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Test kitabı seçilmelidir
              </div>
            </div>

            <div *ngIf="form.get('test_book_id')?.value">
              <label for="subject_id" class="block text-sm font-medium text-gray-700">Konu *</label>
              <select id="subject_id" 
                      formControlName="subject_id"
                      [disabled]="!form.get('test_book_id')?.value || isLoadingSubjects()"
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
              <div class="mt-1 text-sm text-gray-500">
                Test adı ve numarası kombinasyonu, seçilen test kitabı ve konu için benzersiz olmalıdır.
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
                Her soru için A, B, C, D, E harflerinden biri kullanın. Soru sayısı kadar cevap girmelisiniz. Örnek: 20 soru için ABCDABCDABCDABCDABCD
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

            <div class="flex justify-end space-x-4">
              <button type="button" 
                      (click)="goBack()"
                      class="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                İptal
              </button>
              <button type="submit" 
                      [disabled]="isSubmitting() || form.invalid"
                      class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isSubmitting()">{{ isEditMode() ? 'Güncelle' : 'Kaydet' }}</span>
                <span *ngIf="isSubmitting()">Kaydediliyor...</span>
              </button>
            </div>
          </form>
        </div>
      </ng-template>
    </div>
  `,
  styles: []
})
export class PracticeTestFormComponent implements OnInit {
  form: FormGroup;
  isLoading = signal(true);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  errorMessage = signal<string | null>(null);
  readonly testBooks = signal<TestBook[]>([]);
  readonly filteredSubjects = signal<Subject[]>([]);
  isLoadingSubjects = signal(false);
  practiceTestId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {
    this.form = this.fb.group({
      test_book_id: [null, [Validators.required]],
      subject_id: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      test_number: [1, [Validators.required, Validators.min(1)]],
      question_count: [40, [Validators.required, Validators.min(1)]],
      answer_key: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.practiceTestId = id;
      // Load test books first, then load practice test
      this.loadTestBooks(() => {
        this.loadPracticeTest(id);
      });
    } else {
      // Just load test books for new practice test
      this.loadTestBooks();
    }
  }

  loadTestBooks(callback?: () => void): void {
    this.adminService.listTestBooks().subscribe({
      next: (response) => {
        if (response && response.success !== undefined) {
          if (response.success) {
            // Ensure data is an array, even if empty
            const books = Array.isArray(response.data) ? response.data : [];
            this.testBooks.set(books);
          } else {
            this.testBooks.set([]);
            this.errorMessage.set(response.message || 'Test kitapları yüklenemedi.');
          }
        } else {
          this.testBooks.set([]);
          this.errorMessage.set('Geçersiz response formatı.');
        }
        
        // Set loading to false after test books are loaded (if not in edit mode)
        if (!this.isEditMode()) {
          this.isLoading.set(false);
        }
        // Execute callback if provided
        if (callback) {
          callback();
        }
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error?.message || error.message || 'Test kitapları yüklenemedi.');
        this.testBooks.set([]);
        // Set loading to false even on error (unless we're loading practice test)
        if (!this.isEditMode()) {
          this.isLoading.set(false);
        }
        // Execute callback even on error
        if (callback) {
          callback();
        }
      }
    });
  }

  loadPracticeTest(id: string): void {
    this.isLoading.set(true);
    this.adminService.getPracticeTest(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          const practiceTest = response.data;
          this.form.patchValue({
            test_book_id: practiceTest.test_book_id,
            subject_id: practiceTest.subject_id,
            name: practiceTest.name,
            test_number: practiceTest.test_number,
            question_count: practiceTest.question_count,
            answer_key: practiceTest.answer_key
          });
          // Load subjects for the selected test book
          if (practiceTest.test_book_id) {
            this.loadTestBookSubjects(practiceTest.test_book_id);
          }
        } else {
          this.errorMessage.set(response.message || 'Deneme testi yüklenemedi.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.error?.message || 'Deneme testi yüklenirken bir hata oluştu.');
      }
    });
  }

  onTestBookChange(): void {
    const testBookId = this.form.get('test_book_id')?.value;
    // Reset subject selection
    this.form.patchValue({ subject_id: null });
    this.filteredSubjects.set([]);
    
    if (testBookId) {
      this.loadTestBookSubjects(testBookId);
    }
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
    if (this.form.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.form.value;
      
      if (this.isEditMode() && this.practiceTestId) {
        const request: UpdatePracticeTestRequest = {
          name: formValue.name,
          test_number: formValue.test_number,
          question_count: formValue.question_count,
          answer_key: formValue.answer_key,
          test_book_id: formValue.test_book_id,
          subject_id: formValue.subject_id
        };
        this.adminService.updatePracticeTest(this.practiceTestId, request).subscribe({
          next: () => {
            this.router.navigate(['/admin/practice-tests']);
          },
          error: (error) => {
            this.isSubmitting.set(false);
            const errorMsg = error.error?.error?.message || error.error?.message || 'Güncelleme başarısız.';
            this.errorMessage.set(errorMsg);
          }
        });
      } else {
        const request: CreatePracticeTestRequest = {
          name: formValue.name,
          test_number: formValue.test_number,
          question_count: formValue.question_count,
          answer_key: formValue.answer_key,
          test_book_id: formValue.test_book_id,
          subject_id: formValue.subject_id
        };
        this.adminService.createPracticeTest(request).subscribe({
          next: () => {
            this.router.navigate(['/admin/practice-tests']);
          },
          error: (error) => {
            this.isSubmitting.set(false);
            const errorMsg = error.error?.error?.message || error.error?.message || 'Kayıt başarısız.';
            this.errorMessage.set(errorMsg);
          }
        });
      }
    }
  }

  trackByTestBookId(index: number, testBook: TestBook): string {
    return testBook.id;
  }

  goBack(): void {
    this.router.navigate(['/admin/practice-tests']);
  }
}

