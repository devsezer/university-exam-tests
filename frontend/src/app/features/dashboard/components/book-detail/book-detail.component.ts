import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TestService } from '../../../tests/services/test.service';
import { TestBookDetail, PracticeTestWithStatus, Subject } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ResultModalComponent } from '../../../../shared/components/result-modal/result-modal.component';
import { CustomDropdownComponent, DropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent, ResultModalComponent, CustomDropdownComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <!-- Back Button -->
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
          <div *ngIf="bookDetail(); else notFound">
            <!-- Book Info Header -->
            <div class="bg-white shadow rounded-lg p-6 mb-6">
              <div class="flex flex-col md:flex-row gap-6">
                <!-- Book Cover -->
                <div class="flex-shrink-0">
                  <div class="w-48 h-72 bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-100 rounded-lg flex items-center justify-center shadow-md">
                    <svg class="w-32 h-32 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                </div>

                <!-- Book Info -->
                <div class="flex-1">
                  <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ bookDetail()!.name }}</h1>
                  
                  <div class="flex flex-wrap gap-2 mb-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {{ getExamTypeName(bookDetail()!.exam_type_id) }}
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {{ getLessonName(bookDetail()!.lesson_id) }}
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {{ bookDetail()!.published_year }}
                    </span>
                  </div>

                  <!-- Statistics Cards -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="text-sm text-gray-600">Toplam Test</div>
                      <div class="text-2xl font-bold text-gray-900 mt-1">{{ bookDetail()!.total_test_count }}</div>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4">
                      <div class="text-sm text-green-600">Çözülen</div>
                      <div class="text-2xl font-bold text-green-600 mt-1">{{ bookDetail()!.solved_test_count }}</div>
                    </div>
                    <div class="bg-primary-50 rounded-lg p-4">
                      <div class="text-sm text-primary-600">İlerleme</div>
                      <div class="text-2xl font-bold text-primary-600 mt-1">%{{ bookDetail()!.progress_percentage.toFixed(0) }}</div>
                    </div>
                    <div *ngIf="bookDetail()!.average_net_score !== undefined" class="bg-purple-50 rounded-lg p-4">
                      <div class="text-sm text-purple-600">Ortalama Net</div>
                      <div class="text-2xl font-bold text-purple-600 mt-1">{{ bookDetail()!.average_net_score!.toFixed(1) }}</div>
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="mt-4">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                      <div class="bg-primary-600 h-3 rounded-full transition-all duration-300" 
                           [style.width.%]="bookDetail()!.progress_percentage"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tests Section -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Testler</h2>
              </div>

              <!-- Subject Filter Card -->
              <div class="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-primary-200 shadow-md p-5 mx-6 mt-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="p-2 rounded-lg bg-primary-100">
                    <svg class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900">Konuya Göre Filtrele</h3>
                </div>
                
                <!-- Custom Dropdown -->
                <app-custom-dropdown
                  id="subject-filter"
                  [options]="subjectDropdownOptions()"
                  [ngModel]="selectedSubjectId()"
                  (ngModelChange)="selectedSubjectId.set($event)"
                  placeholder="Tüm Konular"
                  leftIcon="tag">
                </app-custom-dropdown>
              </div>

              <!-- Tests List -->
              <div *ngIf="filteredTests().length > 0; else noTests" class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div *ngFor="let test of filteredTests()" 
                       class="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-md transition-all flex flex-col">
                    <!-- Card Content -->
                    <div class="p-4 flex-1">
                      <div class="flex items-start justify-between mb-2">
                        <div>
                          <h3 class="text-lg font-semibold text-gray-900">{{ test.name }}</h3>
                          <p class="text-sm text-gray-500">Test #{{ test.test_number }}</p>
                        </div>
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {{ getSubjectName(test.subject_id) }}
                        </span>
                      </div>
                      
                      <div class="text-sm text-gray-600 mb-3">
                        {{ test.question_count }} soru
                      </div>

                      <!-- Status Info -->
                      <div>
                        <!-- Available Test -->
                        <div *ngIf="test.status === 'available'">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Çözülebilir
                          </span>
                        </div>
                        
                        <!-- Solved Test -->
                        <div *ngIf="test.status === 'solved'">
                          <div class="flex items-center gap-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Çözüldü
                            </span>
                            <span *ngIf="test.last_solved_at" class="text-xs text-gray-500">
                              {{ formatDate(test.last_solved_at) }}
                            </span>
                          </div>
                        </div>
                        
                        <!-- Waiting Test -->
                        <div *ngIf="test.status === 'waiting'">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Beklemede
                            </span>
                          </div>
                          <div *ngIf="test.hours_until_retake" class="text-xs text-gray-500">
                            {{ formatHours(test.hours_until_retake) }} sonra tekrar çözülebilir
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Footer with Actions -->
                    <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
                      <!-- Available Test -->
                      <div *ngIf="test.status === 'available'">
                        <a [routerLink]="['/tests/solve', test.id]"
                           class="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors">
                          Çöz
                        </a>
                      </div>
                      
                      <!-- Solved Test -->
                      <div *ngIf="test.status === 'solved'" class="flex items-center gap-2">
                        <button *ngIf="test.result_id" 
                                (click)="openResultModal(test.result_id)"
                                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          Sonuçlar
                        </button>
                        <!-- Show "Tekrar Çöz" if 24 hours have passed (hours_until_retake is null/undefined) -->
                        <a *ngIf="!test.hours_until_retake" 
                           [routerLink]="['/tests/solve', test.id]"
                           class="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                          Tekrar Çöz
                        </a>
                      </div>
                      
                      <!-- Waiting Test -->
                      <div *ngIf="test.status === 'waiting'">
                        <button *ngIf="test.result_id" 
                                (click)="openResultModal(test.result_id)"
                                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          Sonuçlar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ng-template #noTests>
                <div class="p-12 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">
                    {{ selectedSubjectId() && selectedSubjectId() !== '' ? 'Bu konuda test bulunamadı' : 'Bu kitapta henüz test bulunmuyor' }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ selectedSubjectId() && selectedSubjectId() !== '' ? 'Filtreyi temizleyip tekrar deneyin.' : 'Testler eklendikçe burada görünecek.' }}
                  </p>
                  <div *ngIf="selectedSubjectId() && selectedSubjectId() !== ''" class="mt-4">
                    <button (click)="selectedSubjectId.set('')"
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                      Filtreyi Temizle
                    </button>
                  </div>
                </div>
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
      </div>
    </div>

    <!-- Result Modal -->
    <app-result-modal 
      [resultId]="selectedResultId()"
      (closed)="closeResultModal()">
    </app-result-modal>
  `,
  styles: []
})
export class BookDetailComponent implements OnInit {
  bookDetail = signal<TestBookDetail | null>(null);
  practiceTests = signal<PracticeTestWithStatus[]>([]);
  subjects = signal<Subject[]>([]);
  examTypes = signal<any[]>([]);
  lessons = signal<any[]>([]);
  
  selectedSubjectId = signal<string>('');
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  selectedResultId = signal<string | null>(null);

  filteredTests = computed(() => {
    const filter = this.selectedSubjectId();
    const tests = this.practiceTests();
    if (!filter || filter === '') {
      return tests;
    }
    return tests.filter(test => test.subject_id === filter);
  });

  availableSubjectIds = computed(() => {
    const book = this.bookDetail();
    return book?.subject_ids || [];
  });

  subjectDropdownOptions = computed<DropdownOption[]>(() => {
    const options: DropdownOption[] = [
      { value: '', label: 'Tüm Konular' }
    ];
    const subjectIds = this.availableSubjectIds();
    const subjects = this.subjects();
    
    subjectIds.forEach(subjectId => {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) {
        options.push({
          value: subjectId,
          label: subject.name
        });
      }
    });
    
    return options;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBookDetail(bookId);
      this.loadRelatedData();
    } else {
      this.errorMessage.set('Kitap ID bulunamadı.');
      this.isLoading.set(false);
    }
  }

  loadBookDetail(bookId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Load test book basic info and tests with status separately
    // For now, we'll use the existing endpoints and combine them
    // In the future, we can add a dedicated endpoint
    
    // First, get test books with stats to get the book info
    this.testService.getTestBooksWithStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const book = response.data.find(b => b.id === bookId);
          if (book) {
            // Now load tests with status
            this.loadTestsWithStatus(bookId, book);
          } else {
            this.isLoading.set(false);
            this.errorMessage.set('Kitap bulunamadı.');
          }
        } else {
          this.isLoading.set(false);
          this.errorMessage.set('Kitap yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Kitap yüklenirken bir hata oluştu.');
      }
    });
  }

  loadTestsWithStatus(bookId: string, book: any): void {
    this.testService.getPracticeTestsWithStatus(bookId).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.practiceTests.set(response.data);
          
          // Combine book info with tests
          const bookDetail: TestBookDetail = {
            ...book,
            tests: response.data,
            average_net_score: undefined // Can be calculated later if needed
          };
          
          this.bookDetail.set(bookDetail);
        } else {
          this.errorMessage.set('Testler yüklenemedi.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Testler yüklenirken bir hata oluştu.');
      }
    });
  }

  loadRelatedData(): void {
    // Load exam types and lessons for display
    this.testService.getExamTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.examTypes.set(response.data);
        }
      }
    });

    this.testService.getLessons().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lessons.set(response.data);
        }
      }
    });

    // Load subjects for filter
    this.testService.getSubjects().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subjects.set(response.data);
        }
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
    return subject?.name || 'Bilinmeyen Konu';
  }


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatHours(hours: number): string {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60);
      return `${minutes} dakika`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours - wholeHours) * 60);
    if (minutes > 0) {
      return `${wholeHours} saat ${minutes} dakika`;
    }
    return `${wholeHours} saat`;
  }

  openResultModal(resultId: string): void {
    this.selectedResultId.set(resultId);
  }

  closeResultModal(): void {
    this.selectedResultId.set(null);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

