# Admin Panel Geliştirme Planı

## Genel Bakış

Backend'de rol tabanlı authentication sistemi mevcut ve admin endpoint'leri hazır. Bu plan, frontend'de admin paneli oluşturmayı ve rol tabanlı erişim kontrolünü implementasyonunu içermektedir.

## Backend RBAC Sistemi Analizi

### Roller
- `super_admin`: Tüm izinlere sahip
- `admin`: Kullanıcı yönetimi ve test yönetimi izinleri
- `user`: Temel authenticated erişim

### JWT Token Yapısı
- `roles`: Kullanıcının rolleri (string array)
- `permissions`: Kullanıcının izinleri (string array)

### Admin Endpoint'leri

#### Exam Types (Sınav Türleri)
- `POST /api/v1/admin/exam-types` - Yeni sınav türü oluştur
- `GET /api/v1/admin/exam-types/{id}` - Sınav türü detayı
- `PUT /api/v1/admin/exam-types/{id}` - Sınav türü güncelle
- `DELETE /api/v1/admin/exam-types/{id}` - Sınav türü sil
- `GET /api/v1/exam-types` - Tüm sınav türlerini listele (public)

#### Subjects (Ders Konuları)
- `POST /api/v1/admin/subjects` - Yeni ders konusu oluştur
- `GET /api/v1/admin/subjects/{id}` - Ders konusu detayı
- `PUT /api/v1/admin/subjects/{id}` - Ders konusu güncelle
- `DELETE /api/v1/admin/subjects/{id}` - Ders konusu sil
- `GET /api/v1/subjects?exam_type_id={id}` - Ders konularını listele (public)

#### Test Books (Test Kitapları)
- `POST /api/v1/admin/test-books` - Yeni test kitabı oluştur
- `GET /api/v1/admin/test-books/{id}` - Test kitabı detayı
- `PUT /api/v1/admin/test-books/{id}` - Test kitabı güncelle
- `DELETE /api/v1/admin/test-books/{id}` - Test kitabı sil
- `GET /api/v1/test-books?subject_id={id}` - Test kitaplarını listele (public)

#### Practice Tests (Deneme Testleri)
- `POST /api/v1/admin/practice-tests` - Yeni deneme testi oluştur
- `GET /api/v1/admin/practice-tests/{id}` - Deneme testi detayı
- `PUT /api/v1/admin/practice-tests/{id}` - Deneme testi güncelle
- `DELETE /api/v1/admin/practice-tests/{id}` - Deneme testi sil
- `GET /api/v1/practice-tests?test_book_id={id}` - Deneme testlerini listele (public)

## Frontend Geliştirme Planı

### 1. Auth Service Geliştirmeleri

**Dosya:** `frontend/src/app/core/services/auth.service.ts`

**Eklemeler:**
- `isAdmin()` computed signal: Kullanıcının admin veya super_admin rolüne sahip olup olmadığını kontrol eder
- `isSuperAdmin()` computed signal: Kullanıcının super_admin rolüne sahip olup olmadığını kontrol eder
- `hasRole(role: string)` computed signal: Belirli bir role sahip olup olmadığını kontrol eder
- `hasPermission(permission: string)` computed signal: Belirli bir izne sahip olup olmadığını kontrol eder

**Kod Örneği:**
```typescript
readonly isAdmin = computed(() => {
  const user = this.user();
  return user?.roles?.some(r => r.name === 'admin' || r.name === 'super_admin') ?? false;
});

readonly isSuperAdmin = computed(() => {
  const user = this.user();
  return user?.roles?.some(r => r.name === 'super_admin') ?? false;
});

hasRole(role: string): boolean {
  const user = this.user();
  return user?.roles?.some(r => r.name === role) ?? false;
}

hasPermission(permission: string): boolean {
  const user = this.user();
  return user?.roles?.some(r => r.permissions?.includes(permission)) ?? false;
}
```

### 2. Admin Guard Oluşturma

**Dosya:** `frontend/src/app/core/guards/admin.guard.ts`

**Özellikler:**
- Kullanıcının authenticated olup olmadığını kontrol eder
- Kullanıcının admin veya super_admin rolüne sahip olup olmadığını kontrol eder
- Eğer admin değilse dashboard'a yönlendirir

**Kod Örneği:**
```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (!authService.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
```

### 3. Admin Service Oluşturma

**Dosya:** `frontend/src/app/features/admin/services/admin.service.ts`

**Metodlar:**

#### Exam Types
- `createExamType(data: CreateExamTypeRequest): Observable<ApiResponse<ExamType>>`
- `updateExamType(id: string, data: UpdateExamTypeRequest): Observable<ApiResponse<ExamType>>`
- `deleteExamType(id: string): Observable<ApiResponse<void>>`
- `getExamType(id: string): Observable<ApiResponse<ExamType>>`
- `listExamTypes(): Observable<ApiResponse<ExamType[]>>` (public endpoint kullanılabilir)

#### Subjects
- `createSubject(data: CreateSubjectRequest): Observable<ApiResponse<Subject>>`
- `updateSubject(id: string, data: UpdateSubjectRequest): Observable<ApiResponse<Subject>>`
- `deleteSubject(id: string): Observable<ApiResponse<void>>`
- `getSubject(id: string): Observable<ApiResponse<Subject>>`

#### Test Books
- `createTestBook(data: CreateTestBookRequest): Observable<ApiResponse<TestBook>>`
- `updateTestBook(id: string, data: UpdateTestBookRequest): Observable<ApiResponse<TestBook>>`
- `deleteTestBook(id: string): Observable<ApiResponse<void>>`
- `getTestBook(id: string): Observable<ApiResponse<TestBook>>`

#### Practice Tests
- `createPracticeTest(data: CreatePracticeTestRequest): Observable<ApiResponse<PracticeTest>>`
- `updatePracticeTest(id: string, data: UpdatePracticeTestRequest): Observable<ApiResponse<PracticeTest>>`
- `deletePracticeTest(id: string): Observable<ApiResponse<void>>`
- `getPracticeTest(id: string): Observable<ApiResponse<PracticeTest>>`

### 4. Model Güncellemeleri

**Dosya:** `frontend/src/app/models/test.models.ts`

**Eklemeler:**
```typescript
export interface CreateExamTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateExamTypeRequest {
  name?: string;
  description?: string;
}

export interface CreateSubjectRequest {
  name: string;
  exam_type_id: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  exam_type_id?: string;
}

export interface CreateTestBookRequest {
  name: string;
  exam_type_id: string;
  subject_id: string;
  published_year: number;
}

export interface UpdateTestBookRequest {
  name?: string;
  exam_type_id?: string;
  subject_id?: string;
  published_year?: number;
}

export interface CreatePracticeTestRequest {
  name: string;
  test_number: number;
  question_count: number;
  answer_key: string;
  test_book_id: string;
}

export interface UpdatePracticeTestRequest {
  name?: string;
  test_number?: number;
  question_count?: number;
  answer_key?: string;
  test_book_id?: string;
}
```

### 5. Admin Modülü Yapısı

```
frontend/src/app/features/admin/
├── components/
│   ├── admin-dashboard/
│   │   └── admin-dashboard.component.ts
│   ├── exam-types/
│   │   ├── exam-types-list.component.ts
│   │   └── exam-type-form.component.ts
│   ├── subjects/
│   │   ├── subjects-list.component.ts
│   │   └── subject-form.component.ts
│   ├── test-books/
│   │   ├── test-books-list.component.ts
│   │   └── test-book-form.component.ts
│   └── practice-tests/
│       ├── practice-tests-list.component.ts
│       └── practice-test-form.component.ts
├── services/
│   └── admin.service.ts
└── admin.routes.ts
```

### 6. Admin Dashboard Component

**Dosya:** `frontend/src/app/features/admin/components/admin-dashboard/admin-dashboard.component.ts`

**Özellikler:**
- Admin paneline genel bakış
- Hızlı erişim kartları:
  - Sınav Türleri Yönetimi
  - Ders Konuları Yönetimi
  - Test Kitapları Yönetimi
  - Deneme Testleri Yönetimi
- İstatistikler (opsiyonel)

### 7. List Component'leri

Her entity için list component'i oluşturulacak:

**Ortak Özellikler:**
- Tablo görünümü ile liste
- Arama/filtreleme (opsiyonel)
- Düzenle butonu
- Sil butonu (onay dialogu ile)
- Yeni kayıt ekle butonu
- Pagination (backend destekliyorsa)

**Örnek:** `exam-types-list.component.ts`

### 8. Form Component'leri

Her entity için form component'i oluşturulacak:

**Ortak Özellikler:**
- Reactive Forms kullanımı
- Form validation
- Create ve Edit modları
- Cascade dropdown'lar (Subject -> ExamType, TestBook -> Subject, PracticeTest -> TestBook)
- Loading states
- Error handling
- Success mesajları

**Örnek:** `exam-type-form.component.ts`

**Özel Durumlar:**
- **Subject Form:** ExamType dropdown'ından seçim yapılır
- **TestBook Form:** ExamType ve Subject dropdown'larından seçim yapılır
- **PracticeTest Form:** TestBook dropdown'ından seçim yapılır, answer_key için textarea

### 9. Routing Yapılandırması

**Dosya:** `frontend/src/app/features/admin/admin.routes.ts`

```typescript
export const adminRoutes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'exam-types', component: ExamTypesListComponent },
  { path: 'exam-types/new', component: ExamTypeFormComponent },
  { path: 'exam-types/:id/edit', component: ExamTypeFormComponent },
  { path: 'subjects', component: SubjectsListComponent },
  { path: 'subjects/new', component: SubjectFormComponent },
  { path: 'subjects/:id/edit', component: SubjectFormComponent },
  { path: 'test-books', component: TestBooksListComponent },
  { path: 'test-books/new', component: TestBookFormComponent },
  { path: 'test-books/:id/edit', component: TestBookFormComponent },
  { path: 'practice-tests', component: PracticeTestsListComponent },
  { path: 'practice-tests/new', component: PracticeTestFormComponent },
  { path: 'practice-tests/:id/edit', component: PracticeTestFormComponent },
];
```

**Ana routing'e ekleme:** `frontend/src/app/app.routes.ts`

```typescript
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
  canActivate: [adminGuard]
}
```

### 10. Header Component Güncellemesi

**Dosya:** `frontend/src/app/shared/components/header/header.component.ts`

**Değişiklikler:**
- Admin menüsü ekleme (sadece admin kullanıcılar için görünür)
- Conditional rendering ile admin linki gösterimi

**Kod Örneği:**
```typescript
<div *ngIf="authService.isAdmin()" class="hidden sm:ml-6 sm:flex sm:space-x-8">
  <a routerLink="/admin" 
     routerLinkActive="border-primary-500 text-gray-900"
     class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
    Admin Panel
  </a>
</div>
```

### 11. Shared Components

**Delete Confirmation Dialog Component**
- Silme işlemleri için onay dialogu
- Tailwind CSS ile modal tasarımı

**Dosya:** `frontend/src/app/shared/components/delete-confirmation/delete-confirmation.component.ts`

### 12. Stil ve UX İyileştirmeleri

- Tailwind CSS ile modern admin panel tasarımı
- Responsive tasarım (mobil uyumlu)
- Loading states
- Error handling ve kullanıcı geri bildirimleri
- Form validation mesajları
- Success toast notifications (opsiyonel)

## Implementasyon Sırası

1. ✅ Auth Service'e rol kontrolü metodları ekleme
2. ✅ Admin Guard oluşturma
3. ✅ Model güncellemeleri (request/response DTO'ları)
4. ✅ Admin Service oluşturma
5. ✅ Admin Dashboard component'i
6. ✅ Exam Types yönetimi (list + form)
7. ✅ Subjects yönetimi (list + form)
8. ✅ Test Books yönetimi (list + form)
9. ✅ Practice Tests yönetimi (list + form)
10. ✅ Routing yapılandırması
11. ✅ Header'a admin menüsü ekleme
12. ✅ Delete confirmation dialog component
13. ✅ Test ve düzenlemeler

## Önemli Notlar

1. **Rol Kontrolü:** Tüm admin endpoint'leri backend'de zaten korumalı, ancak frontend'de de kontrol yapılmalı
2. **Cascade Dropdowns:** Form'larda cascade dropdown'lar doğru şekilde çalışmalı (Subject -> ExamType, vb.)
3. **Answer Key Formatı:** PracticeTest form'unda answer_key için format kontrolü yapılmalı (A, B, C, D, E veya _)
4. **Error Handling:** Tüm API çağrılarında hata yönetimi yapılmalı
5. **Loading States:** Tüm async işlemlerde loading göstergesi olmalı
6. **Form Validation:** Tüm form'larda client-side validation yapılmalı
7. **Responsive Design:** Admin paneli mobil cihazlarda da kullanılabilir olmalı

## Test Senaryoları

1. Admin olmayan kullanıcı admin paneline erişememeli
2. Admin kullanıcı tüm CRUD işlemlerini yapabilmeli
3. Form validasyonları çalışmalı
4. Cascade dropdown'lar doğru çalışmalı
5. Silme işlemleri onay dialogu ile yapılmalı
6. Hata durumlarında kullanıcıya bilgi verilmeli

