import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { User, UpdateUserRequest } from '../../../../models/user.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="max-w-2xl py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div class="mb-6">
        <button (click)="goBack()" 
                class="text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Geri Dön
        </button>
        <h1 class="text-3xl font-bold text-gray-900">
          Kullanıcı Düzenle
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
              <label for="username" class="block text-sm font-medium text-gray-700">Kullanıcı Adı *</label>
              <input id="username" 
                     type="text" 
                     formControlName="username"
                     class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                     placeholder="Kullanıcı adı">
              <div *ngIf="form.get('username')?.invalid && form.get('username')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Kullanıcı adı gereklidir (3-50 karakter)
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
              <input id="email" 
                     type="email" 
                     formControlName="email"
                     class="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                     placeholder="email@example.com">
              <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Geçerli bir email adresi giriniz
              </div>
            </div>

            <div>
              <label class="flex items-center">
                <input type="checkbox" 
                       formControlName="is_active"
                       class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                <span class="ml-2 text-sm text-gray-700">Hesap Aktif</span>
              </label>
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
                <span *ngIf="!isSubmitting()">Güncelle</span>
                <span *ngIf="isSubmitting()">Güncelleniyor...</span>
              </button>
            </div>
          </form>
        </div>
      </ng-template>
    </div>
  `,
  styles: []
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = id;
      this.loadUser(id);
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('Kullanıcı ID bulunamadı.');
    }
  }

  loadUser(id: string): void {
    this.isLoading.set(true);
    this.adminService.getUser(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.form.patchValue({
            username: response.data.username,
            email: response.data.email,
            is_active: response.data.is_active
          });
        } else {
          this.errorMessage.set('Kullanıcı yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Kullanıcı yüklenirken bir hata oluştu.');
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid && this.userId) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.form.value;
      const request: UpdateUserRequest = {
        username: formValue.username,
        email: formValue.email,
        is_active: formValue.is_active
      };

      this.adminService.updateUser(this.userId, request).subscribe({
        next: () => {
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error.error?.error?.message || 'Güncelleme başarısız.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}

