import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TestService } from '../../services/test.service';
import { ExamType, Lesson, Subject, TestBook, PracticeTest } from '../../../../models/test.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-test-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Test Seç</h1>

      <app-error-message [message]="errorMessage()"></app-error-message>

      <div class="bg-white shadow rounded-lg p-6 space-y-6">
        <!-- Exam Type Selection -->
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

        <!-- Lesson Selection -->
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

        <!-- Subject Selection -->
        <div *ngIf="selectedLessonId">
          <label class="block text-sm font-medium text-gray-700 mb-2">Konu</label>
          <select [(ngModel)]="selectedSubjectId" 
                  (change)="onSubjectChange()"
                  [disabled]="!selectedLessonId || isLoadingSubjects()"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100">
            <option [value]="null">Konu seçiniz</option>
            <option *ngFor="let subject of subjects()" [value]="subject.id">
              {{ subject.name }}
            </option>
          </select>
          <app-loading-spinner *ngIf="isLoadingSubjects()"></app-loading-spinner>
        </div>

        <!-- Test Book Selection -->
        <div *ngIf="selectedSubjectId">
          <label class="block text-sm font-medium text-gray-700 mb-2">Test Kitabı</label>
          <select [(ngModel)]="selectedTestBookId" 
                  (change)="onTestBookChange()"
                  [disabled]="!selectedSubjectId || isLoadingTestBooks()"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100">
            <option [value]="null">Test kitabı seçiniz</option>
            <option *ngFor="let testBook of testBooks()" [value]="testBook.id">
              {{ testBook.name }} ({{ testBook.published_year }})
            </option>
          </select>
          <app-loading-spinner *ngIf="isLoadingTestBooks()"></app-loading-spinner>
        </div>

        <!-- Practice Test Selection -->
        <div *ngIf="selectedTestBookId">
          <label class="block text-sm font-medium text-gray-700 mb-2">Deneme Testi</label>
          <select [(ngModel)]="selectedPracticeTestId" 
                  [disabled]="!selectedTestBookId || isLoadingPracticeTests()"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100">
            <option [value]="null">Deneme testi seçiniz</option>
            <option *ngFor="let practiceTest of practiceTests()" [value]="practiceTest.id">
              {{ practiceTest.name }} ({{ practiceTest.question_count }} soru)
            </option>
          </select>
          <app-loading-spinner *ngIf="isLoadingPracticeTests()"></app-loading-spinner>
        </div>

        <!-- Start Test Button -->
        <div *ngIf="selectedPracticeTestId" class="pt-4">
          <button (click)="startTest()" 
                  [disabled]="!selectedPracticeTestId"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
            Testi Başlat
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TestSelectorComponent {
  examTypes = signal<ExamType[]>([]);
  lessons = signal<Lesson[]>([]);
  subjects = signal<Subject[]>([]);
  testBooks = signal<TestBook[]>([]);
  practiceTests = signal<PracticeTest[]>([]);

  selectedExamTypeId: string | null = null;
  selectedLessonId: string | null = null;
  selectedSubjectId: string | null = null;
  selectedTestBookId: string | null = null;
  selectedPracticeTestId: string | null = null;

  isLoadingLessons = signal(false);
  isLoadingSubjects = signal(false);
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
      error: (error) => {
        this.errorMessage.set('Sınav türleri yüklenemedi.');
      }
    });
  }

  onExamTypeChange(): void {
    this.selectedLessonId = null;
    this.selectedSubjectId = null;
    this.selectedTestBookId = null;
    this.selectedPracticeTestId = null;
    this.lessons.set([]);
    this.subjects.set([]);
    this.testBooks.set([]);
    this.practiceTests.set([]);

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
    this.selectedSubjectId = null;
    this.selectedTestBookId = null;
    this.selectedPracticeTestId = null;
    this.subjects.set([]);
    this.testBooks.set([]);
    this.practiceTests.set([]);

    if (this.selectedLessonId && this.selectedExamTypeId) {
      this.isLoadingSubjects.set(true);
      this.testService.getSubjects(this.selectedExamTypeId, this.selectedLessonId).subscribe({
        next: (response) => {
          this.isLoadingSubjects.set(false);
          if (response.success && response.data) {
            this.subjects.set(response.data);
          }
        },
        error: () => {
          this.isLoadingSubjects.set(false);
          this.errorMessage.set('Konular yüklenemedi.');
        }
      });
    }
  }

  onSubjectChange(): void {
    this.selectedTestBookId = null;
    this.selectedPracticeTestId = null;
    this.testBooks.set([]);
    this.practiceTests.set([]);

    if (this.selectedSubjectId) {
      this.isLoadingTestBooks.set(true);
      this.testService.getTestBooks(this.selectedSubjectId).subscribe({
        next: (response) => {
          this.isLoadingTestBooks.set(false);
          if (response.success && response.data) {
            this.testBooks.set(response.data);
          }
        },
        error: () => {
          this.isLoadingTestBooks.set(false);
          this.errorMessage.set('Test kitapları yüklenemedi.');
        }
      });
    }
  }

  onTestBookChange(): void {
    this.selectedPracticeTestId = null;
    this.practiceTests.set([]);

    if (this.selectedTestBookId) {
      this.isLoadingPracticeTests.set(true);
      this.testService.getPracticeTests(this.selectedTestBookId).subscribe({
        next: (response) => {
          this.isLoadingPracticeTests.set(false);
          if (response.success && response.data) {
            this.practiceTests.set(response.data);
          }
        },
        error: () => {
          this.isLoadingPracticeTests.set(false);
          this.errorMessage.set('Deneme testleri yüklenemedi.');
        }
      });
    }
  }

  startTest(): void {
    if (this.selectedPracticeTestId) {
      this.router.navigate(['/tests/solve', this.selectedPracticeTestId]);
    }
  }
}
