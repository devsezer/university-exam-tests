# Deneme Testi Platformu Geliştirme Planı

## Adım 1: Git Repository Kurulumu

### 1.1 Git Repository Oluşturma ve İlk Commit

- Git repository başlat (`git init`)
- `.gitignore` dosyası kontrol et (target/, .env vb.)
- Mevcut kod tabanını commit et ("Initial commit: Clean Architecture REST API boilerplate")

### 1.2 Geliştirme Branch'i Oluşturma

- `feature/deneme-test-platform` adında yeni branch oluştur

---

## Adım 2: Domain Layer - Yeni Entity'ler

Aşağıdaki entity'leri `crates/domain/src/entities/` dizinine ekle:

### 2.1 Sınav Türü (ExamType)

```rust
// exam_type.rs
pub struct ExamType {
    id: Uuid,
    name: String,           // "TYT", "AYT"
    description: Option<String>,
    created_at: DateTime<Utc>,
}
```

### 2.2 Ders Konusu (Subject)

```rust
// subject.rs
pub struct Subject {
    id: Uuid,
    name: String,           // "Matematik", "Türkçe"
    exam_type_id: Uuid,     // Hangi sınav türüne ait
    created_at: DateTime<Utc>,
}
```

### 2.3 Test Kitabı (TestBook)

```rust
// test_book.rs
pub struct TestBook {
    id: Uuid,
    name: String,           // "Limit Yayınları TYT Matematik"
    exam_type_id: Uuid,
    subject_id: Uuid,
    published_year: u16,
    created_at: DateTime<Utc>,
}
```

### 2.4 Deneme Testi (PracticeTest)

```rust
// practice_test.rs
pub struct PracticeTest {
    id: Uuid,
    name: String,           // "Deneme 1"
    test_number: i32,       // 1, 2, 3...
    question_count: i32,    // 40
    answer_key: String,     // "ABCDABCD..." (JSON veya string)
    test_book_id: Uuid,
    created_at: DateTime<Utc>,
}
```

### 2.5 Test Sonucu (TestResult)

```rust
// test_result.rs
pub struct TestResult {
    id: Uuid,
    user_id: Uuid,
    practice_test_id: Uuid,
    user_answers: String,   // "ABCD_BCD..." (_ = boş)
    correct_count: i32,
    wrong_count: i32,
    empty_count: i32,
    net_score: f64,         // Doğru - Yanlış/4
    solved_at: DateTime<Utc>,
}
```

### 2.6 Repository Trait'leri

`crates/domain/src/repositories/` dizinine ekle:

- `exam_type_repository.rs`
- `subject_repository.rs`
- `test_book_repository.rs`
- `practice_test_repository.rs`
- `test_result_repository.rs`

---

## Adım 3: Database Migrasyonları

`migrations/` dizinine yeni SQL dosyaları ekle:

| Migration | Tablo |
|-----------|-------|
| `00003_create_exam_types_table.sql` | Sınav türleri |
| `00004_create_subjects_table.sql` | Ders konuları |
| `00005_create_test_books_table.sql` | Test kitapları |
| `00006_create_practice_tests_table.sql` | Deneme testleri |
| `00007_create_test_results_table.sql` | Test sonuçları |

---

## Adım 4: Infrastructure Layer

### 4.1 Repository Implementasyonları

`crates/infrastructure/src/database/` dizinine SQLx implementasyonları ekle:

- `exam_type_repository_impl.rs`
- `subject_repository_impl.rs`
- `test_book_repository_impl.rs`
- `practice_test_repository_impl.rs`
- `test_result_repository_impl.rs`

---

## Adım 5: Application Layer - Servisler

`crates/application/src/services/` dizinine ekle:

### 5.1 Test Yönetim Servisi

- Sınav türü CRUD
- Ders konusu CRUD
- Test kitabı CRUD
- Deneme testi CRUD

### 5.2 Test Çözme Servisi

- Test çözme başlatma
- Cevapları gönderme ve değerlendirme
- Net hesaplama: `net = correct - (wrong / 4.0)`
- 24 saat tekrar çözme kontrolü

### 5.3 Sonuç Servisi

- Kullanıcının geçmiş sonuçlarını listeleme
- Sonuç detayı görüntüleme

---

## Adım 6: API Layer - Endpoint'ler

### 6.1 Admin Endpoint'leri (Yetkilendirme gerekli)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET/POST | `/api/v1/admin/exam-types` | Sınav türleri listele/ekle |
| GET/PUT/DELETE | `/api/v1/admin/exam-types/{id}` | Sınav türü detay/güncelle/sil |
| GET/POST | `/api/v1/admin/subjects` | Ders konuları listele/ekle |
| GET/PUT/DELETE | `/api/v1/admin/subjects/{id}` | Ders konusu detay/güncelle/sil |
| GET/POST | `/api/v1/admin/test-books` | Test kitapları listele/ekle |
| GET/PUT/DELETE | `/api/v1/admin/test-books/{id}` | Test kitabı detay/güncelle/sil |
| GET/POST | `/api/v1/admin/practice-tests` | Deneme testleri listele/ekle |
| GET/PUT/DELETE | `/api/v1/admin/practice-tests/{id}` | Deneme testi detay/güncelle/sil |

### 6.2 Kullanıcı Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/v1/exam-types` | Sınav türlerini listele |
| GET | `/api/v1/subjects?exam_type_id=` | Ders konularını listele |
| GET | `/api/v1/test-books?subject_id=` | Test kitaplarını listele |
| GET | `/api/v1/practice-tests?test_book_id=` | Deneme testlerini listele |
| POST | `/api/v1/tests/{id}/solve` | Test çöz ve sonuç al |
| GET | `/api/v1/my-results` | Geçmiş sonuçları listele |
| GET | `/api/v1/my-results/{id}` | Sonuç detayı görüntüle |

---

## Adım 7: DTO'lar ve OpenAPI

`crates/api/src/dto/` dizinine request/response DTO'ları ve Swagger dokümantasyonu ekle.

---

## Dosya Yapısı Özeti

```
crates/
├── domain/src/
│   ├── entities/
│   │   ├── exam_type.rs      (YENİ)
│   │   ├── subject.rs        (YENİ)
│   │   ├── test_book.rs      (YENİ)
│   │   ├── practice_test.rs  (YENİ)
│   │   └── test_result.rs    (YENİ)
│   └── repositories/
│       ├── exam_type_repository.rs      (YENİ)
│       ├── subject_repository.rs        (YENİ)
│       ├── test_book_repository.rs      (YENİ)
│       ├── practice_test_repository.rs  (YENİ)
│       └── test_result_repository.rs    (YENİ)
├── application/src/services/
│   ├── test_management_service.rs  (YENİ)
│   ├── test_solving_service.rs     (YENİ)
│   └── result_service.rs           (YENİ)
├── infrastructure/src/database/
│   └── (5 yeni repository impl)
└── api/src/
    ├── handlers/
    │   ├── exam_type_handler.rs    (YENİ)
    │   ├── subject_handler.rs      (YENİ)
    │   ├── test_book_handler.rs    (YENİ)
    │   ├── practice_test_handler.rs (YENİ)
    │   └── test_result_handler.rs  (YENİ)
    ├── routes/
    │   └── (yeni route dosyaları)
    └── dto/
        └── (yeni request/response DTO'ları)
```

---

## Tamamlanan İşlemler (Durum)

- ✅ Git repository kurulumu ve ilk commit
- ✅ Feature branch oluşturuldu (`feature/deneme-test-platform`)
- ✅ Domain entity'leri eklendi (5 yeni entity)
- ✅ Repository trait'leri tanımlandı (5 yeni trait)
- ✅ Veritabanı migrasyonları oluşturuldu (5 yeni tablo)
- ✅ Infrastructure repository implementasyonları eklendi
- ✅ Application servisleri eklendi (3 yeni servis)
- ✅ API handler'ları ve route'ları eklendi
- ✅ Request/Response DTO'ları ve OpenAPI dokümantasyonu eklendi

---

## Önemli Notlar

- Net hesaplama formülü: `net_score = correct_count - (wrong_count / 4.0)`
- 24 saat tekrar çözme kuralı: Kullanıcılar aynı testi tekrar çözmek için en az 24 saat beklemesi gerekiyor
- Axum route syntax: Path parametreleri için `{id}` formatı kullanılmalı (eski `:id` formatı kullanılmamalı)
- Swagger UI adresi: `http://localhost:8080/swagger-ui`

