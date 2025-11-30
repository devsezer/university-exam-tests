import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { PracticeTest, TestBook } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { DeleteConfirmationComponent } from '../../../../shared/components/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-practice-tests-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent, DeleteConfirmationComponent],
  template: `
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Deneme Testleri</h1>
          <p class="mt-2 text-sm text-gray-600">Deneme testlerini yönetin</p>
        </div>
        <a routerLink="/admin/practice-tests/new" 
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
        <div *ngIf="practiceTests().length > 0; else noData" class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li *ngFor="let practiceTest of practiceTests()" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-primary-600 font-medium">{{ practiceTest.test_number }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ practiceTest.name }}</div>
                    <div class="text-sm text-gray-500">
                      {{ getTestBookName(practiceTest.test_book_id) }} - {{ practiceTest.question_count }} soru
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <a [routerLink]="['/admin/practice-tests', practiceTest.id, 'edit']" 
                     class="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Düzenle
                  </a>
                  <button (click)="confirmDelete(practiceTest)" 
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz deneme testi yok</h3>
            <p class="mt-1 text-sm text-gray-500">İlk deneme testini ekleyerek başlayın.</p>
            <div class="mt-6">
              <a routerLink="/admin/practice-tests/new" 
                 class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Yeni Deneme Testi Ekle
              </a>
            </div>
          </div>
        </ng-template>
      </ng-template>

      <app-delete-confirmation
        [show]="showDeleteDialog()"
        title="Deneme Testini Sil"
        [message]="deleteMessage()"
        (confirm)="deletePracticeTest()"
        (cancel)="cancelDelete()">
      </app-delete-confirmation>
    </div>
  `,
  styles: []
})
export class PracticeTestsListComponent implements OnInit {
  practiceTests = signal<PracticeTest[]>([]);
  testBooks = signal<TestBook[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  showDeleteDialog = signal(false);
  practiceTestToDelete = signal<PracticeTest | null>(null);
  deleteMessage = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.adminService.listPracticeTests().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.practiceTests.set(response.data);
        }
        this.loadTestBooks();
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Deneme testleri yüklenirken bir hata oluştu.');
      }
    });
  }

  loadTestBooks(): void {
    this.adminService.listTestBooks().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.testBooks.set(response.data);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getTestBookName(testBookId: string): string {
    const testBook = this.testBooks().find(tb => tb.id === testBookId);
    return testBook?.name || testBookId.substring(0, 8);
  }

  confirmDelete(practiceTest: PracticeTest): void {
    this.practiceTestToDelete.set(practiceTest);
    this.deleteMessage.set(`"${practiceTest.name}" deneme testini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`);
    this.showDeleteDialog.set(true);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.practiceTestToDelete.set(null);
  }

  deletePracticeTest(): void {
    const practiceTest = this.practiceTestToDelete();
    if (!practiceTest) return;

    this.adminService.deletePracticeTest(practiceTest.id).subscribe({
      next: () => {
        this.loadData();
        this.showDeleteDialog.set(false);
        this.practiceTestToDelete.set(null);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error?.message || 'Deneme testi silinirken bir hata oluştu.');
        this.showDeleteDialog.set(false);
      }
    });
  }
}

