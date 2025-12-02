import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 handling is done in authInterceptor to avoid double logout/redirect
      // This interceptor handles other error cases
      
      // You can add more error handling logic here
      // For example, show toast notifications, etc.

      return throwError(() => error);
    })
  );
};

