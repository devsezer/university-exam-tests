import { Component, OnInit, signal, computed, ViewChild, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../services/admin.service';
import { TestBook, ExamType, Lesson, Subject } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { TestBookCreateModalComponent } from '../test-books/test-book-create-modal.component';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface TestBookWithCount extends TestBook {
  test_count?: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent, TestBookCreateModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Test Kitapları</h1>
          <p class="mt-2 text-sm text-gray-600">Test kitaplarını görüntüleyin ve yönetin</p>
        </div>
        <div class="flex items-center gap-4">
          <!-- View Toggle -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button (click)="viewMode.set('grid')"
                    [class.bg-white]="viewMode() === 'grid'"
                    [class.shadow-sm]="viewMode() === 'grid'"
                    [class.text-gray-900]="viewMode() === 'grid'"
                    [class.text-gray-600]="viewMode() !== 'grid'"
                    class="px-3 py-2 rounded-md text-sm font-medium transition-all">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button (click)="viewMode.set('list')"
                    [class.bg-white]="viewMode() === 'list'"
                    [class.shadow-sm]="viewMode() === 'list'"
                    [class.text-gray-900]="viewMode() === 'list'"
                    [class.text-gray-600]="viewMode() !== 'list'"
                    class="px-3 py-2 rounded-md text-sm font-medium transition-all">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <!-- Add Book Button -->
          <button (click)="openAddBookModal()"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Yeni Kitap Ekle
          </button>
        </div>
      </div>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div *ngIf="isLoading(); else content">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <ng-template #content>
        <div *ngIf="testBooksWithCounts().length > 0; else noData">
          <!-- Grid View -->
          <div *ngIf="viewMode() === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let book of testBooksWithCounts()" 
                 [routerLink]="['/admin/test-books', book.id]"
                 class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-200 hover:border-primary-300 group">
              <!-- Book Cover Placeholder -->
              <div class="w-full h-48 bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-100 flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-primary-200/50 to-secondary-200/50"></div>
                <svg class="w-24 h-24 text-primary-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              
              <!-- Book Info -->
              <div class="p-4">
                <h3 class="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {{ book.name }}
                </h3>
                <div class="flex flex-wrap gap-1.5 mb-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {{ getExamTypeName(book.exam_type_id) }}
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {{ getLessonName(book.lesson_id) }}
                  </span>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div class="flex items-center text-xs text-gray-600">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span class="font-medium">{{ book.test_count ?? 0 }} test</span>
                  </div>
                  <span class="text-xs text-gray-500">{{ book.published_year }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div *ngIf="viewMode() === 'list'" class="bg-white shadow overflow-hidden sm:rounded-md">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kitap Adı</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sınav Türü</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ders</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Sayısı</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yayın Yılı</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let book of testBooksWithCounts()" 
                    [routerLink]="['/admin/test-books', book.id]"
                    class="hover:bg-gray-50 cursor-pointer">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ book.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {{ getExamTypeName(book.exam_type_id) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      {{ getLessonName(book.lesson_id) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ book.test_count ?? 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ book.published_year }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ng-template #noData>
          <div class="text-center py-12 bg-white rounded-lg shadow">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Henüz test kitabı yok</h3>
            <p class="mt-1 text-sm text-gray-500">İlk test kitabını ekleyerek başlayın.</p>
            <div class="mt-6">
              <button (click)="openAddBookModal()"
                      class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Yeni Test Kitabı Ekle
              </button>
            </div>
          </div>
        </ng-template>
      </ng-template>

      <!-- Test Book Create Modal -->
      <app-test-book-create-modal
        #testBookCreateModal
        (saved)="onBookSaved()"
        (closed)="onModalClosed()">
      </app-test-book-create-modal>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  testBooks = signal<TestBook[]>([]);
  testBooksWithCounts = signal<TestBookWithCount[]>([]);
  examTypes = signal<ExamType[]>([]);
  lessons = signal<Lesson[]>([]);
  subjects = signal<Subject[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');
  @ViewChild('testBookCreateModal') testBookCreateModalRef!: TestBookCreateModalComponent;
  private destroyRef = inject(DestroyRef);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Load books and related data in parallel
    forkJoin({
      books: this.adminService.listTestBooks(),
      examTypes: this.adminService.listExamTypes(),
      lessons: this.adminService.listLessons(),
      subjects: this.adminService.listSubjects()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (results) => {
        if (results.books.success && results.books.data) {
          this.testBooks.set(Array.isArray(results.books.data) ? results.books.data : []);
        }
        if (results.examTypes.success && results.examTypes.data) {
          this.examTypes.set(Array.isArray(results.examTypes.data) ? results.examTypes.data : []);
        }
        if (results.lessons.success && results.lessons.data) {
          this.lessons.set(Array.isArray(results.lessons.data) ? results.lessons.data : []);
        }
        if (results.subjects.success && results.subjects.data) {
          this.subjects.set(Array.isArray(results.subjects.data) ? results.subjects.data : []);
        }
        this.loadTestCounts();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.error?.message || 'Veriler yüklenirken bir hata oluştu.');
      }
    });
  }

  loadTestCounts(): void {
    const books = this.testBooks();
    if (books.length === 0) {
      this.isLoading.set(false);
      this.testBooksWithCounts.set([]);
      return;
    }

    // Load practice tests count for each book in parallel
    const countRequests = books.map(book =>
      this.adminService.listPracticeTests(book.id).pipe(
        map(response => ({
          book,
          count: response.success && response.data ? response.data.length : 0
        })),
        catchError(() => of({ book, count: 0 }))
      )
    );

    forkJoin(countRequests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (results) => {
        const booksWithCounts: TestBookWithCount[] = results.map(r => ({
          ...r.book,
          test_count: r.count
        }));
        this.testBooksWithCounts.set(booksWithCounts);
        this.isLoading.set(false);
      },
      error: () => {
        // If counts fail, still show books without counts
        this.testBooksWithCounts.set(books.map(b => ({ ...b, test_count: undefined })));
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

  openAddBookModal(): void {
    if (this.testBookCreateModalRef) {
      this.testBookCreateModalRef.open();
    }
  }

  onBookSaved(): void {
    this.loadData();
  }

  onModalClosed(): void {
    // Modal closed, no action needed
  }
}
