import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TestService } from '../../../tests/services/test.service';
import { ResultsService } from '../../../results/services/results.service';
import { TestBookWithStats, ExamType, Lesson, TestResult } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { CustomDropdownComponent, DropdownOption } from '../../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent, CustomDropdownComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50">
      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Header -->
          <div class="mb-8 animate-fade-in">
            <h1 class="text-4xl font-extrabold text-gradient-primary mb-3">
              Hoş geldiniz, {{ user()?.username }}!
            </h1>
            <p class="mt-2 text-base text-gray-700">
              Deneme testlerinizi çözün ve sonuçlarınızı takip edin.
            </p>
          </div>

          <!-- Main Content with Sidebar -->
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Main Content Area -->
            <div class="flex-1">

          <!-- Filters and View Toggle -->
          <div class="mb-6 bg-white rounded-lg shadow-md p-6">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <!-- Filters -->
              <div class="flex flex-col sm:flex-row gap-4 flex-1">
                <div class="flex-1">
                  <app-custom-dropdown
                    id="exam-type-filter"
                    label="Sınav Türü"
                    [options]="examTypeOptions()"
                    [ngModel]="selectedExamTypeId"
                    (ngModelChange)="onExamTypeChange($event)"
                    placeholder="Tümü"
                    leftIcon="tag">
                  </app-custom-dropdown>
                </div>
                <div class="flex-1">
                  <app-custom-dropdown
                    id="lesson-filter"
                    label="Ders"
                    [options]="lessonOptions()"
                    [ngModel]="selectedLessonId"
                    (ngModelChange)="onLessonChange($event)"
                    [disabled]="!selectedExamTypeId"
                    placeholder="Tümü"
                    leftIcon="tag">
                  </app-custom-dropdown>
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ara</label>
                  <input type="text" 
                         [(ngModel)]="searchTerm"
                         (input)="onSearchChange()"
                         placeholder="Kitap adında ara..."
                         class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                </div>
              </div>

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
            </div>

            <!-- Active Filters -->
            <div *ngIf="hasActiveFilters()" class="mt-4 flex flex-wrap gap-2">
              <span *ngIf="selectedExamTypeId" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {{ getExamTypeName(selectedExamTypeId) }}
                <button (click)="clearExamTypeFilter()" class="ml-2 text-blue-600 hover:text-blue-800">×</button>
              </span>
              <span *ngIf="selectedLessonId" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {{ getLessonName(selectedLessonId) }}
                <button (click)="clearLessonFilter()" class="ml-2 text-green-600 hover:text-green-800">×</button>
              </span>
              <span *ngIf="searchTerm" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                "{{ searchTerm }}"
                <button (click)="clearSearch()" class="ml-2 text-purple-600 hover:text-purple-800">×</button>
              </span>
              <button (click)="clearAllFilters()" 
                      class="text-sm text-gray-600 hover:text-gray-900 underline">
                Tümünü Temizle
              </button>
            </div>
          </div>

          <app-error-message [message]="errorMessage()"></app-error-message>

          <div *ngIf="isLoading(); else content">
            <app-loading-spinner></app-loading-spinner>
          </div>

          <ng-template #content>
            <div *ngIf="testBooks().length > 0; else noData">
              <!-- Grid View -->
              <div *ngIf="viewMode() === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div *ngFor="let book of testBooks()" 
                     [routerLink]="['/dashboard/books', book.id]"
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
                    <div class="space-y-2 pt-3 border-t border-gray-200">
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-600">Toplam Test</span>
                        <span class="font-medium text-gray-900">{{ book.total_test_count }}</span>
                      </div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-600">Çözülen</span>
                        <span class="font-medium text-green-600">{{ book.solved_test_count }}</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                             [style.width.%]="book.progress_percentage"></div>
                      </div>
                      <div class="text-xs text-gray-500 text-right">
                        %{{ book.progress_percentage.toFixed(0) }}
                      </div>
                    </div>
                    <div class="mt-3 text-xs text-gray-500">
                      {{ book.published_year }}
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
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Test</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çözülen</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İlerleme</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yayın Yılı</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let book of testBooks()" 
                        [routerLink]="['/dashboard/books', book.id]"
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
                        {{ book.total_test_count }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {{ book.solved_test_count }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <div class="w-24 bg-gray-200 rounded-full h-2">
                            <div class="bg-primary-600 h-2 rounded-full" 
                                 [style.width.%]="book.progress_percentage"></div>
                          </div>
                          <span class="text-xs text-gray-600">%{{ book.progress_percentage.toFixed(0) }}</span>
                        </div>
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
                <h3 class="mt-2 text-sm font-medium text-gray-900">
                  {{ hasActiveFilters() ? 'Bu kriterlere uygun kitap bulunamadı' : 'Henüz kitap bulunmuyor' }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  {{ hasActiveFilters() ? 'Filtreleri temizleyip tekrar deneyin.' : 'İlk test kitabı eklenene kadar bekleyin.' }}
                </p>
                <div *ngIf="hasActiveFilters()" class="mt-6">
                  <button (click)="clearAllFilters()"
                          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
            </ng-template>
          </ng-template>
            </div>

            <!-- Sidebar -->
            <div class="lg:w-80 flex-shrink-0">
              <div class="sticky top-6 space-y-6">
                <!-- Statistics Cards -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div class="bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-3">
                    <h2 class="text-lg font-semibold text-white">İstatistikler</h2>
                  </div>
                  <div class="p-4 space-y-4">
                    <!-- Total Solved Tests -->
                    <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-blue-100">
                          <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs font-medium text-gray-600">Toplam Çözülen</p>
                          <p class="text-xl font-bold text-gray-900">{{ totalSolvedTests() }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- This Month Solved Tests -->
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-green-100">
                          <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs font-medium text-gray-600">Bu Ay</p>
                          <p class="text-xl font-bold text-gray-900">{{ thisMonthSolvedTests() }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Average Net Score -->
                    <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-purple-100">
                          <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs font-medium text-gray-600">Ortalama Net</p>
                          <p class="text-xl font-bold text-gray-900">{{ averageNetScore().toFixed(1) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Recent Activities List -->
                <div *ngIf="recentActivities().length > 0" class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div class="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3">
                    <h2 class="text-lg font-semibold text-white">Son Aktiviteler</h2>
                  </div>
                  <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
                    <div *ngFor="let activity of recentActivities()" 
                         class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                         [routerLink]="['/results', activity.id]">
                      <div class="flex-shrink-0">
                        <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <svg class="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">Test Çözüldü</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(activity.solved_at) }}</p>
                        <div class="mt-2 flex items-center justify-between">
                          <span class="text-xs font-semibold text-gray-900">Net: {{ activity.net_score.toFixed(2) }}</span>
                          <span class="text-xs text-gray-500">
                            {{ activity.correct_count }}D / {{ activity.wrong_count }}Y / {{ activity.empty_count }}B
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  testService = inject(TestService);
  resultsService = inject(ResultsService);
  
  user = this.authService.user;
  isAdmin = computed(() => this.authService.isAdmin());

  testBooks = signal<TestBookWithStats[]>([]);
  examTypes = signal<ExamType[]>([]);
  lessons = signal<Lesson[]>([]);
  allResults = signal<TestResult[]>([]);
  
  selectedExamTypeId: string | null = null;
  selectedLessonId: string | null = null;
  searchTerm = signal<string>('');
  
  viewMode = signal<'grid' | 'list'>('grid');
  isLoading = signal(true);
  isLoadingStats = signal(true);
  errorMessage = signal<string | null>(null);

  totalSolvedTests = computed(() => {
    return this.allResults().length;
  });

  thisMonthSolvedTests = computed(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return this.allResults().filter(result => {
      const solvedDate = new Date(result.solved_at);
      return solvedDate >= firstDayOfMonth;
    }).length;
  });

  averageNetScore = computed(() => {
    const results = this.allResults();
    if (results.length === 0) return 0;
    
    const sum = results.reduce((acc, result) => acc + result.net_score, 0);
    return sum / results.length;
  });

  recentActivities = computed(() => {
    return this.allResults()
      .sort((a, b) => new Date(b.solved_at).getTime() - new Date(a.solved_at).getTime())
      .slice(0, 5);
  });

  hasActiveFilters = computed(() => {
    return !!this.selectedExamTypeId || !!this.selectedLessonId || !!this.searchTerm();
  });

  examTypeOptions = computed<DropdownOption[]>(() => {
    const options: DropdownOption[] = [
      { value: null, label: 'Tümü' }
    ];
    this.examTypes().forEach(examType => {
      options.push({
        value: examType.id,
        label: examType.name
      });
    });
    return options;
  });

  lessonOptions = computed<DropdownOption[]>(() => {
    const options: DropdownOption[] = [
      { value: null, label: 'Tümü' }
    ];
    this.lessons().forEach(lesson => {
      options.push({
        value: lesson.id,
        label: lesson.name
      });
    });
    return options;
  });

  constructor() {
    // Load view mode preference from localStorage
    const savedViewMode = localStorage.getItem('dashboard_view_mode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      this.viewMode.set(savedViewMode);
    }

    // Save view mode preference when it changes
    effect(() => {
      localStorage.setItem('dashboard_view_mode', this.viewMode());
    });
  }

  ngOnInit(): void {
    // Admin kullanıcıları doğrudan admin paneline yönlendir
    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
      return;
    }

    this.loadExamTypes();
    this.loadLessons();
    this.loadTestBooks();
    this.loadStatistics();
  }

  loadExamTypes(): void {
    this.testService.getExamTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.examTypes.set(response.data);
        }
      },
      error: () => {
        this.errorMessage.set('Sınav türleri yüklenemedi.');
      }
    });
  }

  loadLessons(): void {
    this.testService.getLessons().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lessons.set(response.data);
        }
      },
      error: () => {
        // Don't show error for lessons, just set empty array
        this.lessons.set([]);
      }
    });
  }

  onExamTypeChange(value: string | null): void {
    this.selectedExamTypeId = value;
    this.selectedLessonId = null;
    // Lessons are already loaded, no need to reload
    this.loadTestBooks();
  }

  onLessonChange(value: string | null): void {
    this.selectedLessonId = value;
    this.loadTestBooks();
  }

  onSearchChange(): void {
    this.loadTestBooks();
  }

  loadTestBooks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const search = this.searchTerm().trim() || undefined;
    
    this.testService.getTestBooksWithStats(
      this.selectedExamTypeId || undefined,
      this.selectedLessonId || undefined,
      search
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.testBooks.set(response.data);
        } else {
          this.testBooks.set([]);
          this.errorMessage.set(response.error?.message || 'Kitaplar yüklenemedi.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.testBooks.set([]);
        this.errorMessage.set(error.error?.error?.message || 'Kitaplar yüklenirken bir hata oluştu.');
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

  clearExamTypeFilter(): void {
    this.selectedExamTypeId = null;
    this.selectedLessonId = null;
    // Lessons are already loaded, no need to clear
    this.loadTestBooks();
  }

  clearLessonFilter(): void {
    this.selectedLessonId = null;
    this.loadTestBooks();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.loadTestBooks();
  }

  clearAllFilters(): void {
    this.selectedExamTypeId = null;
    this.selectedLessonId = null;
    this.lessons.set([]);
    this.searchTerm.set('');
    this.loadTestBooks();
  }

  loadStatistics(): void {
    this.isLoadingStats.set(true);
    // Load all results (with pagination if needed)
    // For now, load first 100 results to calculate statistics
    this.resultsService.getMyResults().subscribe({
      next: (response) => {
        this.isLoadingStats.set(false);
        if (response.success && response.data) {
          this.allResults.set(response.data);
        }
      },
      error: () => {
        this.isLoadingStats.set(false);
        // Don't show error for stats, just set empty array
        this.allResults.set([]);
      }
    });
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
}
