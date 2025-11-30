import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../models/auth.models';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ErrorMessageComponent, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <div class="max-w-md w-full space-y-8 animate-scale-in">
        <div class="bg-white rounded-2xl p-8 shadow-2xl">
          <div class="mb-8">
            <h2 class="text-center text-4xl font-extrabold text-gray-900 mb-2">
              Hesabınıza giriş yapın
            </h2>
            <p class="text-center text-sm text-gray-600">Hoş geldiniz! Devam etmek için giriş yapın.</p>
          </div>
          <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <app-error-message [message]="errorMessage()"></app-error-message>

            <div class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                <input id="email" name="email" type="email" autocomplete="email" required
                       formControlName="email"
                       class="input-focus appearance-none relative block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 sm:text-sm"
                       placeholder="E-posta adresiniz">
                <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                     class="text-danger-600 text-sm mt-2 animate-slide-down flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Geçerli bir e-posta adresi giriniz
                </div>
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required
                       formControlName="password"
                       class="input-focus appearance-none relative block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 sm:text-sm"
                       placeholder="Şifreniz">
                <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                     class="text-danger-600 text-sm mt-2 animate-slide-down flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Şifre gereklidir
                </div>
              </div>
            </div>

            <div>
              <button type="submit"
                      [disabled]="isLoading() || loginForm.invalid"
                      class="ripple btn-gradient w-full flex justify-center py-3 px-4 text-base font-semibold rounded-xl text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none">
                <span *ngIf="!isLoading()" class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Giriş Yap
                </span>
                <app-loading-spinner *ngIf="isLoading()"></app-loading-spinner>
              </button>
            </div>

            <div class="text-center pt-4">
              <span class="text-sm text-gray-600">Hesabınız yok mu? </span>
              <a routerLink="/auth/register" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200">
                Kayıt olun
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@deneme.com', [Validators.required, Validators.email]],
      password: ['Admin123!', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const credentials: LoginRequest = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response) => {
          if (response.success) {
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
            this.errorMessage.set('Giriş başarısız. Lütfen tekrar deneyin.');
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.error?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
        }
      });
    }
  }
}

