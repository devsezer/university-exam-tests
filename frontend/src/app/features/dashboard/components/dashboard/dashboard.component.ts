import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50">
      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="mb-10 animate-fade-in">
            <h1 class="text-4xl font-extrabold text-gradient-primary mb-3">
              Hoş geldiniz, {{ user()?.username }}!
            </h1>
            <p class="mt-2 text-base text-gray-700">
              Deneme testlerinizi çözün ve sonuçlarınızı takip edin.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Test Çöz Card -->
            <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-primary-300 group animate-slide-up stagger-1">
              <div class="p-6 bg-gradient-to-br from-primary-50 to-purple-50">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                      <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Test Çöz</dt>
                      <dd class="text-xl font-bold text-gray-900 mt-1">Yeni bir test başlat</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-primary-50 to-purple-50 px-6 py-4 border-t border-primary-100">
                <div class="text-sm">
                  <a routerLink="/tests" class="font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                    Test seçmek için tıklayın 
                    <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Sonuçlarım Card -->
            <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-secondary-300 group animate-slide-up stagger-2">
              <div class="p-6 bg-gradient-to-br from-secondary-50 to-cyan-50">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="p-3 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                      <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sonuçlarım</dt>
                      <dd class="text-xl font-bold text-gray-900 mt-1">Geçmiş sonuçları görüntüle</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-secondary-50 to-cyan-50 px-6 py-4 border-t border-secondary-100">
                <div class="text-sm">
                  <a routerLink="/results" class="font-semibold text-secondary-700 hover:text-secondary-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                    Sonuçları görüntüle 
                    <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Bilgi Card -->
            <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-warning-300 group animate-slide-up stagger-3">
              <div class="p-6 bg-gradient-to-br from-warning-50 to-amber-50">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="p-3 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                      <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Bilgi</dt>
                      <dd class="text-base font-semibold text-gray-900 mt-1">Aynı testi tekrar çözmek için 24 saat beklemeniz gerekir.</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- Admin Panel Card -->
            <div *ngIf="isAdmin()" class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-primary-400 group animate-slide-up stagger-4 sm:col-span-2 lg:col-span-1">
              <div class="p-6 bg-gradient-to-br from-primary-50 via-indigo-50 to-purple-50">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="p-3 rounded-xl bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                      <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Admin Panel</dt>
                      <dd class="text-xl font-bold text-gray-900 mt-1">Sistem yönetimi</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-primary-50 via-indigo-50 to-purple-50 px-6 py-4 border-t border-primary-200">
                <div class="text-sm">
                  <a routerLink="/admin" class="font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                    Admin paneline git 
                    <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  user = this.authService.user;
  isAdmin = computed(() => this.authService.isAdmin());

  ngOnInit(): void {
    // Admin kullanıcıları doğrudan admin paneline yönlendir
    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
    }
  }
}

