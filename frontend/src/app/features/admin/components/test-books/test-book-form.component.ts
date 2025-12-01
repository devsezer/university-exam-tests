import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { TestBook, ExamType, Lesson, Subject, CreateTestBookRequest, UpdateTestBookRequest } from '../../../../models/test.models';
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
              <label for="lesson_id" class="block text-sm font-medium text-gray-700">Ders *</label>
              <select id="lesson_id"
                      formControlName="lesson_id"
                      (change)="onLessonChange()"
                      [disabled]="!form.get('exam_type_id')?.value"
                      class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100">
                <option [value]="null">Ders seçiniz</option>
                <option *ngFor="let lesson of lessons()" [value]="lesson.id">
                  {{ lesson.name }}
                </option>
              </select>
              <div *ngIf="form.get('lesson_id')?.invalid && form.get('lesson_id')?.touched"
                   class="mt-1 text-sm text-red-600">
                Ders seçilmelidir
              </div>
            </div>

            <div *ngIf="form.get('lesson_id')?.value && form.get('exam_type_id')?.value">
              <label class="block text-sm font-medium text-gray-700 mb-2">Konular *</label>
              <div *ngIf="isLoadingSubjects()" class="mb-2">
                <app-loading-spinner></app-loading-spinner>
              </div>
              <div *ngIf="!isLoadingSubjects()" class="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                <div *ngFor="let subject of filteredSubjects(); let i = index" class="flex items-center">
                  <input type="checkbox"
                         [id]="'subject-' + subject.id"
                         [checked]="isSubjectSelected(subject.id)"
                         (change)="onSubjectToggle(subject.id, $event)"
                         class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                  <label [for]="'subject-' + subject.id"
                         class="ml-2 text-sm text-gray-700 cursor-pointer">
                    {{ subject.name }}
                  </label>
                </div>
                <div *ngIf="filteredSubjects().length === 0" class="text-sm text-gray-500 py-2">
                  Bu ders ve sınav türü için konu bulunamadı.
                </div>
              </div>
              <div *ngIf="form.get('subject_ids')?.invalid && form.get('subject_ids')?.touched"
                   class="mt-1 text-sm text-red-600">
                En az bir konu seçilmelidir
              </div>
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
  lessons = signal<Lesson[]>([]);
  filteredSubjects = signal<Subject[]>([]);
  isLoadingSubjects = signal(false);
  testBookId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {
    this.form = this.fb.group({
      exam_type_id: ['', [Validators.required]],
      lesson_id: ['', [Validators.required]],
      subject_ids: this.fb.array([], [this.atLeastOneSubjectValidator]),
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      published_year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]]
    });
  }

  ngOnInit(): void {
    this.loadExamTypes();
    this.loadLessons();
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

  loadLessons(): void {
    this.adminService.listLessons().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lessons.set(response.data);
        }
      },
      error: () => {
        this.errorMessage.set('Dersler yüklenemedi.');
      }
    });
  }

  loadSubjectsForLessonAndExamType(lessonId: string, examTypeId: string, callback?: () => void): void {
    this.isLoadingSubjects.set(true);
    this.adminService.listSubjects(examTypeId, lessonId).subscribe({
      next: (response) => {
        this.isLoadingSubjects.set(false);
        if (response.success && response.data) {
          this.filteredSubjects.set(response.data);
          if (callback) {
            callback();
          }
        }
      },
      error: () => {
        this.isLoadingSubjects.set(false);
        this.errorMessage.set('Konular yüklenemedi.');
        if (callback) {
          callback();
        }
      }
    });
  }

  onExamTypeChange(): void {
    const examTypeId = this.form.get('exam_type_id')?.value;
    const lessonId = this.form.get('lesson_id')?.value;

    // Reset subjects
    this.clearSubjectIds();
    this.filteredSubjects.set([]);

    if (examTypeId && lessonId) {
      this.loadSubjectsForLessonAndExamType(lessonId, examTypeId);
    }
  }

  onLessonChange(): void {
    const examTypeId = this.form.get('exam_type_id')?.value;
    const lessonId = this.form.get('lesson_id')?.value;

    // Reset subjects
    this.clearSubjectIds();
    this.filteredSubjects.set([]);

    if (examTypeId && lessonId) {
      this.loadSubjectsForLessonAndExamType(lessonId, examTypeId);
    }
  }

  get subjectIdsFormArray(): FormArray {
    return this.form.get('subject_ids') as FormArray;
  }

  isSubjectSelected(subjectId: string): boolean {
    const subjectIds = this.subjectIdsFormArray.value as string[];
    return subjectIds.includes(subjectId);
  }

  onSubjectToggle(subjectId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const subjectIdsArray = this.subjectIdsFormArray;

    if (checked) {
      subjectIdsArray.push(this.fb.control(subjectId));
    } else {
      const index = subjectIdsArray.value.findIndex((id: string) => id === subjectId);
      if (index !== -1) {
        subjectIdsArray.removeAt(index);
      }
    }
    // Mark as touched to show validation
    subjectIdsArray.markAsTouched();
  }

  clearSubjectIds(): void {
    const subjectIdsArray = this.subjectIdsFormArray;
    while (subjectIdsArray.length !== 0) {
      subjectIdsArray.removeAt(0);
    }
  }

  atLeastOneSubjectValidator(control: AbstractControl): ValidationErrors | null {
    const formArray = control as FormArray;
    return formArray.value && formArray.value.length > 0 ? null : { atLeastOneRequired: true };
  }

  loadTestBook(id: string): void {
    this.isLoading.set(true);
    this.adminService.getTestBook(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const testBook = response.data;
          this.form.patchValue({
            exam_type_id: testBook.exam_type_id,
            lesson_id: testBook.lesson_id,
            name: testBook.name,
            published_year: testBook.published_year
          });
          // Load subjects for the selected lesson and exam type
          if (testBook.lesson_id && testBook.exam_type_id) {
            this.loadSubjectsForLessonAndExamType(testBook.lesson_id, testBook.exam_type_id, () => {
              // Set selected subject IDs after subjects are loaded
              if (testBook.subject_ids && testBook.subject_ids.length > 0) {
                this.clearSubjectIds();
                testBook.subject_ids.forEach((subjectId: string) => {
                  this.subjectIdsFormArray.push(this.fb.control(subjectId));
                });
              }
              // Hide loading spinner after subjects are loaded
              this.isLoading.set(false);
            });
          } else {
            this.isLoading.set(false);
          }
        } else {
          this.isLoading.set(false);
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
          lesson_id: formValue.lesson_id,
          subject_ids: formValue.subject_ids || [],
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
          lesson_id: formValue.lesson_id,
          subject_ids: formValue.subject_ids || [],
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
