import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Lesson } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { DeleteConfirmationComponent } from '../../../../shared/components/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-lessons-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent, DeleteConfirmationComponent],
  template: `
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dersler</h1>
          <p class="mt-2 text-sm text-gray-600">Dersleri yönetin (Matematik, Fizik, Türkçe vb.)</p>
        </div>
        <a routerLink="/admin/lessons/new"
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
        <div *ngIf="lessons().length > 0; else noData" class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li *ngFor="let lesson of lessons()" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span class="text-green-600 font-medium">{{ lesson.name.charAt(0) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ lesson.name }}</div>
                    <div class="text-sm text-gray-500">Oluşturulma: {{ lesson.created_at | date:'dd.MM.yyyy HH:mm' }}</div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <a [routerLink]="['/admin/lessons', lesson.id, 'edit']"
                     class="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Düzenle
                  </a>
                  <button (click)="confirmDelete(lesson)"
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz ders yok</h3>
            <p class="mt-1 text-sm text-gray-500">İlk dersi ekleyerek başlayın.</p>
            <div class="mt-6">
              <a routerLink="/admin/lessons/new"
                 class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Yeni Ders Ekle
              </a>
            </div>
          </div>
        </ng-template>
      </ng-template>

      <app-delete-confirmation
        [show]="showDeleteDialog()"
        title="Dersi Sil"
        [message]="deleteMessage()"
        (confirm)="deleteLesson()"
        (cancel)="cancelDelete()">
      </app-delete-confirmation>
    </div>
  `,
  styles: []
})
export class LessonsListComponent implements OnInit {
  lessons = signal<Lesson[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  showDeleteDialog = signal(false);
  lessonToDelete = signal<Lesson | null>(null);
  deleteMessage = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadLessons();
  }

  loadLessons(): void {
    this.isLoading.set(true);
    this.adminService.listLessons().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.lessons.set(response.data);
        } else {
          this.errorMessage.set('Dersler yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Dersler yüklenirken bir hata oluştu.');
      }
    });
  }

  confirmDelete(lesson: Lesson): void {
    this.lessonToDelete.set(lesson);
    this.deleteMessage.set(`"${lesson.name}" dersini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bu derse bağlı tüm konular da silinir.`);
    this.showDeleteDialog.set(true);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.lessonToDelete.set(null);
  }

  deleteLesson(): void {
    const lesson = this.lessonToDelete();
    if (!lesson) return;

    this.adminService.deleteLesson(lesson.id).subscribe({
      next: () => {
        this.loadLessons();
        this.showDeleteDialog.set(false);
        this.lessonToDelete.set(null);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error?.message || 'Ders silinirken bir hata oluştu.');
        this.showDeleteDialog.set(false);
      }
    });
  }
}

