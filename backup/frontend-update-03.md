# Frontend - Practice Test Subject İlişki Güncelleme Planı

## Genel Bakış

Backend API artık `practice_tests` tablosunda `subject_id` kolonunu destekliyor. Frontend'te practice test oluştururken ve güncellerken subject seçimi yapılabilmesi ve practice test listesinde subject bilgisinin gösterilmesi gerekiyor.

## Değişiklikler

### 1. Model Güncellemeleri

**Dosya:** `frontend/src/app/models/test.models.ts`

- `PracticeTest` interface: `subject_id: string` ekle
- `CreatePracticeTestRequest` interface: `subject_id: string` ekle (required)
- `UpdatePracticeTestRequest` interface: `subject_id?: string` ekle (optional)

**Not:** `TestBook` interface'inde `subject_id` yerine `subject_ids: string[]` olmalı (önceki güncellemeden). Eğer hala `subject_id` varsa, bu da güncellenmeli.

### 2. Service Güncellemeleri

**Dosya:** `frontend/src/app/features/admin/services/admin.service.ts`

- Yeni metod ekle: `getTestBookSubjects(testBookId: string): Observable<ApiResponse<Subject[]>>`
  - Endpoint: `GET /api/v1/test-books/{id}/subjects`
  - Test book'un subject'lerini getirmek için kullanılacak

**Dosya:** `frontend/src/app/features/tests/services/test.service.ts`

- Service metodları değişmeyecek (TypeScript otomatik handle edecek)
- Response modelleri `subject_id` içerecek

### 3. Form Component Güncellemeleri

**Dosya:** `frontend/src/app/features/admin/components/practice-tests/practice-test-form.component.ts`

- Form control'e `subject_id` ekle (required validation)
- `filteredSubjects` signal'ı ekle (test book'un subject'leri için)
- `isLoadingSubjects` signal'ı ekle
- `onTestBookChange()` metodu ekle:
  - Test book seçildiğinde o test book'un subject'lerini yükle (`adminService.getTestBookSubjects()`)
  - Subject dropdown'ını aktif et
  - Subject seçimini reset et
- Template'e subject seçimi ekle:
  - Test book seçiminden sonra gösterilecek
  - Dropdown ile subject seçimi
  - Loading state gösterimi
  - Validation mesajları
- `loadPracticeTest()` metodunu güncelle:
  - Practice test yüklendiğinde `subject_id` değerini form'a yükle
  - Test book'un subject'lerini yükle (dropdown için)
- `onSubmit()` metodunu güncelle:
  - `CreatePracticeTestRequest` ve `UpdatePracticeTestRequest`'e `subject_id` ekle

**UI Akışı:**
1. Kullanıcı test kitabı seçer
2. Test kitabı seçildiğinde o kitabın subject'leri yüklenir
3. Subject dropdown aktif olur ve kullanıcı subject seçebilir
4. Form submit edildiğinde `subject_id` gönderilir

### 4. List Component Güncellemeleri

**Dosya:** `frontend/src/app/features/admin/components/practice-tests/practice-tests-list.component.ts`

- `subjects` signal'ı ekle (tüm subject'leri tutmak için)
- `loadSubjects()` metodu ekle (tüm subject'leri yüklemek için)
- `getSubjectName(subjectId: string): string` metodu ekle
- Template'i güncelle:
  - Practice test bilgilerinde subject adını göster
  - Test book adı ve subject adını birlikte göster

**UI Değişikliği:** Practice test listesinde her test için subject bilgisi gösterilecek

### 5. Test Selector Component (Opsiyonel)

**Dosya:** `frontend/src/app/features/tests/components/test-selector/test-selector.component.ts`

- Bu component değişiklik gerektirmiyor (sadece practice test listeler, subject bilgisi göstermiyor)
- Model değişikliği TypeScript tarafından otomatik yakalanacak

## Önemli Notlar

1. **Test Book Subject Loading:** Test book seçildikten sonra o test book'un subject'lerini yüklemek için `/api/v1/test-books/{id}/subjects` endpoint'i kullanılacak.

2. **Validation:** 
   - `subject_id` zorunlu olacak (create için)
   - Test book seçilmeden subject seçilemeyecek
   - Sadece seçilen test book'un subject'leri gösterilecek

3. **Backward Compatibility:** API response'larda `subject_id` eklenecek. Mevcut kodlar TypeScript tip kontrolü sayesinde otomatik uyum sağlayacak.

4. **Error Handling:** 
   - Test book'un subject'leri yüklenemezse hata mesajı gösterilmeli
   - Subject seçimi zorunlu olduğu için validation mesajları gösterilmeli

## Test Edilmesi Gerekenler

1. Practice test oluşturma (test book seçimi → subject seçimi → form submit)
2. Practice test güncelleme (subject_id değişikliği)
3. Practice test listeleme (subject bilgisi gösterimi)
4. Test book değiştirildiğinde subject dropdown'ının güncellenmesi
5. Form validation (subject_id zorunluluğu)
6. Loading state'leri (subject'ler yüklenirken)

