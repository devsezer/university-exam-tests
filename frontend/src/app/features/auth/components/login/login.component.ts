import { Component, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { LoginRequest } from '../../../../models/auth.models';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ErrorMessageComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      overflow-x: hidden;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const credentials: LoginRequest = this.loginForm.value;
      this.authService.login(credentials)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Admin kontrolü yap ve yönlendir
              // Signal-based state kullanıldığından doğrudan kontrol edebiliriz
              if (this.authService.isAdmin()) {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/dashboard']);
              }
          } else {
            this.isLoading.set(false);
            this.errorMessage.set(this.errorHandler.getDefaultErrorMessage('login'));
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.errorHandler.extractErrorMessage(error) || this.errorHandler.getDefaultErrorMessage('login'));
        }
        });
    }
  }
}

