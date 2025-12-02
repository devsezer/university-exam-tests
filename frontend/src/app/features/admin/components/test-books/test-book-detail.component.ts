import { Component, OnInit, signal, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { TestBook, PracticeTest, PracticeTestsGrouped, ExamType, Lesson, Subject } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { DeleteConfirmationComponent } from '../../../../shared/components/delete-confirmation/delete-confirmation.component';
import { PracticeTestModalComponent } from '../practice-tests/practice-test-modal.component';
import { PracticeTestEditModalComponent } from '../practice-tests/practice-test-edit-modal.component';
import { TestBookEditModalComponent } from './test-book-edit-modal.component';

@Component({
  selector: 'app-test-book-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent, DeleteConfirmationComponent, PracticeTestModalComponent, PracticeTestEditModalComponent, TestBookEditModalComponent],
  template: `
    <div class="py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div class="mb-6">
        <button (click)="goBack()" 
                class="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Geri Dön
        </button>
      </div>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div *ngIf="isLoading(); else content">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #content>
        <div *ngIf="testBook(); else notFound">
          <!-- Book Info Header -->
          <div class="bg-white shadow rounded-lg p-6 mb-6">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ testBook()!.name }}</h1>
                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {{ getExamTypeName(testBook()!.exam_type_id) }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {{ getLessonName(testBook()!.lesson_id) }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {{ testBook()!.published_year }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let subjectId of testBook()!.subject_ids || []"
                        class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {{ getSubjectName(subjectId) }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <button (click)="editBook()"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Düzenle
                </button>
                <button (click)="confirmDelete()"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                  <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Sil
                </button>
              </div>
            </div>
          </div>

          <!-- Tests Section -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 class="text-xl font-semibold text-gray-900">Testler</h2>
              <button (click)="openAddTestModal()"
                      class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Yeni Test Ekle
              </button>
            </div>

            <div *ngIf="isLoadingTests(); else testsContent" class="p-6">
              <app-loading-spinner></app-loading-spinner>
            </div>

            <ng-template #testsContent>
              <div *ngIf="filteredTests().length > 0; else noTests">
                <!-- Filter -->
                <div class="px-6 py-4 border-b border-gray-200">
                  <label for="subject-filter" class="block text-sm font-medium text-gray-700 mb-2">Konuya Göre Filtrele</label>
                  <select id="subject-filter"
                          [value]="selectedSubjectFilter() || ''"
                          (change)="onSubjectFilterChange($event)"
                          class="block w-full max-w-xs px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Tüm Konular</option>
                    <option *ngFor="let subjectId of getAvailableSubjectIds()" [value]="subjectId">
                      {{ getSubjectName(subjectId) }}
                    </option>
                  </select>
                </div>

                <!-- Tests Table -->
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Adı</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Numarası</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konu</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soru Sayısı</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let test of filteredTests()" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">{{ test.name }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900">#{{ test.test_number }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {{ getSubjectName(test.subject_id) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900">{{ test.question_count }} soru</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button (click)="editTest(test.id)"
                                  class="text-primary-600 hover:text-primary-900 mr-4">
                            Düzenle
                          </button>
                          <button (click)="confirmDeleteTest(test)"
                                  class="text-red-600 hover:text-red-900">
                            Sil
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <ng-template #noTests>
                <div class="p-12 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz test yok</h3>
                  <p class="mt-1 text-sm text-gray-500">Bu kitap için test ekleyerek başlayın.</p>
                  <div class="mt-6">
                    <button (click)="openAddTestModal()"
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                      Yeni Test Ekle
                    </button>
                  </div>
                </div>
              </ng-template>
            </ng-template>
          </div>
        </div>

        <ng-template #notFound>
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Test kitabı bulunamadı</h3>
            <p class="mt-1 text-sm text-gray-500">Aradığınız test kitabı mevcut değil veya silinmiş olabilir.</p>
            <div class="mt-6">
              <button (click)="goBack()"
                      class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Geri Dön
              </button>
            </div>
          </div>
        </ng-template>
      </ng-template>

      <!-- Delete Confirmation Dialogs -->
      <app-delete-confirmation
        [show]="showDeleteBookDialog()"
        title="Test Kitabını Sil"
        [message]="deleteBookMessage()"
        (confirm)="deleteBook()"
        (cancel)="cancelDeleteBook()">
      </app-delete-confirmation>

      <app-delete-confirmation
        [show]="showDeleteTestDialog()"
        title="Testi Sil"
        [message]="deleteTestMessage()"
        (confirm)="deleteTest()"
        (cancel)="cancelDeleteTest()">
      </app-delete-confirmation>

      <!-- Practice Test Modal -->
      <app-practice-test-modal
        #practiceTestModal
        [testBookId]="testBook()?.id || null"
        (saved)="onTestSaved()"
        (closed)="onModalClosed()">
      </app-practice-test-modal>

      <!-- Practice Test Edit Modal -->
      <app-practice-test-edit-modal
        #practiceTestEditModal
        [testId]="testToEdit() || null"
        [testBookId]="testBook()?.id || null"
        (saved)="onTestSaved()"
        (closed)="onModalClosed()">
      </app-practice-test-edit-modal>

      <!-- Test Book Edit Modal -->
      <app-test-book-edit-modal
        #testBookEditModal
        [bookId]="testBook()?.id || null"
        (saved)="onBookSaved()"
        (closed)="onModalClosed()">
      </app-test-book-edit-modal>
    </div>
  `,
  styles: []
})
export class TestBookDetailComponent implements OnInit {
  testBook = signal<TestBook | null>(null);
  practiceTestsGrouped = signal<Map<string, PracticeTest[]>>(new Map());
  allTests = signal<PracticeTest[]>([]);
  selectedSubjectFilter = signal<string | null>(null);
  examTypes = signal<ExamType[]>([]);
  lessons = signal<Lesson[]>([]);
  subjects = signal<Subject[]>([]);
  isLoading = signal(true);
  isLoadingTests = signal(false);
  errorMessage = signal<string | null>(null);
  showDeleteBookDialog = signal(false);
  showDeleteTestDialog = signal(false);
  testToDelete = signal<PracticeTest | null>(null);
  deleteBookMessage = signal('');
  deleteTestMessage = signal('');
  @ViewChild('practiceTestModal') practiceTestModalRef!: PracticeTestModalComponent;
  @ViewChild('practiceTestEditModal') practiceTestEditModalRef!: PracticeTestEditModalComponent;
  @ViewChild('testBookEditModal') testBookEditModalRef!: TestBookEditModalComponent;
  testToEdit = signal<string | null>(null);

  filteredTests = computed(() => {
    const filter = this.selectedSubjectFilter();
    const tests = this.allTests();
    if (!filter) {
      return tests;
    }
    return tests.filter(test => test.subject_id === filter);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBook(bookId);
      this.loadRelatedData();
    }
  }

  loadBook(bookId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.adminService.getTestBook(bookId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.testBook.set(response.data);
          this.loadPracticeTests(bookId);
        } else {
          this.errorMessage.set(response.message || 'Test kitabı bulunamadı.');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error?.message || 'Test kitabı yüklenirken bir hata oluştu.');
        this.isLoading.set(false);
      }
    });
  }

  loadRelatedData(): void {
    this.adminService.listExamTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.examTypes.set(Array.isArray(response.data) ? response.data : []);
        }
      }
    });
    this.adminService.listLessons().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lessons.set(Array.isArray(response.data) ? response.data : []);
        }
      }
    });
    this.adminService.listSubjects().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subjects.set(Array.isArray(response.data) ? response.data : []);
        }
      }
    });
  }

  loadPracticeTests(bookId: string): void {
    this.isLoadingTests.set(true);
    this.adminService.getPracticeTestsGroupedBySubject(bookId).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isLoadingTests.set(false);
        if (response.success && response.data) {
          // Convert object to Map
          const grouped = new Map<string, PracticeTest[]>();
          const allTestsList: PracticeTest[] = [];
          Object.entries(response.data).forEach(([subjectId, tests]) => {
            grouped.set(subjectId, tests);
            allTestsList.push(...tests);
          });
          // Sort tests by test_number
          allTestsList.sort((a, b) => a.test_number - b.test_number);
          this.practiceTestsGrouped.set(grouped);
          this.allTests.set(allTestsList);
        } else {
          this.practiceTestsGrouped.set(new Map());
          this.allTests.set([]);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.isLoadingTests.set(false);
        this.errorMessage.set(error.error?.error?.message || 'Testler yüklenirken bir hata oluştu.');
        this.practiceTestsGrouped.set(new Map());
        this.allTests.set([]);
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

  getSubjectName(subjectId: string): string {
    const subject = this.subjects().find(s => s.id === subjectId);
    return subject?.name || 'Bilinmiyor';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  editBook(): void {
    const book = this.testBook();
    if (book && this.testBookEditModalRef) {
      (this.testBookEditModalRef as any).bookId = book.id;
      this.testBookEditModalRef.open();
    }
  }

  confirmDelete(): void {
    const book = this.testBook();
    if (book) {
      this.deleteBookMessage.set(`"${book.name}" test kitabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm testler de silinecektir.`);
      this.showDeleteBookDialog.set(true);
    }
  }

  cancelDeleteBook(): void {
    this.showDeleteBookDialog.set(false);
  }

  deleteBook(): void {
    const book = this.testBook();
    if (!book) return;

    this.adminService.deleteTestBook(book.id).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error?.message || 'Test kitabı silinirken bir hata oluştu.');
        this.showDeleteBookDialog.set(false);
      }
    });
  }

  openAddTestModal(): void {
    if (this.practiceTestModalRef) {
      this.practiceTestModalRef.open();
    }
  }

  onTestSaved(): void {
    const book = this.testBook();
    if (book) {
      this.loadPracticeTests(book.id);
    }
  }

  onBookSaved(): void {
    const book = this.testBook();
    if (book) {
      this.loadBook(book.id);
      this.loadPracticeTests(book.id);
    }
  }

  onModalClosed(): void {
    // Modal closed, no action needed
  }

  editTest(testId: string): void {
    const book = this.testBook();
    if (book && this.practiceTestEditModalRef) {
      this.testToEdit.set(testId);
      // Set inputs before opening
      (this.practiceTestEditModalRef as any).testId = testId;
      (this.practiceTestEditModalRef as any).testBookId = book.id;
      this.practiceTestEditModalRef.open();
    }
  }

  confirmDeleteTest(test: PracticeTest): void {
    this.testToDelete.set(test);
    this.deleteTestMessage.set(`"${test.name}" testini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`);
    this.showDeleteTestDialog.set(true);
  }

  cancelDeleteTest(): void {
    this.showDeleteTestDialog.set(false);
    this.testToDelete.set(null);
  }

  deleteTest(): void {
    const test = this.testToDelete();
    if (!test) return;

    this.adminService.deletePracticeTest(test.id).subscribe({
      next: () => {
        const book = this.testBook();
        if (book) {
          this.loadPracticeTests(book.id);
        }
        this.showDeleteTestDialog.set(false);
        this.testToDelete.set(null);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error?.message || 'Test silinirken bir hata oluştu.');
        this.showDeleteTestDialog.set(false);
      }
    });
  }

  onSubjectFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedSubjectFilter.set(value || null);
  }

  getAvailableSubjectIds(): string[] {
    const book = this.testBook();
    return book?.subject_ids || [];
  }
}

