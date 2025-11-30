import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { User } from '../../../../models/user.models';
import { Role } from '../../../../models/role.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { DeleteConfirmationComponent } from '../../../../shared/components/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    DeleteConfirmationComponent
  ],
  template: `
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <button (click)="goBack()" 
                class="text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Geri Dön
        </button>
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Kullanıcı Detayı</h1>
          <div class="flex space-x-2">
            <a [routerLink]="['/admin/users', userId, 'edit']"
               class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
              Düzenle
            </a>
          </div>
        </div>
      </div>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div *ngIf="isLoading(); else content">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #content>
        <div *ngIf="user()" class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-primary-600 text-2xl font-bold">{{ user()!.username.charAt(0).toUpperCase() }}</span>
                </div>
              </div>
              <div class="ml-4">
                <h2 class="text-2xl font-bold text-gray-900">{{ user()!.username }}</h2>
                <p class="text-sm text-gray-500">{{ user()!.email }}</p>
              </div>
              <div class="ml-auto">
                <span [class]="user()!.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                  {{ user()!.is_active ? 'Aktif' : 'Pasif' }}
                </span>
              </div>
            </div>
          </div>

          <div class="px-6 py-5 space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Kullanıcı Bilgileri</h3>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Kullanıcı ID</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ user()!.id }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Kullanıcı Adı</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ user()!.username }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ user()!.email }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Durum</dt>
                  <dd class="mt-1">
                    <span [class]="user()!.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ user()!.is_active ? 'Aktif' : 'Pasif' }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Oluşturulma Tarihi</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user()!.created_at) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Son Güncelleme</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user()!.updated_at) }}</dd>
                </div>
              </dl>
            </div>

            <div>
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Roller</h3>
              </div>
              
              <!-- Mevcut Roller -->
              <div class="mb-4">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span *ngFor="let roleName of user()!.roles" 
                        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {{ roleName }}
                    <button
                      *ngIf="!isSystemRole(roleName)"
                      (click)="confirmRemoveRole(roleName)"
                      class="ml-1 text-red-600 hover:text-red-800 focus:outline-none"
                      title="Rolü Kaldır">
                      ×
                    </button>
                    <span *ngIf="isSystemRole(roleName)" 
                          class="ml-1 text-xs text-gray-500" 
                          title="Sistem rolü kaldırılamaz">
                      (Sistem)
                    </span>
                  </span>
                  <span *ngIf="user()!.roles.length === 0" class="text-sm text-gray-500">
                    Kullanıcının rolü bulunmuyor
                  </span>
                </div>
              </div>

              <!-- Rol Ekleme -->
              <div class="border-t border-gray-200 pt-4">
                <label for="roleSelect" class="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Rol Ekle
                </label>
                <div class="flex gap-2">
                  <select
                    id="roleSelect"
                    [(ngModel)]="selectedRoleId"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option value="">Rol seçin...</option>
                    <option *ngFor="let role of availableRoles()" [value]="role.id">
                      {{ role.name }}<span *ngIf="role.is_system"> (Sistem)</span>
                    </option>
                  </select>
                  <button
                    (click)="assignRole()"
                    [disabled]="!selectedRoleId || isAssigningRole()"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span *ngIf="!isAssigningRole()">Rol Ekle</span>
                    <span *ngIf="isAssigningRole()">Ekleniyor...</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>

      <app-delete-confirmation
        [show]="showRemoveRoleDialog()"
        title="Rolü Kaldır"
        [message]="removeRoleMessage()"
        (confirm)="removeRole()"
        (cancel)="cancelRemoveRole()">
      </app-delete-confirmation>
    </div>
  `,
  styles: []
})
export class UserDetailComponent implements OnInit {
  user = signal<User | null>(null);
  roles = signal<Role[]>([]);
  isLoading = signal(true);
  isLoadingRoles = signal(false);
  errorMessage = signal<string | null>(null);
  userId: string | null = null;
  selectedRoleId = '';
  isAssigningRole = signal(false);
  showRemoveRoleDialog = signal(false);
  roleToRemove = signal<string | null>(null);
  removeRoleMessage = signal('');

  // Kullanıcının sahip olmadığı rolleri filtrele
  availableRoles = computed(() => {
    const userRoles = this.user()?.roles || [];
    return this.roles().filter(role => !userRoles.includes(role.name));
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = id;
      this.loadUser(id);
      this.loadRoles();
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('Kullanıcı ID bulunamadı.');
    }
  }

  loadRoles(): void {
    this.isLoadingRoles.set(true);
    this.adminService.listRoles().subscribe({
      next: (response) => {
        this.isLoadingRoles.set(false);
        if (response.success && response.data) {
          this.roles.set(response.data);
        }
      },
      error: () => {
        this.isLoadingRoles.set(false);
      }
    });
  }

  loadUser(id: string): void {
    this.isLoading.set(true);
    this.adminService.getUser(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.user.set(response.data);
        } else {
          this.errorMessage.set('Kullanıcı yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Kullanıcı yüklenirken bir hata oluştu.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isSystemRole(roleName: string): boolean {
    const role = this.roles().find(r => r.name === roleName);
    return role?.is_system ?? false;
  }

  assignRole(): void {
    if (!this.selectedRoleId || !this.userId) return;

    this.isAssigningRole.set(true);
    this.errorMessage.set(null);

    this.adminService.assignRoleToUser(this.userId, this.selectedRoleId).subscribe({
      next: () => {
        this.isAssigningRole.set(false);
        this.selectedRoleId = '';
        // Kullanıcı bilgilerini yenile
        this.loadUser(this.userId!);
      },
      error: (error) => {
        this.isAssigningRole.set(false);
        this.errorMessage.set(error.error?.error?.message || 'Rol atanırken bir hata oluştu.');
      }
    });
  }

  confirmRemoveRole(roleName: string): void {
    this.roleToRemove.set(roleName);
    this.removeRoleMessage.set(`"${roleName}" rolünü bu kullanıcıdan kaldırmak istediğinizden emin misiniz?`);
    this.showRemoveRoleDialog.set(true);
  }

  cancelRemoveRole(): void {
    this.showRemoveRoleDialog.set(false);
    this.roleToRemove.set(null);
  }

  removeRole(): void {
    const roleName = this.roleToRemove();
    if (!roleName || !this.userId) return;

    // Role ID'yi bul
    const role = this.roles().find(r => r.name === roleName);
    if (!role) {
      this.errorMessage.set('Rol bulunamadı.');
      this.showRemoveRoleDialog.set(false);
      return;
    }

    this.adminService.removeRoleFromUser(this.userId, role.id).subscribe({
      next: () => {
        this.showRemoveRoleDialog.set(false);
        this.roleToRemove.set(null);
        // Kullanıcı bilgilerini yenile
        this.loadUser(this.userId!);
      },
      error: (error) => {
        this.showRemoveRoleDialog.set(false);
        this.errorMessage.set(error.error?.error?.message || 'Rol kaldırılırken bir hata oluştu.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}

