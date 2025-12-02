import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Role } from '../../../../models/role.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Roller</h1>
        <p class="mt-2 text-sm text-gray-600">Sistem rollerini görüntüleyin</p>
      </div>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div *ngIf="isLoading(); else content">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #content>
        <div *ngIf="roles().length > 0; else noData" class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li *ngFor="let role of roles()" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-primary-600 font-medium">{{ role.name.charAt(0).toUpperCase() }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
                      <span *ngIf="role.is_system" 
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Sistem Rolü
                      </span>
                    </div>
                    <div class="text-sm text-gray-500" *ngIf="role.description">{{ role.description }}</div>
                    <div class="text-xs text-gray-400 mt-1">
                      Oluşturulma: {{ formatDate(role.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <ng-template #noData>
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz rol yok</h3>
            <p class="mt-1 text-sm text-gray-500">Henüz hiç rol bulunmuyor.</p>
          </div>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: []
})
export class RolesListComponent implements OnInit {
  roles = signal<Role[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.adminService.listRoles().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.roles.set(response.data);
        } else {
          this.errorMessage.set('Roller yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Roller yüklenirken bir hata oluştu.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

