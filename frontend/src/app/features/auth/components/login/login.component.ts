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
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınıza giriş yapın
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <app-error-message [message]="errorMessage()"></app-error-message>

          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">E-posta</label>
              <input id="email" name="email" type="email" autocomplete="email" required
                     formControlName="email"
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                     placeholder="E-posta adresi">
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                   class="text-red-600 text-sm mt-1">
                Geçerli bir e-posta adresi giriniz
              </div>
            </div>
            <div>
              <label for="password" class="sr-only">Şifre</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required
                     formControlName="password"
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                     placeholder="Şifre">
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                   class="text-red-600 text-sm mt-1">
                Şifre gereklidir
              </div>
            </div>
          </div>

          <div>
            <button type="submit"
                    [disabled]="isLoading() || loginForm.invalid"
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!isLoading()">Giriş Yap</span>
              <app-loading-spinner *ngIf="isLoading()"></app-loading-spinner>
            </button>
          </div>

          <div class="text-center">
            <span class="text-sm text-gray-600">Hesabınız yok mu? </span>
            <a routerLink="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
              Kayıt olun
            </a>
          </div>
        </form>
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
      email: ['john@example.com', [Validators.required, Validators.email]],
      password: ['SecureP@ss123', [Validators.required]]
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
            this.router.navigate(['/dashboard']);
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

