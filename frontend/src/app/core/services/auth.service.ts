import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, firstValueFrom, switchMap, of } from 'rxjs';
import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User
} from '../../models/auth.models';
import { ApiResponse } from '../../models/api.models';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authState = signal<AuthState>({
    user: null,
    isAuthenticated: false
  });

  readonly user = computed(() => this.authState().user);
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);

  readonly isAdmin = computed(() => {
    const user = this.user();
    // Backend'den roles string array olarak geliyor: ["admin", "user"]
    return user?.roles?.some(r => r === 'admin') ?? false;
  });

  readonly isSuperAdmin = computed(() => {
    const user = this.user();
    // Backend'den roles string array olarak geliyor
    return user?.roles?.some(r => r === 'super_admin') ?? false;
  });

  constructor(
    private api: ApiService,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    // Initialize auth state from stored tokens
    this.initializeAuthState();

    // Effect to handle authentication state changes
    // Note: Service is singleton, so subscriptions don't need cleanup
    effect(() => {
      const state = this.authState();
      if (!state.isAuthenticated && this.tokenStorage.hasAccessToken()) {
        // Token exists but user is not authenticated, try to get current user
        // Using firstValueFrom to avoid subscription management in service
        firstValueFrom(this.getCurrentUser()).catch(() => {
          // Error handling is done in getCurrentUser
        });
      }
    });
  }

  private initializeAuthState(): void {
    if (this.tokenStorage.hasAccessToken()) {
      // Token exists, try to get current user
      // Using firstValueFrom to avoid subscription management in service
      firstValueFrom(this.getCurrentUser()).catch(() => {
        // If getting user fails, clear tokens
        this.clearAuth();
      });
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse['data']>> {
    return this.api.post<AuthResponse['data']>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenStorage.setTokens(
            response.data.access_token,
            response.data.refresh_token
          );
          this.authState.set({
            user: response.data.user,
            isAuthenticated: true
          });
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse['data']>> {
    return this.api.post<AuthResponse['data']>('/auth/register', data).pipe(
      switchMap(registerResponse => {
        if (registerResponse.success && registerResponse.data) {
          // After registration, automatically login
          // Chain login into the observable so component waits for it to complete
          return this.login({ email: data.email, password: data.password });
        } else {
          // Registration failed, return the response as-is
          return of(registerResponse);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (refreshToken) {
      // Fire and forget logout request
      // Service is singleton, so subscription cleanup is not needed
      firstValueFrom(this.api.post('/auth/logout', { refresh_token: refreshToken })).catch(() => {
        // Ignore errors for logout request
      });
    }
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<ApiResponse<RefreshTokenResponse['data']>> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    return this.api.post<RefreshTokenResponse['data']>('/auth/refresh', request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenStorage.setTokens(
            response.data.access_token,
            response.data.refresh_token
          );
        }
      }),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.api.get<User>('/auth/me').pipe(
      tap(response => {
        if (response.success && response.data) {
          this.authState.set({
            user: response.data,
            isAuthenticated: true
          });
        }
      }),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  hasRole(role: string): boolean {
    const user = this.user();
    // Backend'den roles string array olarak geliyor
    return user?.roles?.some(r => r === role) ?? false;
  }

  hasPermission(permission: string): boolean {
    // Backend'den permission bilgisi gelmiyor, bu fonksiyon şu an çalışmaz
    // Eğer backend'den permission bilgisi geliyorsa güncelleyin
    return false;
  }

  private clearAuth(): void {
    this.tokenStorage.clearTokens();
    this.authState.set({
      user: null,
      isAuthenticated: false
    });
  }
}

