import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="mb-10 animate-fade-in">
          <h1 class="text-4xl font-extrabold text-gradient-primary mb-3">Admin Paneli</h1>
          <p class="mt-2 text-base text-gray-700">Sistem verilerini yönetin ve kontrol edin</p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <!-- User Management Card -->
          <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-primary-300 group animate-slide-up stagger-1">
            <div class="p-6 bg-gradient-to-br from-primary-50 to-purple-50">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Kullanıcı Yönetimi</dt>
                    <dd class="text-xl font-bold text-gray-900 mt-1">Yönet</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-primary-50 to-purple-50 px-6 py-4 border-t border-primary-100">
              <div class="text-sm">
                <a routerLink="/admin/users" class="font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                  Yönetmek için tıklayın 
                  <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Exam Types Card -->
          <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-secondary-300 group animate-slide-up stagger-2">
            <div class="p-6 bg-gradient-to-br from-secondary-50 to-cyan-50">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sınav Türleri</dt>
                    <dd class="text-xl font-bold text-gray-900 mt-1">Yönet</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-secondary-50 to-cyan-50 px-6 py-4 border-t border-secondary-100">
              <div class="text-sm">
                <a routerLink="/admin/exam-types" class="font-semibold text-secondary-700 hover:text-secondary-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                  Yönetmek için tıklayın 
                  <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Lessons Card -->
          <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-teal-300 group animate-slide-up stagger-3">
            <div class="p-6 bg-gradient-to-br from-teal-50 to-green-50">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Dersler</dt>
                    <dd class="text-xl font-bold text-gray-900 mt-1">Yönet</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-teal-50 to-green-50 px-6 py-4 border-t border-teal-100">
              <div class="text-sm">
                <a routerLink="/admin/lessons" class="font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                  Yönetmek için tıklayın 
                  <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Subjects Card -->
          <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-success-300 group animate-slide-up stagger-4">
            <div class="p-6 bg-gradient-to-br from-success-50 to-emerald-50">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-xl bg-gradient-to-br from-success-500 to-success-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ders Konuları</dt>
                    <dd class="text-xl font-bold text-gray-900 mt-1">Yönet</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-success-50 to-emerald-50 px-6 py-4 border-t border-success-100">
              <div class="text-sm">
                <a routerLink="/admin/subjects" class="font-semibold text-success-700 hover:text-success-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                  Yönetmek için tıklayın 
                  <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Test Books Card -->
          <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-warning-300 group animate-slide-up stagger-5">
            <div class="p-6 bg-gradient-to-br from-warning-50 to-amber-50">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Test Kitapları</dt>
                    <dd class="text-xl font-bold text-gray-900 mt-1">Yönet</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-warning-50 to-amber-50 px-6 py-4 border-t border-warning-100">
              <div class="text-sm">
                <a routerLink="/admin/test-books" class="font-semibold text-warning-700 hover:text-warning-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                  Yönetmek için tıklayın 
                  <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Practice Tests Card -->
          <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-danger-300 group animate-slide-up stagger-6">
            <div class="p-6 bg-gradient-to-br from-danger-50 to-rose-50">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-xl bg-gradient-to-br from-danger-500 to-danger-600 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse-glow">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Deneme Testleri</dt>
                    <dd class="text-xl font-bold text-gray-900 mt-1">Yönet</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-danger-50 to-rose-50 px-6 py-4 border-t border-danger-100">
              <div class="text-sm">
                <a routerLink="/admin/practice-tests" class="font-semibold text-danger-700 hover:text-danger-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                  Yönetmek için tıklayın 
                  <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Roles Card -->
          <div class="card-hover bg-white overflow-hidden shadow-lg rounded-2xl border-2 border-transparent hover:border-primary-400 group animate-slide-up stagger-7">
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
                    <dt class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Roller</dt>
                    <dd class="text-xl font-bold text-gray-900 mt-1">Görüntüle</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-primary-50 via-indigo-50 to-purple-50 px-6 py-4 border-t border-primary-200">
              <div class="text-sm">
                <a routerLink="/admin/roles" class="font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                  Görüntülemek için tıklayın 
                  <span class="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent {}

