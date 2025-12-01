import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TestService } from '../../services/test.service';
import { ExamType, Lesson, Subject, TestBook, PracticeTest, PracticeTestsGrouped } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-test-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Test Seç</h1>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <!-- Breadcrumb Navigation -->
      <div class="mb-6 flex items-center space-x-2 text-sm text-gray-600">
        <span [class.text-primary-600]="currentStep() >= 1" [class.font-semibold]="currentStep() >= 1">
          1. Sınav Türü Seç
        </span>
        <span *ngIf="currentStep() >= 2">→</span>
        <span [class.text-primary-600]="currentStep() >= 2" [class.font-semibold]="currentStep() >= 2">
          2. Kitap Seç
        </span>
        <span *ngIf="currentStep() >= 3">→</span>
        <span [class.text-primary-600]="currentStep() >= 3" [class.font-semibold]="currentStep() >= 3">
          3. Test Seç
        </span>
      </div>

      <!-- Step 1: Exam Type + Lesson Selection -->
      <div *ngIf="currentStep() === 1" class="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sınav Türü</label>
          <select [(ngModel)]="selectedExamTypeId" 
                  (change)="onExamTypeChange()"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
            <option [value]="null">Sınav türü seçiniz</option>
            <option *ngFor="let examType of examTypes()" [value]="examType.id">
              {{ examType.name }}
            </option>
          </select>
        </div>

        <div *ngIf="selectedExamTypeId">
          <label class="block text-sm font-medium text-gray-700 mb-2">Ders</label>
          <select [(ngModel)]="selectedLessonId" 
                  (change)="onLessonChange()"
                  [disabled]="!selectedExamTypeId || isLoadingLessons()"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100">
            <option [value]="null">Ders seçiniz</option>
            <option *ngFor="let lesson of lessons()" [value]="lesson.id">
              {{ lesson.name }}
            </option>
          </select>
          <app-loading-spinner *ngIf="isLoadingLessons()"></app-loading-spinner>
        </div>
      </div>

      <!-- Step 2: Book Selection (Grid View) -->
      <div *ngIf="currentStep() === 2" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Test Kitabı Seçin</h2>
          <button (click)="goBack()" 
                  class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            ← Geri
          </button>
        </div>

        <div *ngIf="isLoadingTestBooks()" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div *ngFor="let _ of [1,2,3,4,5,6,7,8]" class="bg-gray-200 animate-pulse rounded-lg h-80"></div>
        </div>

        <div *ngIf="!isLoadingTestBooks() && testBooks().length === 0" class="bg-white shadow rounded-lg p-12 text-center">
          <p class="text-gray-500 text-lg">Bu sınav türü ve ders için test kitabı bulunamadı.</p>
        </div>

        <div *ngIf="!isLoadingTestBooks() && testBooks().length > 0" 
             class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div *ngFor="let book of testBooks()" 
               (click)="selectBook(book.id)"
               class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group">
            <!-- Placeholder Book Cover -->
            <div class="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative overflow-hidden">
              <img [src]="getPlaceholderImage()" 
                   [alt]="book.name"
                   class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="hidden w-full h-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <svg class="w-24 h-24 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
            </div>
            <!-- Book Info -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {{ book.name }}
              </h3>
              <p class="text-sm text-gray-500">{{ book.published_year }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Test List (Grouped by Subject) -->
      <div *ngIf="currentStep() === 3" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Test Seçin</h2>
          <button (click)="goBack()" 
                  class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            ← Geri
          </button>
        </div>

        <div *ngIf="isLoadingPracticeTests()" class="bg-white shadow rounded-lg p-6 space-y-4">
          <div *ngFor="let _ of [1,2,3]" class="animate-pulse">
            <div class="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div class="space-y-2">
              <div class="h-12 bg-gray-100 rounded"></div>
              <div class="h-12 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoadingPracticeTests() && practiceTestsGrouped().size === 0" 
             class="bg-white shadow rounded-lg p-12 text-center">
          <p class="text-gray-500 text-lg">Bu kitap için test bulunamadı.</p>
        </div>

        <div *ngIf="!isLoadingPracticeTests() && practiceTestsGrouped().size > 0" 
             class="space-y-4">
          <div *ngFor="let entry of practiceTestsGrouped() | keyvalue" 
               class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Subject Header -->
            <div class="bg-primary-50 px-6 py-4 border-b border-primary-100">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ getSubjectName(entry.key) }}
              </h3>
            </div>
            <!-- Tests List -->
            <div class="p-4 space-y-2">
              <button *ngFor="let test of entry.value"
                      (click)="startTest(test.id)"
                      class="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-gray-900 group-hover:text-primary-600">
                    {{ test.name }}
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ test.question_count }} soru
                  </span>
                </div>
              </button>
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
export class TestSelectorComponent {
  examTypes = signal<ExamType[]>([]);
  lessons = signal<Lesson[]>([]);
  subjects = signal<Subject[]>([]);
  testBooks = signal<TestBook[]>([]);
  practiceTestsGrouped = signal<Map<string, PracticeTest[]>>(new Map());
  subjectsMap = signal<Map<string, Subject>>(new Map());

  selectedExamTypeId: string | null = null;
  selectedLessonId: string | null = null;
  selectedTestBookId: string | null = null;

  currentStep = signal<1 | 2 | 3>(1);

  isLoadingLessons = signal(false);
  isLoadingTestBooks = signal(false);
  isLoadingPracticeTests = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private testService: TestService,
    private router: Router
  ) {
    this.loadExamTypes();
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

  onExamTypeChange(): void {
    this.selectedLessonId = null;
    this.selectedTestBookId = null;
    this.lessons.set([]);
    this.testBooks.set([]);
    this.practiceTestsGrouped.set(new Map());
    this.currentStep.set(1);

    if (this.selectedExamTypeId) {
      this.isLoadingLessons.set(true);
      this.testService.getLessons().subscribe({
        next: (response) => {
          this.isLoadingLessons.set(false);
          if (response.success && response.data) {
            this.lessons.set(response.data);
          }
        },
        error: () => {
          this.isLoadingLessons.set(false);
          this.errorMessage.set('Dersler yüklenemedi.');
        }
      });
    }
  }

  onLessonChange(): void {
    this.selectedTestBookId = null;
    this.testBooks.set([]);
    this.practiceTestsGrouped.set(new Map());

    if (this.selectedLessonId && this.selectedExamTypeId) {
      // Load subjects for this lesson and exam type (for subject names later)
      this.testService.getSubjects(this.selectedExamTypeId, this.selectedLessonId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const subjectsMap = new Map<string, Subject>();
            response.data.forEach(subject => {
              subjectsMap.set(subject.id, subject);
            });
            this.subjectsMap.set(subjectsMap);
          }
        },
        error: () => {
          // Non-critical error, continue anyway
        }
      });

      // Load test books and move to step 2
      this.isLoadingTestBooks.set(true);
      this.testService.getTestBooks(this.selectedExamTypeId, this.selectedLessonId).subscribe({
        next: (response) => {
          this.isLoadingTestBooks.set(false);
          if (response.success && response.data) {
            this.testBooks.set(response.data);
            this.currentStep.set(2);
          }
        },
        error: () => {
          this.isLoadingTestBooks.set(false);
          this.errorMessage.set('Test kitapları yüklenemedi.');
        }
      });
    }
  }

  selectBook(bookId: string): void {
    this.selectedTestBookId = bookId;
    this.practiceTestsGrouped.set(new Map());
    this.currentStep.set(3);

    this.isLoadingPracticeTests.set(true);
    this.testService.getPracticeTestsGrouped(bookId).subscribe({
      next: (response) => {
        this.isLoadingPracticeTests.set(false);
        if (response.success && response.data) {
          // Convert object to Map
          const groupedMap = new Map<string, PracticeTest[]>();
          const data = response.data;
          Object.keys(data).forEach(subjectId => {
            if (data[subjectId]) {
              groupedMap.set(subjectId, data[subjectId]);
            }
          });
          this.practiceTestsGrouped.set(groupedMap);
        }
      },
      error: () => {
        this.isLoadingPracticeTests.set(false);
        this.errorMessage.set('Testler yüklenemedi.');
      }
    });
  }

  getSubjectName(subjectId: string): string {
    const subject = this.subjectsMap().get(subjectId);
    return subject ? subject.name : 'Bilinmeyen Konu';
  }

  getPlaceholderImage(): string {
    // Using placeholder.com service
    return 'https://via.placeholder.com/200x300/6366f1/ffffff?text=Kitap+Kapağı';
  }

  goBack(): void {
    if (this.currentStep() === 3) {
      this.currentStep.set(2);
      this.selectedTestBookId = null;
      this.practiceTestsGrouped.set(new Map());
    } else if (this.currentStep() === 2) {
      this.currentStep.set(1);
      this.selectedLessonId = null;
      this.testBooks.set([]);
    }
  }

  startTest(testId: string): void {
    if (testId) {
      this.router.navigate(['/tests/solve', testId]);
    }
  }
}
