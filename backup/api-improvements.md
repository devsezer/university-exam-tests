# Backend API - Lessons Integration Plan

## Genel Bakış

Veritabanında yapılan değişikliklere (lessons tablosu, subjects/test_books'a lesson_id eklenmesi) uygun olarak backend API güncellenecek.

## 1. Domain Layer

### Yeni Dosyalar

#### crates/domain/src/entities/lesson.rs

```rust
pub struct Lesson {
    pub id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
}
```

#### crates/domain/src/repositories/lesson_repository.rs

- `create`, `find_by_id`, `find_by_name`, `list_all`, `update`, `delete` metodları

### Güncellenecek Dosyalar

#### crates/domain/src/entities/subject.rs

- `lesson_id: Uuid` alanı ekle
- `new()` metodunu güncelle

#### crates/domain/src/entities/test_book.rs

- `lesson_id: Uuid` alanı ekle
- `new()` metodunu güncelle

#### crates/domain/src/repositories/subject_repository.rs

- `find_by_lesson_and_exam_type(lesson_id, exam_type_id)` metodu ekle

#### crates/domain/src/repositories/test_book_repository.rs

- `find_by_lesson_id(lesson_id)` metodu ekle

#### crates/domain/src/entities/mod.rs

- `lesson` modülünü ekle ve export et

#### crates/domain/src/repositories/mod.rs

- `lesson_repository` modülünü ekle ve export et

## 2. Infrastructure Layer

### Yeni Dosyalar

#### crates/infrastructure/src/database/repositories/lesson_repository_impl.rs

- `PgLessonRepository` struct
- `LessonRepository` trait implementasyonu
- CRUD SQL sorguları

### Güncellenecek Dosyalar

#### crates/infrastructure/src/database/repositories/subject_repository_impl.rs

- `SubjectRow`'a `lesson_id` ekle
- SQL sorgularını güncelle (lesson_id dahil et)
- `find_by_lesson_and_exam_type` metodu ekle

#### crates/infrastructure/src/database/repositories/test_book_repository_impl.rs

- `TestBookRow`'a `lesson_id` ekle
- SQL sorgularını güncelle (lesson_id dahil et)
- `find_by_lesson_id` metodu ekle

#### crates/infrastructure/src/database/repositories/mod.rs

- `lesson_repository_impl` modülünü ekle ve export et

## 3. Application Layer

### Güncellenecek Dosyalar

#### crates/application/src/dto/test_dto.rs

**Yeni DTOs:**

```rust
pub struct LessonResponse { id, name, created_at }
pub struct CreateLessonRequest { name }
pub struct UpdateLessonRequest { name }
```

**Güncellenecek DTOs:**

- `SubjectResponse`: `lesson_id` ekle
- `CreateSubjectRequest`: `lesson_id` ekle
- `UpdateSubjectRequest`: `lesson_id` ekle
- `TestBookResponse`: `lesson_id` ekle
- `CreateTestBookRequest`: `lesson_id` ekle
- `UpdateTestBookRequest`: `lesson_id` ekle

#### crates/application/src/services/test_management_service.rs

**Yeni metodlar:**

- `create_lesson`, `get_lesson`, `list_lessons`, `update_lesson`, `delete_lesson`
- `list_subjects_by_lesson_and_exam_type(lesson_id, exam_type_id)`

**Güncellenecekler:**

- `TestManagementError`: `LessonNotFound` ekle
- `TestManagementServiceImpl`: `LessonRepository` dependency ekle
- `create_subject`: lesson_id kontrolü ekle
- `create_test_book`: lesson_id kontrolü ekle

## 4. API Layer

### Güncellenecek Dosyalar

#### crates/api/src/dto/request/test_request.rs

**Yeni:**

```rust
pub struct CreateLessonRequest { name }
pub struct UpdateLessonRequest { name }
```

**Güncellenecek:**

- `CreateSubjectRequest`: `lesson_id` ekle
- `UpdateSubjectRequest`: `lesson_id` ekle
- `CreateTestBookRequest`: `lesson_id` ekle
- `UpdateTestBookRequest`: `lesson_id` ekle

#### crates/api/src/dto/response/test_response.rs

**Yeni:**

```rust
pub struct LessonResponse { id, name, created_at }
```

**Güncellenecek:**

- `SubjectResponse`: `lesson_id` ekle
- `TestBookResponse`: `lesson_id` ekle

#### crates/api/src/handlers/test_handler.rs

**Yeni handlers:**

- `create_lesson` - POST /api/v1/admin/lessons
- `get_lesson` - GET /api/v1/admin/lessons/{id}
- `list_lessons` - GET /api/v1/lessons (public)
- `list_admin_lessons` - GET /api/v1/admin/lessons (admin)
- `update_lesson` - PUT /api/v1/admin/lessons/{id}
- `delete_lesson` - DELETE /api/v1/admin/lessons/{id}

**Admin listeleme handlers (eksik olanlar):**

- `list_admin_exam_types` - GET /api/v1/admin/exam-types
- `list_admin_subjects` - GET /api/v1/admin/subjects
- `list_admin_test_books` - GET /api/v1/admin/test-books
- `list_admin_practice_tests` - GET /api/v1/admin/practice-tests

**Güncellenecek:**

- `list_subjects`: `lesson_id` query parametresi ekle

#### crates/api/src/routes/test_routes.rs

**Yeni routes:**

- Public: `GET /api/v1/lessons`
- Admin: Lesson CRUD routes
- Admin: Listeleme routes (GET /api/v1/admin/{lessons,exam-types,subjects,test-books,practice-tests})

#### crates/api/src/openapi.rs

- Lesson endpoint'lerini OpenAPI dokümantasyonuna ekle

## İş Sırası

1. **Domain Layer** - Entity ve repository trait'leri (temel yapı)
2. **Infrastructure Layer** - PostgreSQL implementasyonları
3. **Application Layer** - Servis ve DTO güncellemeleri
4. **API Layer** - Handler, route ve response güncellemeleri

## Notlar

- Geriye dönük uyumluluk için mevcut `find_by_exam_type_id` metodları korunacak
- Lesson entity basit tutulacak (sadece id, name, created_at)
- Subject ve TestBook'ta lesson_id zorunlu alan olacak
- Frontend'de cascading dropdown için `list_subjects_by_lesson_and_exam_type` endpoint'i kullanılacak

