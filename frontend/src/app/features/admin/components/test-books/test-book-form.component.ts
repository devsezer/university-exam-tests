import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { TestBook, ExamType, Subject, CreateTestBookRequest, UpdateTestBookRequest } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-test-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <button (click)="goBack()" 
                class="text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Geri Dön
        </button>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode() ? 'Test Kitabı Düzenle' : 'Yeni Test Kitabı' }}
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
              <label for="exam_type_id" class="block text-sm font-medium text-gray-700">Sınav Türü *</label>
              <select id="exam_type_id" 
                      formControlName="exam_type_id"
                      (change)="onExamTypeChange()"
                      class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                <option [value]="null">Sınav türü seçiniz</option>
                <option *ngFor="let examType of examTypes()" [value]="examType.id">
                  {{ examType.name }}
                </option>
              </select>
              <div *ngIf="form.get('exam_type_id')?.invalid && form.get('exam_type_id')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Sınav türü seçilmelidir
              </div>
            </div>

            <div>
              <label for="subject_id" class="block text-sm font-medium text-gray-700">Ders Konusu *</label>
              <select id="subject_id" 
                      formControlName="subject_id"
                      [disabled]="!form.get('exam_type_id')?.value || isLoadingSubjects()"
                      class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100">
                <option [value]="null">Ders konusu seçiniz</option>
                <option *ngFor="let subject of filteredSubjects()" [value]="subject.id">
                  {{ subject.name }}
                </option>
              </select>
              <div *ngIf="form.get('subject_id')?.invalid && form.get('subject_id')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Ders konusu seçilmelidir
              </div>
              <app-loading-spinner *ngIf="isLoadingSubjects()"></app-loading-spinner>
            </div>

            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Ad *</label>
              <input id="name" 
                     type="text" 
                     formControlName="name"
                     class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                     placeholder="Örn: Limit Yayınları TYT Matematik">
              <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Ad gereklidir (1-255 karakter)
              </div>
            </div>

            <div>
              <label for="published_year" class="block text-sm font-medium text-gray-700">Yayın Yılı *</label>
              <input id="published_year" 
                     type="number" 
                     formControlName="published_year"
                     min="2000"
                     max="2100"
                     class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                     placeholder="2024">
              <div *ngIf="form.get('published_year')?.invalid && form.get('published_year')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Yayın yılı 2000-2100 arasında olmalıdır
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
export class TestBookFormComponent implements OnInit {
  form: FormGroup;
  isLoading = signal(true);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  errorMessage = signal<string | null>(null);
  examTypes = signal<ExamType[]>([]);
  subjects = signal<Subject[]>([]);
  isLoadingSubjects = signal(false);
  testBookId: string | null = null;

  filteredSubjects = signal<Subject[]>([]);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {
    this.form = this.fb.group({
      exam_type_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      published_year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]]
    });

    // Watch for exam_type_id changes
    this.form.get('exam_type_id')?.valueChanges.subscribe(examTypeId => {
      if (examTypeId) {
        this.loadSubjectsForExamType(examTypeId);
      } else {
        this.filteredSubjects.set([]);
        this.form.patchValue({ subject_id: null }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.loadExamTypes();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.testBookId = id;
      this.loadTestBook(id);
    } else {
      this.isLoading.set(false);
    }
  }

  loadExamTypes(): void {
    this.adminService.listExamTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.examTypes.set(response.data);
        }
      },
      error: () => {
        this.errorMessage.set('Sınav türleri yüklenemedi.');
      }
    });
  }

  loadSubjectsForExamType(examTypeId: string): void {
    this.isLoadingSubjects.set(true);
    this.adminService.listSubjects(examTypeId).subscribe({
      next: (response) => {
        this.isLoadingSubjects.set(false);
        if (response.success && response.data) {
          this.filteredSubjects.set(response.data);
        }
      },
      error: () => {
        this.isLoadingSubjects.set(false);
        this.errorMessage.set('Ders konuları yüklenemedi.');
      }
    });
  }

  onExamTypeChange(): void {
    const examTypeId = this.form.get('exam_type_id')?.value;
    if (examTypeId) {
      this.loadSubjectsForExamType(examTypeId);
    } else {
      this.filteredSubjects.set([]);
      this.form.patchValue({ subject_id: null });
    }
  }

  loadTestBook(id: string): void {
    this.isLoading.set(true);
    this.adminService.getTestBook(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          const testBook = response.data;
          this.form.patchValue({
            exam_type_id: testBook.exam_type_id,
            subject_id: testBook.subject_id,
            name: testBook.name,
            published_year: testBook.published_year
          });
          // Load subjects for the selected exam type
          this.loadSubjectsForExamType(testBook.exam_type_id);
        } else {
          this.errorMessage.set('Test kitabı yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Test kitabı yüklenirken bir hata oluştu.');
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.form.value;
      
      if (this.isEditMode() && this.testBookId) {
        const request: UpdateTestBookRequest = {
          name: formValue.name,
          exam_type_id: formValue.exam_type_id,
          subject_id: formValue.subject_id,
          published_year: formValue.published_year
        };
        this.adminService.updateTestBook(this.testBookId, request).subscribe({
          next: () => {
            this.router.navigate(['/admin/test-books']);
          },
          error: (error) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(error.error?.error?.message || 'Güncelleme başarısız.');
          }
        });
      } else {
        const request: CreateTestBookRequest = {
          name: formValue.name,
          exam_type_id: formValue.exam_type_id,
          subject_id: formValue.subject_id,
          published_year: formValue.published_year
        };
        this.adminService.createTestBook(request).subscribe({
          next: () => {
            this.router.navigate(['/admin/test-books']);
          },
          error: (error) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(error.error?.error?.message || 'Kayıt başarısız.');
          }
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/test-books']);
  }
}

