import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ExamType } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { DeleteConfirmationComponent } from '../../../../shared/components/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-exam-types-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent, DeleteConfirmationComponent],
  template: `
    <div class="py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Sınav Türleri</h1>
          <p class="mt-2 text-sm text-gray-600">Sınav türlerini yönetin</p>
        </div>
        <a routerLink="/admin/exam-types/new" 
           class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Ekle
        </a>
      </div>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div *ngIf="isLoading(); else content">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #content>
        <div *ngIf="examTypes().length > 0; else noData" class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li *ngFor="let examType of examTypes()" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-primary-600 font-medium">{{ examType.name.charAt(0) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ examType.name }}</div>
                    <div class="text-sm text-gray-500" *ngIf="examType.description">{{ examType.description }}</div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <a [routerLink]="['/admin/exam-types', examType.id, 'edit']" 
                     class="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Düzenle
                  </a>
                  <button (click)="confirmDelete(examType)" 
                          class="text-red-600 hover:text-red-900 text-sm font-medium">
                    Sil
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <ng-template #noData>
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz sınav türü yok</h3>
            <p class="mt-1 text-sm text-gray-500">İlk sınav türünü ekleyerek başlayın.</p>
            <div class="mt-6">
              <a routerLink="/admin/exam-types/new" 
                 class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Yeni Sınav Türü Ekle
              </a>
            </div>
          </div>
        </ng-template>
      </ng-template>

      <app-delete-confirmation
        [show]="showDeleteDialog()"
        title="Sınav Türünü Sil"
        [message]="deleteMessage()"
        (confirm)="deleteExamType()"
        (cancel)="cancelDelete()">
      </app-delete-confirmation>
    </div>
  `,
  styles: []
})
export class ExamTypesListComponent implements OnInit {
  examTypes = signal<ExamType[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  showDeleteDialog = signal(false);
  examTypeToDelete = signal<ExamType | null>(null);

  deleteMessage = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadExamTypes();
  }

  loadExamTypes(): void {
    this.isLoading.set(true);
    this.adminService.listExamTypes().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.examTypes.set(response.data);
        } else {
          this.errorMessage.set('Sınav türleri yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Sınav türleri yüklenirken bir hata oluştu.');
      }
    });
  }

  confirmDelete(examType: ExamType): void {
    this.examTypeToDelete.set(examType);
    this.deleteMessage.set(`"${examType.name}" sınav türünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`);
    this.showDeleteDialog.set(true);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.examTypeToDelete.set(null);
  }

  deleteExamType(): void {
    const examType = this.examTypeToDelete();
    if (!examType) return;

    this.adminService.deleteExamType(examType.id).subscribe({
      next: () => {
        this.loadExamTypes();
        this.showDeleteDialog.set(false);
        this.examTypeToDelete.set(null);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error?.message || 'Sınav türü silinirken bir hata oluştu.');
        this.showDeleteDialog.set(false);
      }
    });
  }
}

