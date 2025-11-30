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
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <div class="max-w-md w-full space-y-8 animate-scale-in">
        <div class="bg-white rounded-2xl p-8 shadow-2xl">
          <div class="mb-8">
            <h2 class="text-center text-4xl font-extrabold text-gray-900 mb-2">
              Yeni hesap oluşturun
            </h2>
            <p class="text-center text-sm text-gray-600">Hemen başlayın ve testlerinizi çözün!</p>
          </div>
          <form class="space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <app-error-message [message]="errorMessage()"></app-error-message>
            
            <div class="space-y-4">
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
                <input id="username" name="username" type="text" required
                       formControlName="username"
                       class="input-focus appearance-none relative block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 sm:text-sm"
                       placeholder="Kullanıcı adınız">
                <div *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" 
                     class="text-danger-600 text-sm mt-2 animate-slide-down flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Kullanıcı adı 3-50 karakter arasında olmalıdır
                </div>
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                <input id="email" name="email" type="email" autocomplete="email" required
                       formControlName="email"
                       class="input-focus appearance-none relative block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 sm:text-sm"
                       placeholder="E-posta adresiniz">
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                     class="text-danger-600 text-sm mt-2 animate-slide-down flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Geçerli bir e-posta adresi giriniz
                </div>
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                <input id="password" name="password" type="password" autocomplete="new-password" required
                       formControlName="password"
                       class="input-focus appearance-none relative block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 sm:text-sm"
                       placeholder="Şifre (en az 8 karakter)">
                <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                     class="text-danger-600 text-sm mt-2 animate-slide-down flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Şifre en az 8 karakter olmalıdır
                </div>
              </div>
            </div>

            <div>
              <button type="submit" 
                      [disabled]="isLoading() || registerForm.invalid"
                      class="ripple btn-gradient w-full flex justify-center py-3 px-4 text-base font-semibold rounded-xl text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none">
                <span *ngIf="!isLoading()" class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  Kayıt Ol
                </span>
                <app-loading-spinner *ngIf="isLoading()"></app-loading-spinner>
              </button>
            </div>

            <div class="text-center pt-4">
              <span class="text-sm text-gray-600">Zaten hesabınız var mı? </span>
              <a routerLink="/auth/login" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200">
                Giriş yapın
              </a>
            </div>
          </form>
        </div>
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
            // Admin kontrolü yap ve yönlendir
            setTimeout(() => {
              if (this.authService.isAdmin()) {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            }, 100);
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

