# Backend REST API - Test Book Subject Many-to-Many Dönüşümü

## Genel Bakış

Veritabanı migration'ları tamamlandıktan sonra, backend REST API'yi many-to-many ilişkiyi destekleyecek şekilde güncellemek gerekiyor. `test_books` tablosundan `subject_id` kolonu kaldırılmış ve `test_book_subjects` junction table oluşturulmuş durumda.

## Değişiklikler

### 1. Domain Katmanı

**Dosya:** `crates/domain/src/entities/test_book.rs`
- `TestBook` entity'sinden `subject_id: Uuid` alanını kaldır
- Entity'de subjects bilgisi tutulmayacak (junction table üzerinden yönetilecek)

**Dosya:** `crates/domain/src/repositories/test_book_repository.rs`
- `find_by_subject_id` metodunu güncelle - artık junction table üzerinden JOIN ile çalışmalı
- Repository trait'i aynı kalabilir (implementasyon değişecek)

**Yeni Dosya:** `crates/domain/src/repositories/test_book_subject_repository.rs`
- Junction table için yeni repository trait oluştur
- Metodlar:
  - `add_subject(test_book_id, subject_id)` - ilişki ekle
  - `remove_subject(test_book_id, subject_id)` - ilişki kaldır
  - `set_subjects(test_book_id, subject_ids)` - tüm ilişkileri güncelle
  - `find_subject_ids_by_test_book_id(test_book_id)` - test book'un subject ID'lerini getir
  - `find_test_book_ids_by_subject_id(subject_id)` - subject'e ait test book ID'lerini getir
  - `delete_by_test_book_id(test_book_id)` - test book silindiğinde ilişkileri temizle

### 2. Infrastructure Katmanı

**Dosya:** `crates/infrastructure/src/database/repositories/test_book_repository_impl.rs`
- `TestBookRow` struct'ından `subject_id` alanını kaldır
- `From<TestBookRow>` implementasyonunu güncelle
- `create` metodundan `subject_id` parametresini kaldır
- `update` metodundan `subject_id` parametresini kaldır
- `find_by_subject_id` metodunu güncelle - JOIN ile `test_book_subjects` tablosunu kullan:
  ```sql
  SELECT tb.id, tb.name, tb.lesson_id, tb.exam_type_id, tb.published_year, tb.created_at
  FROM test_books tb
  INNER JOIN test_book_subjects tbs ON tb.id = tbs.test_book_id
  WHERE tbs.subject_id = $1
  ORDER BY tb.name ASC
  ```
- Tüm SELECT sorgularından `subject_id` kolonunu kaldır

**Yeni Dosya:** `crates/infrastructure/src/database/repositories/test_book_subject_repository_impl.rs`
- `TestBookSubjectRepository` trait'inin PostgreSQL implementasyonu
- Junction table CRUD işlemleri

**Dosya:** `crates/infrastructure/src/database/repositories/mod.rs`
- Yeni repository'yi modül olarak ekle

### 3. Application Katmanı (DTO ve Service)

**Dosya:** `crates/application/src/dto/test_dto.rs`
- `TestBookResponse` struct'ından `subject_id: Uuid` kaldır, `subject_ids: Vec<Uuid>` ekle
- `CreateTestBookRequest` struct'ından `subject_id: Uuid` kaldır, `subject_ids: Vec<Uuid>` ekle (validation: en az 1 eleman)
- `UpdateTestBookRequest` struct'ından `subject_id: Option<Uuid>` kaldır, `subject_ids: Option<Vec<Uuid>>` ekle

**Dosya:** `crates/application/src/services/test_management_service.rs`
- `TestManagementService` trait'ine `test_book_subject_repo` dependency ekle
- `create_test_book` metodunu güncelle:
  - Test book oluşturulduktan sonra `subject_ids` array'indeki her subject için junction table'a kayıt ekle
  - Her subject_id'nin geçerli olduğunu kontrol et
- `get_test_book` metodunu güncelle:
  - Test book bilgisini aldıktan sonra junction table'dan `subject_ids` array'ini getir ve response'a ekle
- `update_test_book` metodunu güncelle:
  - Eğer `subject_ids` sağlanmışsa, mevcut ilişkileri sil ve yenilerini ekle
- `list_test_books_by_subject` metodunu güncelle:
  - Junction table üzerinden JOIN ile çalışacak şekilde repository metodunu kullan
- `list_all_test_books` metodunu güncelle:
  - Her test book için `subject_ids` array'ini getir ve response'a ekle
- `delete_test_book` metodunu güncelle:
  - Junction table'daki ilişkiler CASCADE ile silinecek, ama explicit kontrol eklenebilir

**Dosya:** `crates/application/src/services/test_management_service.rs` (constructor)
- `TestManagementServiceImpl` struct'ına `test_book_subject_repo` field'ı ekle
- Constructor'ı güncelle

### 4. API Katmanı (Handlers ve DTOs)

**Dosya:** `crates/api/src/dto/request/test_request.rs`
- `CreateTestBookRequest` struct'ından `subject_id: Uuid` kaldır, `subject_ids: Vec<Uuid>` ekle
- `UpdateTestBookRequest` struct'ından `subject_id: Option<Uuid>` kaldır, `subject_ids: Option<Vec<Uuid>>` ekle
- `into_app_request` metodlarını güncelle
- Validation ekle: `subject_ids` en az 1 eleman içermeli

**Dosya:** `crates/api/src/dto/response/test_response.rs`
- `TestBookResponse` struct'ından `subject_id: Uuid` kaldır, `subject_ids: Vec<Uuid>` ekle
- `From<application::dto::TestBookResponse>` implementasyonunu güncelle

**Dosya:** `crates/api/src/handlers/test_handler.rs`
- Handler'lar değişmeyecek (service katmanı değişiklikleri yeterli)
- OpenAPI dokümantasyonunu güncelle (`subject_id` yerine `subject_ids`)

### 5. Dependency Injection

**Dosya:** `crates/infrastructure/src/database/repositories/mod.rs` veya ilgili modül
- `TestBookSubjectRepository` implementasyonunu oluştur ve state'e ekle

**Dosya:** `crates/api/src/state.rs` veya ilgili state dosyası
- `TestManagementService` oluşturulurken `test_book_subject_repo` dependency'sini ekle

## Önemli Notlar

1. **Backward Compatibility:** API response'larda `subject_id` yerine `subject_ids` array döndürülecek. Frontend'in bu değişikliğe uyum sağlaması gerekecek.

2. **Transaction Management:** `create_test_book` ve `update_test_book` işlemlerinde test book oluşturma/güncelleme ve junction table işlemleri transaction içinde yapılmalı.

3. **Validation:** Her `subject_id`'nin geçerli bir subject olduğu kontrol edilmeli.

4. **Performance:** `list_all_test_books` gibi metodlarda N+1 query problemi olmaması için batch query veya JOIN kullanılmalı.

5. **Cascade Delete:** Junction table'da `ON DELETE CASCADE` tanımlı olduğu için test book silindiğinde ilişkiler otomatik silinecek, ama explicit kontrol eklenebilir.

## Test Edilmesi Gerekenler

1. Test book oluşturma (birden fazla subject ile)
2. Test book güncelleme (subject_ids değişikliği)
3. Test book listeleme (subject_ids ile birlikte)
4. Subject'e göre test book listeleme (junction table JOIN)
5. Test book silme (junction table cascade)
6. Geçersiz subject_id ile test book oluşturma (validation)
7. Boş subject_ids array ile test book oluşturma (validation)

