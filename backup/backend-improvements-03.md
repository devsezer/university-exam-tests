# Backend REST API - Practice Test Subject İlişki Güncellemesi

## Genel Bakış

Veritabanı migration'ı tamamlandıktan sonra (`00016_add_subject_id_to_practice_tests.sql`), backend REST API'yi `practice_tests` tablosundaki `subject_id` kolonunu destekleyecek şekilde güncellemek gerekiyor. Her practice test artık bir konuya (subject) ait olacak.

## Değişiklikler

### 1. Domain Katmanı

**Dosya:** `crates/domain/src/entities/practice_test.rs`
- `PracticeTest` entity'sine `subject_id: Uuid` alanını ekle
- `PracticeTest::new()` metoduna `subject_id: Uuid` parametresini ekle
- Entity'de subject_id artık zorunlu bir alan olacak

### 2. Infrastructure Katmanı

**Dosya:** `crates/infrastructure/src/database/repositories/practice_test_repository_impl.rs`
- `PracticeTestRow` struct'ına `subject_id: Uuid` alanını ekle
- `From<PracticeTestRow>` implementasyonunu güncelle (subject_id ekle)
- `create` metodunu güncelle:
  - INSERT sorgusuna `subject_id` kolonunu ekle
  - RETURNING clause'una `subject_id` ekle
  - `.bind(practice_test.subject_id)` ekle
- `find_by_id` metodunu güncelle:
  - SELECT sorgusuna `subject_id` kolonunu ekle
- `find_by_test_book_id` metodunu güncelle:
  - SELECT sorgusuna `subject_id` kolonunu ekle
- `update` metodunu güncelle:
  - UPDATE sorgusuna `subject_id` kolonunu ekle
  - SET clause'una `subject_id = $7` ekle
  - RETURNING clause'una `subject_id` ekle
  - `.bind(practice_test.subject_id)` ekle
- `list_all` metodunu güncelle:
  - SELECT sorgusuna `subject_id` kolonunu ekle

### 3. Application Katmanı (DTO ve Service)

**Dosya:** `crates/application/src/dto/test_dto.rs`
- `PracticeTestResponse` struct'ına `subject_id: Uuid` ekle
- `CreatePracticeTestRequest` struct'ına `subject_id: Uuid` ekle (validation: required)
- `UpdatePracticeTestRequest` struct'ına `subject_id: Option<Uuid>` ekle

**Dosya:** `crates/application/src/services/test_management_service.rs`
- `create_practice_test` metodunu güncelle:
  - Test book'un varlığını kontrol et (zaten var)
  - Subject'in varlığını kontrol et (`subject_repo.find_by_id`)
  - Subject'in test book'un subject'leri arasında olduğunu kontrol et (`test_book_subject_repo` kullanarak)
  - `PracticeTest::new()` çağrısına `subject_id` parametresini ekle
  - Response'a `subject_id` ekle
- `get_practice_test` metodunu güncelle:
  - Response'a `subject_id` ekle
- `list_practice_tests_by_test_book` metodunu güncelle:
  - Her practice test response'una `subject_id` ekle
- `list_all_practice_tests` metodunu güncelle:
  - Her practice test response'una `subject_id` ekle
- `update_practice_test` metodunu güncelle:
  - Eğer `subject_id` sağlanmışsa:
    - Subject'in varlığını kontrol et
    - Subject'in test book'un subject'leri arasında olduğunu kontrol et (eğer test_book_id değişmediyse mevcut test book'u kullan, değiştiyse yeni test book'u kullan)
    - `practice_test.subject_id` değerini güncelle
  - Response'a `subject_id` ekle

**Not:** `TestManagementServiceImpl` struct'ına `subject_repo` ve `test_book_subject_repo` dependency'leri zaten eklenmiş olmalı (test book işlemleri için kullanılıyor).

### 4. API Katmanı (Handlers ve DTOs)

**Dosya:** `crates/api/src/dto/request/test_request.rs`
- `CreatePracticeTestRequest` struct'ına `subject_id: Uuid` ekle
- `UpdatePracticeTestRequest` struct'ına `subject_id: Option<Uuid>` ekle
- `into_app_request` metodlarını güncelle (subject_id ekle)
- Validation ekle: `subject_id` için `#[validate]` attribute (required)

**Dosya:** `crates/api/src/dto/response/test_response.rs`
- `PracticeTestResponse` struct'ına `subject_id: Uuid` ekle
- `From<application::dto::PracticeTestResponse>` implementasyonunu güncelle (subject_id ekle)

**Dosya:** `crates/api/src/handlers/test_handler.rs`
- Handler'lar değişmeyecek (service katmanı değişiklikleri yeterli)
- OpenAPI dokümantasyonunu güncelle (`subject_id` ekle)

## Önemli Notlar

1. **Validation:** `create_practice_test` ve `update_practice_test` işlemlerinde:
   - Subject'in varlığı kontrol edilmeli
   - Subject'in seçilen test book'un subject'leri arasında olduğu kontrol edilmeli (test book'un hangi subject'lere sahip olduğu `test_book_subjects` junction table'dan kontrol edilmeli)

2. **Backward Compatibility:** API response'larda `subject_id` eklenecek. Frontend'in bu değişikliğe uyum sağlaması gerekecek.

3. **Error Handling:** 
   - `SubjectNotFound` hatası için `TestManagementError` enum'ına ekleme gerekebilir (eğer yoksa)
   - Subject'in test book'a ait olmadığı durumda uygun bir hata mesajı döndürülmeli

4. **Test Book Subject Validation:** Test book'un subject'lerini kontrol etmek için `test_book_subject_repo.find_subject_ids_by_test_book_id()` metodu kullanılmalı.

## Test Edilmesi Gerekenler

1. Practice test oluşturma (subject_id ile)
2. Practice test güncelleme (subject_id değişikliği)
3. Practice test listeleme (subject_id ile birlikte)
4. Test book'a göre practice test listeleme (subject_id ile)
5. Geçersiz subject_id ile practice test oluşturma (validation)
6. Test book'un subject'leri arasında olmayan subject_id ile practice test oluşturma (validation)
7. Practice test güncelleme (test_book_id değiştiğinde subject_id validation)

