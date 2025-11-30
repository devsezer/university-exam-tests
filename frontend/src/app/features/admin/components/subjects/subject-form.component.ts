import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Subject, ExamType, CreateSubjectRequest, UpdateSubjectRequest } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-subject-form',
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
          {{ isEditMode() ? 'Ders Konusu Düzenle' : 'Yeni Ders Konusu' }}
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
                      [disabled]="isEditMode()"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100">
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
              <label for="name" class="block text-sm font-medium text-gray-700">Ad *</label>
              <input id="name" 
                     type="text" 
                     formControlName="name"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                     placeholder="Örn: Matematik, Türkçe">
              <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Ad gereklidir (1-100 karakter)
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
export class SubjectFormComponent implements OnInit {
  form: FormGroup;
  isLoading = signal(true);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  errorMessage = signal<string | null>(null);
  examTypes = signal<ExamType[]>([]);
  subjectId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {
    this.form = this.fb.group({
      exam_type_id: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.loadExamTypes();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.subjectId = id;
      this.loadSubject(id);
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

  loadSubject(id: string): void {
    this.isLoading.set(true);
    this.adminService.getSubject(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.form.patchValue({
            exam_type_id: response.data.exam_type_id,
            name: response.data.name
          });
        } else {
          this.errorMessage.set('Ders konusu yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Ders konusu yüklenirken bir hata oluştu.');
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.form.value;
      
      if (this.isEditMode() && this.subjectId) {
        const request: UpdateSubjectRequest = {
          name: formValue.name,
          exam_type_id: formValue.exam_type_id
        };
        this.adminService.updateSubject(this.subjectId, request).subscribe({
          next: () => {
            this.router.navigate(['/admin/subjects']);
          },
          error: (error) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(error.error?.error?.message || 'Güncelleme başarısız.');
          }
        });
      } else {
        const request: CreateSubjectRequest = {
          name: formValue.name,
          exam_type_id: formValue.exam_type_id
        };
        this.adminService.createSubject(request).subscribe({
          next: () => {
            this.router.navigate(['/admin/subjects']);
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
    this.router.navigate(['/admin/subjects']);
  }
}

