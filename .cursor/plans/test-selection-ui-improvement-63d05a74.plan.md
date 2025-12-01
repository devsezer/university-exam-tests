<!-- 63d05a74-9e24-43e5-8c4b-dea0bf67bf46 f55e9166-9740-45c7-ba50-82e29fb18e3b -->
# Test Seçim Sayfası İyileştirme Planı

## Genel Bakış

Mevcut 5 adımlı dropdown akışını 3 adımlı, görsel ve kullanıcı dostu bir akışa dönüştürme:

1. **Sınav Türü + Ders** seçimi (dropdown)
2. **Kitap Seçimi** (kart görünümü, placeholder resimlerle)
3. **Test Listesi** (konulara göre gruplanmış)

## Backend Değişiklikleri

### 1. Repository Katmanı

**Dosya:** `crates/domain/src/repositories/test_book_repository.rs`

- `find_by_exam_type_and_lesson(exam_type_id: Uuid, lesson_id: Uuid)` metodu ekle

**Dosya:** `crates/infrastructure/src/database/repositories/test_book_repository_impl.rs`

- `find_by_exam_type_and_lesson` implementasyonu ekle
- SQL sorgusu: `WHERE exam_type_id = $1 AND lesson_id = $2 ORDER BY name ASC`

### 2. Service Katmanı

**Dosya:** `crates/application/src/services/test_management_service.rs`

- `list_test_books_by_exam_type_and_lesson(exam_type_id: Uuid, lesson_id: Uuid)` metodu ekle
- Mevcut `list_test_books_by_subject` metoduna benzer yapıda, ancak exam_type_id ve lesson_id ile filtreleme
- Her test kitabı için subject_ids'leri junction table'dan al

**Yeni metod:** `list_practice_tests_grouped_by_subject(test_book_id: Uuid)`

- Test kitabındaki tüm practice testleri getir
- Konulara göre grupla
- Response: `HashMap<Uuid, Vec<PracticeTestResponse>>` (subject_id -> tests)

### 3. API Handler

**Dosya:** `crates/api/src/handlers/test_handler.rs`

- `list_test_books` handler'ını güncelle:
  - `exam_type_id` ve `lesson_id` query parametrelerini destekle
  - Her iki parametre varsa `list_test_books_by_exam_type_and_lesson` çağır
  - Sadece `subject_id` varsa mevcut mantık devam etsin

**Yeni handler:** `list_practice_tests_grouped_by_subject`

- Path: `GET /api/v1/test-books/{id}/practice-tests-grouped`
- Response: `ApiResponse<HashMap<String, Vec<PracticeTestResponse>>>`
- Key: subject_id (string), Value: practice test listesi

### 4. Routes

**Dosya:** `crates/api/src/routes/test_routes.rs`

- Yeni route ekle: `.route("/api/v1/test-books/{id}/practice-tests-grouped", get(list_practice_tests_grouped_by_subject))`

### 5. Response DTOs

**Dosya:** `crates/api/src/dto/response/test_response.rs`

- Yeni response type: `PracticeTestsGroupedResponse`
- `HashMap<String, Vec<PracticeTestResponse>>` yapısı (subject_id -> tests)

## Frontend Değişiklikleri

### 1. Models

**Dosya:** `frontend/src/app/models/test.models.ts`

- `PracticeTestsGrouped` interface ekle:
  ```typescript
  export interface PracticeTestsGrouped {
    [subjectId: string]: PracticeTest[];
  }
  ```


### 2. Service

**Dosya:** `frontend/src/app/features/tests/services/test.service.ts`

- `getTestBooks(examTypeId?: string, lessonId?: string, subjectId?: string)` metodunu güncelle
  - Artık examTypeId ve lessonId parametrelerini de desteklesin
- Yeni metod: `getPracticeTestsGrouped(testBookId: string): Observable<ApiResponse<PracticeTestsGrouped>>`
  - Endpoint: `GET /api/v1/test-books/{testBookId}/practice-tests-grouped`

### 3. Component Yeniden Tasarımı

**Dosya:** `frontend/src/app/features/tests/components/test-selector/test-selector.component.ts`

**State Yönetimi:**

- `currentStep: signal<1 | 2 | 3>` ekle
- `selectedTestBookId` ve `practiceTestsGrouped` signal'ları
- `subjects` signal'ı (test listesinde konu isimlerini göstermek için)

**Template Yapısı:**

- **Step 1:** Sınav Türü + Ders dropdown'ları (mevcut)
- **Step 2:** Kitap seçimi - Grid layout kart görünümü
  - Her kart: placeholder resim + kitap adı + yayın yılı
  - Placeholder resim: `https://via.placeholder.com/200x300?text=Kitap+Kapağı` veya SVG placeholder
- **Step 3:** Test listesi - Accordion/Tab yapısı
  - Her konu için ayrı bölüm
  - Her test için buton (test adı + soru sayısı)

**Metodlar:**

- `onLessonChange()`: Step 2'ye geç, test kitaplarını yükle
- `selectBook(bookId: string)`: Kitap seç, testleri konulara göre yükle, Step 3'e geç
- `getSubjectName(subjectId: string)`: Subject ID'den isim al (cache'lenmiş subjects listesinden)
- `startTest(testId: string)`: Test çözmeye başla

**Placeholder Resim:**

- `frontend/public/placeholder-book-cover.svg` oluştur (opsiyonel)
- Veya `https://via.placeholder.com/200x300/6366f1/ffffff?text=Kitap+Kapağı` kullan
- CSS ile aspect ratio koru (200x300 veya 3:4.5)

### 4. Stil İyileştirmeleri

**Component Styles:**

- Kitap kartları için hover efektleri
- Grid responsive tasarım (mobile: 1 col, tablet: 2 col, desktop: 3-4 col)
- Test listesi için accordion animasyonları
- Loading states için skeleton screens

## UI/UX İyileştirmeleri

### Breadcrumb Navigasyon

- Step göstergesi: "1. Sınav Türü Seç → 2. Kitap Seç → 3. Test Seç"
- Geri butonu her step'te

### Empty States

- Kitap bulunamadığında mesaj
- Test bulunamadığında mesaj

### Loading States

- Kitap yüklenirken skeleton cards
- Test yüklenirken skeleton list items

## Test Senaryoları

1. Sınav türü ve ders seçildiğinde ilgili kitaplar gösterilmeli
2. Kitap seçildiğinde o kitaptaki testler konulara göre gruplanmalı
3. Placeholder resimler tüm kitaplarda görünmeli
4. Responsive tasarım mobilde çalışmalı
5. Geri navigasyon çalışmalı

## Notlar

- Veritabanı değişikliği YOK (cover_image_url eklenmeyecek)
- Placeholder resimler frontend'de handle edilecek
- Backend'deki mevcut endpoint'ler korunacak (geriye dönük uyumluluk)
- Subject isimlerini almak için `getSubjects` API'si kullanılacak veya grouped response'a subject bilgisi eklenecek

### To-dos

- [ ] Backend: TestBookRepository'ye find_by_exam_type_and_lesson metodu ekle ve implementasyonunu yap
- [ ] Backend: TestManagementService'e list_test_books_by_exam_type_and_lesson ve list_practice_tests_grouped_by_subject metodlarını ekle
- [ ] Backend: list_test_books handler'ını güncelle ve yeni list_practice_tests_grouped_by_subject handler'ı ekle
- [ ] Backend: Yeni grouped endpoint için route ekle
- [ ] Frontend: PracticeTestsGrouped interface'i ekle
- [ ] Frontend: TestService'e getPracticeTestsGrouped metodu ekle ve getTestBooks'u güncelle
- [ ] Frontend: TestSelectorComponent'i 3 adımlı akışa göre yeniden tasarla (kart görünümü + gruplanmış test listesi)
- [ ] Frontend: Placeholder resim implementasyonu ve styling
- [ ] Frontend: Breadcrumb, empty states, loading states ve responsive tasarım iyileştirmeleri