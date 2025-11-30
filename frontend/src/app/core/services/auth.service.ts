import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
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
    console.log(user);
    //return user?.roles?.some(r => r.name === 'user' || r.name === 'super_admin') ?? false;
    return true;
  });

  readonly isSuperAdmin = computed(() => {
    const user = this.user();
    return user?.roles?.some(r => r.name === 'super_admin') ?? false;
  });

  constructor(
    private api: ApiService,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    // Initialize auth state from stored tokens
    this.initializeAuthState();

    // Effect to handle authentication state changes
    effect(() => {
      const state = this.authState();
      if (!state.isAuthenticated && this.tokenStorage.hasAccessToken()) {
        // Token exists but user is not authenticated, try to get current user
        this.getCurrentUser().subscribe();
      }
    });
  }

  private initializeAuthState(): void {
    if (this.tokenStorage.hasAccessToken()) {
      // Token exists, try to get current user
      this.getCurrentUser().subscribe({
        error: () => {
          // If getting user fails, clear tokens
          this.clearAuth();
        }
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
      tap(response => {
        if (response.success && response.data) {
          // After registration, automatically login
          this.login({ email: data.email, password: data.password }).subscribe();
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
      this.api.post('/auth/logout', { refresh_token: refreshToken }).subscribe();
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
    return user?.roles?.some(r => r.name === role) ?? false;
  }

  hasPermission(permission: string): boolean {
    const user = this.user();
    if (!user?.roles) return false;

    // Check if any role has this permission
    return user.roles.some(role => role.permissions?.includes(permission)) ?? false;
  }

  private clearAuth(): void {
    this.tokenStorage.clearTokens();
    this.authState.set({
      user: null,
      isAuthenticated: false
    });
  }
}

