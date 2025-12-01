import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-50 glass-strong shadow-lg backdrop-blur-xl border-b border-white/20 animate-slide-down bg-gradient-to-r from-primary-600/90 via-primary-700/90 to-primary-800/90">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/dashboard" 
                 class="text-xl font-bold text-gradient-primary hover:scale-105 transition-transform duration-200 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Deneme Testi Platformu
              </a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-2">
              <a routerLink="/dashboard" 
                 routerLinkActive="border-primary-400 text-white bg-white/10"
                 class="nav-link border-transparent text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group">
                <span class="relative z-10">Ana Sayfa</span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a routerLink="/tests" 
                 routerLinkActive="border-primary-400 text-white bg-white/10"
                 class="nav-link border-transparent text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group">
                <span class="relative z-10">Test Çöz</span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a routerLink="/results" 
                 routerLinkActive="border-primary-400 text-white bg-white/10"
                 class="nav-link border-transparent text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group">
                <span class="relative z-10">Sonuçlarım</span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a *ngIf="authService.isAdmin()" 
                 routerLink="/admin" 
                 routerLinkActive="border-primary-400 text-white bg-white/10"
                 class="nav-link border-transparent text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group">
                <span class="relative z-10 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Admin Panel
                </span>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center gap-3" *ngIf="user(); else notAuthenticated">
              <span class="text-sm text-white/90 font-medium px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                {{ user()?.username }}
              </span>
              <button (click)="logout()" 
                      class="ripple btn-gradient inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Çıkış Yap
              </button>
            </div>
            <ng-template #notAuthenticated>
              <a routerLink="/auth/login" 
                 class="ripple btn-gradient inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                Giriş Yap
              </a>
            </ng-template>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  authService = inject(AuthService);
  user = this.authService.user;
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  logout(): void {
    this.authService.logout();
  }
}

