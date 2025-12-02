import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ExamType, Lesson, Subject, CreateTestBookRequest } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-test-book-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div *ngIf="isOpen()" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="close()"></div>

      <!-- Modal -->
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                Yeni Test Kitabı
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
                <!-- Sınav Türü -->
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

                <!-- Ders -->
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

                <!-- Konular -->
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

                <!-- Kitap Adı -->
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

                <!-- Yayın Yılı -->
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

                <!-- Actions -->
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
export class TestBookCreateModalComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form: FormGroup;
  isOpen = signal(false);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  examTypes = signal<ExamType[]>([]);
  lessons = signal<Lesson[]>([]);
  filteredSubjects = signal<Subject[]>([]);
  isLoadingSubjects = signal(false);

  constructor(
    private fb: FormBuilder,
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
    this.isLoading.set(false);
  }

  open(): void {
    this.isOpen.set(true);
    this.errorMessage.set(null);
    this.form.reset({
      published_year: new Date().getFullYear()
    });
    this.clearSubjectSelection();
    this.filteredSubjects.set([]);
  }

  close(): void {
    this.isOpen.set(false);
    this.form.reset({
      published_year: new Date().getFullYear()
    });
    this.errorMessage.set(null);
    this.clearSubjectSelection();
    this.filteredSubjects.set([]);
    this.closed.emit();
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

  loadSubjects(examTypeId: string, lessonId: string): void {
    this.isLoadingSubjects.set(true);
    this.adminService.listSubjects(examTypeId, lessonId).subscribe({
      next: (response) => {
        this.isLoadingSubjects.set(false);
        if (response.success && response.data) {
          this.filteredSubjects.set(response.data);
        } else {
          this.filteredSubjects.set([]);
        }
      },
      error: () => {
        this.isLoadingSubjects.set(false);
        this.filteredSubjects.set([]);
      }
    });
  }

  onExamTypeChange(): void {
    const examTypeId = this.form.get('exam_type_id')?.value;
    const lessonId = this.form.get('lesson_id')?.value;
    this.clearSubjectSelection();
    if (examTypeId && lessonId) {
      this.loadSubjects(examTypeId, lessonId);
    } else {
      this.filteredSubjects.set([]);
    }
  }

  onLessonChange(): void {
    const examTypeId = this.form.get('exam_type_id')?.value;
    const lessonId = this.form.get('lesson_id')?.value;
    this.clearSubjectSelection();
    if (examTypeId && lessonId) {
      this.loadSubjects(examTypeId, lessonId);
    } else {
      this.filteredSubjects.set([]);
    }
  }

  clearSubjectSelection(): void {
    const subjectIdsArray = this.form.get('subject_ids') as FormArray;
    while (subjectIdsArray.length !== 0) {
      subjectIdsArray.removeAt(0);
    }
  }

  isSubjectSelected(subjectId: string): boolean {
    const subjectIdsArray = this.form.get('subject_ids') as FormArray;
    return subjectIdsArray.value.includes(subjectId);
  }

  onSubjectToggle(subjectId: string, event: any): void {
    const subjectIdsArray = this.form.get('subject_ids') as FormArray;
    if (event.target.checked) {
      subjectIdsArray.push(this.fb.control(subjectId));
    } else {
      const index = subjectIdsArray.value.indexOf(subjectId);
      if (index > -1) {
        subjectIdsArray.removeAt(index);
      }
    }
    // Trigger validation
    subjectIdsArray.updateValueAndValidity();
  }

  atLeastOneSubjectValidator(control: AbstractControl): ValidationErrors | null {
    const array = control as FormArray;
    return array.length > 0 ? null : { atLeastOneRequired: true };
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.form.value;
      const request: CreateTestBookRequest = {
        exam_type_id: formValue.exam_type_id,
        lesson_id: formValue.lesson_id,
        subject_ids: formValue.subject_ids,
        name: formValue.name,
        published_year: formValue.published_year
      };

      this.adminService.createTestBook(request).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.success && response.data) {
            this.saved.emit();
            this.close();
          } else {
            this.errorMessage.set(response.message || 'Kayıt başarısız.');
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error.error?.error?.message || 'Kayıt başarısız.');
        }
      });
    }
  }
}

