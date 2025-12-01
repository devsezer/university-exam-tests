# Frontend Lessons Integration Plan

## Genel Bakış

Backend'de eklenen lessons entegrasyonunu frontend'e yansıtmak için models, services, ve component'lerde güncellemeler yapılacak. Cascading dropdown yapısı Sınav Türü > Ders > Konu şeklinde güncellenecek.

## 1. Models Güncellemeleri

### frontend/src/app/models/test.models.ts

Yeni interface'ler ve güncellemeler:

```typescript
// Yeni
export interface Lesson {
  id: string;
  name: string;
  created_at: string;
}

export interface CreateLessonRequest {
  name: string;
}

export interface UpdateLessonRequest {
  name?: string;
}

// Güncellenecek
export interface Subject {
  id: string;
  name: string;
  lesson_id: string;  // YENİ
  exam_type_id: string;
  created_at: string;
}

export interface TestBook {
  id: string;
  name: string;
  exam_type_id: string;
  lesson_id: string;  // YENİ
  subject_id: string;
  published_year: number;
  created_at: string;
}

// Request DTO'ları
export interface CreateSubjectRequest {
  name: string;
  lesson_id: string;  // YENİ
  exam_type_id: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  lesson_id?: string;  // YENİ
  exam_type_id?: string;
}

export interface CreateTestBookRequest {
  name: string;
  exam_type_id: string;
  lesson_id: string;  // YENİ
  subject_id: string;
  published_year: number;
}

export interface UpdateTestBookRequest {
  name?: string;
  exam_type_id?: string;
  lesson_id?: string;  // YENİ
  subject_id?: string;
  published_year?: number;
}
```

## 2. Services Güncellemeleri

### frontend/src/app/features/admin/services/admin.service.ts

**Yeni metodlar:**

```typescript
// Lessons
listLessons(): Observable<ApiResponse<Lesson[]>> {
  return this.api.get<Lesson[]>('/lessons');
}

createLesson(data: CreateLessonRequest): Observable<ApiResponse<Lesson>> {
  return this.api.post<Lesson>('/admin/lessons', data);
}

getLesson(id: string): Observable<ApiResponse<Lesson>> {
  return this.api.get<Lesson>(`/admin/lessons/${id}`);
}

updateLesson(id: string, data: UpdateLessonRequest): Observable<ApiResponse<Lesson>> {
  return this.api.put<Lesson>(`/admin/lessons/${id}`, data);
}

deleteLesson(id: string): Observable<ApiResponse<void>> {
  return this.api.delete<void>(`/admin/lessons/${id}`);
}
```

**Güncellenecek:**

```typescript
// lesson_id parametresi eklendi
listSubjects(examTypeId?: string, lessonId?: string): Observable<ApiResponse<Subject[]>> {
  const params: any = {};
  if (examTypeId) params.exam_type_id = examTypeId;
  if (lessonId) params.lesson_id = lessonId;
  return this.api.get<Subject[]>('/subjects', Object.keys(params).length ? params : undefined);
}
```

### frontend/src/app/features/tests/services/test.service.ts

**Yeni metodlar:**

```typescript
getLessons(): Observable<ApiResponse<Lesson[]>> {
  return this.api.get<Lesson[]>('/lessons');
}
```

**Güncellenecek:**

```typescript
// lesson_id parametresi eklendi
getSubjects(examTypeId?: string, lessonId?: string): Observable<ApiResponse<Subject[]>> {
  const params: any = {};
  if (examTypeId) params.exam_type_id = examTypeId;
  if (lessonId) params.lesson_id = lessonId;
  return this.api.get<Subject[]>('/subjects', Object.keys(params).length ? params : undefined);
}
```

## 3. Admin Lessons Component'leri (Yeni)

### frontend/src/app/features/admin/components/lessons/lessons-list.component.ts

- Tüm dersleri listele (Matematik, Fizik, Türkçe vb.)
- Düzenle/Sil butonları
- Yeni ders ekleme linki
- Mevcut exam-types-list.component.ts yapısı örnek alınabilir

### frontend/src/app/features/admin/components/lessons/lesson-form.component.ts

- Ders oluşturma/düzenleme formu
- Sadece `name` alanı
- Mevcut exam-type-form.component.ts yapısı örnek alınabilir

## 4. Admin Component Güncellemeleri

### frontend/src/app/features/admin/components/subjects/subject-form.component.ts

**Mevcut akış:**
```
Sınav Türü Seç → Konu Adı Gir
```

**Yeni akış (cascading dropdown):**
```
Ders Seç → Sınav Türü Seç → Konu Adı Gir
```

Değişiklikler:
- `lessons` signal ekle
- `loadLessons()` metodu ekle
- Form'a `lesson_id` alanı ekle
- Template'e Ders dropdown ekle

### frontend/src/app/features/admin/components/subjects/subjects-list.component.ts

Değişiklikler:
- `lessons` signal ekle
- `loadLessons()` metodu ekle
- `getLessonName(lessonId)` helper metodu ekle
- Template'de ders adını göster (lesson_id yerine)

### frontend/src/app/features/admin/components/test-books/test-book-form.component.ts

**Mevcut akış:**
```
Sınav Türü → Konu → Kitap Bilgileri
```

**Yeni akış (cascading dropdown):**
```
Sınav Türü → Ders → Konu → Kitap Bilgileri
```

Değişiklikler:
- `lessons` signal ekle
- `loadLessons()` metodu ekle
- Form'a `lesson_id` alanı ekle
- `onLessonChange()` metodu ekle
- `loadSubjectsForLessonAndExamType()` metodu ekle
- Template'e Ders dropdown ekle
- Subject yüklemesini lesson_id + exam_type_id ile filtrele

### frontend/src/app/features/admin/components/test-books/test-books-list.component.ts

Değişiklikler:
- `lessons` signal ekle
- `loadLessons()` metodu ekle
- `getLessonName(lessonId)` helper metodu ekle
- Template'de ders adını göster

## 5. User Component Güncellemeleri

### frontend/src/app/features/tests/components/test-selector/test-selector.component.ts

**Mevcut akış:**
```
Sınav Türü → Konu → Test Kitabı → Deneme Testi
```

**Yeni akış:**
```
Sınav Türü → Ders → Konu → Test Kitabı → Deneme Testi
```

Değişiklikler:
- `lessons` signal ekle
- `selectedLessonId` değişkeni ekle
- `isLoadingLessons` signal ekle
- `loadLessonsForExamType()` veya tüm dersleri yükle
- `onLessonChange()` metodu ekle
- Template'e Ders dropdown ekle
- Subject yüklemesini lesson_id + exam_type_id ile filtrele

## 6. Routes Güncellemeleri

### frontend/src/app/features/admin/admin.routes.ts

Yeni route'lar:

```typescript
import { LessonsListComponent } from './components/lessons/lessons-list.component';
import { LessonFormComponent } from './components/lessons/lesson-form.component';

export const adminRoutes: Routes = [
  // ... mevcut route'lar
  { path: 'lessons', component: LessonsListComponent },
  { path: 'lessons/new', component: LessonFormComponent },
  { path: 'lessons/:id/edit', component: LessonFormComponent },
];
```

## 7. Admin Dashboard

### frontend/src/app/features/admin/components/admin-dashboard/admin-dashboard.component.ts

"Dersler" kartı/linki eklenecek:

```html
<a routerLink="/admin/lessons" class="...">
  <div class="...">
    <h3>Dersler</h3>
    <p>Dersleri yönetin</p>
  </div>
</a>
```

## Cascading Dropdown Mantığı

### Admin Subject Form
```
1. Ders Seç (Matematik, Fizik, Türkçe...)
2. Sınav Türü Seç (TYT, AYT)
3. Konu Adı Gir (Limit, Türev, vb.)
```

### Admin Test Book Form
```
1. Sınav Türü Seç (TYT, AYT)
2. Ders Seç (Matematik, Fizik...)
3. Konu Seç (lesson_id + exam_type_id ile filtrelenir)
4. Kitap Bilgileri Gir
```

### User Test Selector
```
1. Sınav Türü Seç (TYT, AYT)
2. Ders Seç (Matematik, Fizik...)
3. Konu Seç (lesson_id + exam_type_id ile filtrelenir)
4. Test Kitabı Seç
5. Deneme Testi Seç
```

## İş Sırası

1. **Models** - test.models.ts güncellemeleri
2. **Services** - admin.service.ts ve test.service.ts güncellemeleri
3. **Lessons Components** - Yeni lessons-list ve lesson-form
4. **Subject Components** - Form ve list güncellemeleri
5. **Test Book Components** - Form ve list güncellemeleri
6. **Test Selector** - User tarafı güncelleme
7. **Routes** - admin.routes.ts güncelleme
8. **Dashboard** - Dersler linki ekleme

## Notlar

- Lesson tüm sınav türlerinden bağımsız (Matematik hem TYT hem AYT için geçerli)
- Subject ve TestBook artık lesson_id zorunlu alan
- Cascading dropdown'larda sıralama önemli: üst seçim yapılmadan alt seçimler disabled

