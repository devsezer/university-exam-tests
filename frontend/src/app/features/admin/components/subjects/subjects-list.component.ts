import { Component, OnInit, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../services/admin.service';
import { Subject, ExamType, Lesson } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { DeleteConfirmationComponent } from '../../../../shared/components/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent, DeleteConfirmationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Konular</h1>
          <p class="mt-2 text-sm text-gray-600">Ders konularını yönetin</p>
        </div>
        <a routerLink="/admin/subjects/new" 
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
        <div *ngIf="subjects().length > 0; else noData" class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li *ngFor="let subject of subjects()" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-primary-600 font-medium">{{ subject.name.charAt(0) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ subject.name }}</div>
                    <div class="text-sm text-gray-500">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
                        {{ getLessonName(subject.lesson_id) }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {{ getExamTypeName(subject.exam_type_id) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <a [routerLink]="['/admin/subjects', subject.id, 'edit']" 
                     class="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Düzenle
                  </a>
                  <button (click)="confirmDelete(subject)" 
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
            <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz konu yok</h3>
            <p class="mt-1 text-sm text-gray-500">İlk konuyu ekleyerek başlayın.</p>
            <div class="mt-6">
              <a routerLink="/admin/subjects/new" 
                 class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Yeni Konu Ekle
              </a>
            </div>
          </div>
        </ng-template>
      </ng-template>

      <app-delete-confirmation
        [show]="showDeleteDialog()"
        title="Konuyu Sil"
        [message]="deleteMessage()"
        (confirm)="deleteSubject()"
        (cancel)="cancelDelete()">
      </app-delete-confirmation>
    </div>
  `,
  styles: []
})
export class SubjectsListComponent implements OnInit {
  subjects = signal<Subject[]>([]);
  examTypes = signal<ExamType[]>([]);
  lessons = signal<Lesson[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  showDeleteDialog = signal(false);
  subjectToDelete = signal<Subject | null>(null);
  deleteMessage = signal('');
  private destroyRef = inject(DestroyRef);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.adminService.listSubjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response.success) {
          this.subjects.set(Array.isArray(response.data) ? response.data : []);
        } else {
          this.subjects.set([]);
          this.errorMessage.set(response.message || 'Konular yüklenemedi.');
        }
        this.loadExamTypes();
        this.loadLessons();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.error?.message || 'Konular yüklenirken bir hata oluştu.');
        this.subjects.set([]);
      }
    });
  }

  loadExamTypes(): void {
    this.adminService.listExamTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.examTypes.set(Array.isArray(response.data) ? response.data : []);
        }
      },
      error: () => {}
    });
  }

  loadLessons(): void {
    this.adminService.listLessons()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.lessons.set(Array.isArray(response.data) ? response.data : []);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getExamTypeName(examTypeId: string): string {
    const examType = this.examTypes().find(et => et.id === examTypeId);
    return examType?.name || 'Bilinmiyor';
  }

  getLessonName(lessonId: string): string {
    const lesson = this.lessons().find(l => l.id === lessonId);
    return lesson?.name || 'Bilinmiyor';
  }

  confirmDelete(subject: Subject): void {
    this.subjectToDelete.set(subject);
    this.deleteMessage.set(`"${subject.name}" konusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`);
    this.showDeleteDialog.set(true);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.subjectToDelete.set(null);
  }

  deleteSubject(): void {
    const subject = this.subjectToDelete();
    if (!subject) return;

    this.adminService.deleteSubject(subject.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.loadData();
        this.showDeleteDialog.set(false);
        this.subjectToDelete.set(null);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error?.message || 'Konu silinirken bir hata oluştu.');
        this.showDeleteDialog.set(false);
      }
    });
  }
}
