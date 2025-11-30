import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../models/auth.models';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ErrorMessageComponent, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Yeni hesap oluşturun
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <app-error-message [message]="errorMessage()"></app-error-message>
          
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
              <input id="username" name="username" type="text" required
                     formControlName="username"
                     class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                     placeholder="Kullanıcı adı">
              <div *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" 
                   class="text-red-600 text-sm mt-1">
                Kullanıcı adı 3-50 karakter arasında olmalıdır
              </div>
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">E-posta</label>
              <input id="email" name="email" type="email" autocomplete="email" required
                     formControlName="email"
                     class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                     placeholder="E-posta adresi">
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                   class="text-red-600 text-sm mt-1">
                Geçerli bir e-posta adresi giriniz
              </div>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Şifre</label>
              <input id="password" name="password" type="password" autocomplete="new-password" required
                     formControlName="password"
                     class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                     placeholder="Şifre (en az 8 karakter)">
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                   class="text-red-600 text-sm mt-1">
                Şifre en az 8 karakter olmalıdır
              </div>
            </div>
          </div>

          <div>
            <button type="submit" 
                    [disabled]="isLoading() || registerForm.invalid"
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!isLoading()">Kayıt Ol</span>
              <app-loading-spinner *ngIf="isLoading()"></app-loading-spinner>
            </button>
          </div>

          <div class="text-center">
            <span class="text-sm text-gray-600">Zaten hesabınız var mı? </span>
            <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
              Giriş yapın
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const data: RegisterRequest = this.registerForm.value;
      this.authService.register(data).subscribe({
        next: (response) => {
          if (response.success) {
            // Login will be handled automatically by the service
            this.router.navigate(['/dashboard']);
          } else {
            this.isLoading.set(false);
            this.errorMessage.set('Kayıt başarısız. Lütfen tekrar deneyin.');
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.error?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        }
      });
    }
  }
}

