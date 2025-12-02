import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar - Desktop -->
      <aside class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <app-admin-sidebar></app-admin-sidebar>
      </aside>

      <!-- Mobile sidebar backdrop -->
      <div *ngIf="isMobileMenuOpen()" 
           (click)="toggleMobileMenu()"
           class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden transition-opacity"></div>

      <!-- Mobile sidebar -->
      <aside *ngIf="isMobileMenuOpen()" 
             class="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
        <div class="h-full bg-white shadow-xl">
          <app-admin-sidebar (linkClicked)="toggleMobileMenu()"></app-admin-sidebar>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 lg:pl-64 flex flex-col">
        <!-- Mobile header with menu button -->
        <div class="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button (click)="toggleMobileMenu()"
                  class="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="ml-4 text-lg font-semibold text-gray-900">Admin Panel</h1>
        </div>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto">
          <div class="max-w-7xl mx-auto w-full">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {
  isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }
}

