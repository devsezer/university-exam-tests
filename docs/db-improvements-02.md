# Test Book - Subject Many-to-Many İlişki Planı (Sadece Veritabanı)

## Genel Bakış

Mevcut `test_books` tablosundaki tek `subject_id` kolonunu kaldırıp, kitap-konu ilişkisini many-to-many yapıya dönüştürmek için veritabanı migration'ları oluşturulacak. Backend ve frontend değişiklikleri daha sonra yapılacak.

## Database Migration'ları

### 1. Yeni Junction Table Oluşturma
**Dosya:** `migrations/00014_create_test_book_subjects_table.sql`

- `test_book_subjects` junction table oluştur
- Kolonlar:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `test_book_id` UUID NOT NULL REFERENCES test_books(id) ON DELETE CASCADE
  - `subject_id` UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE
  - `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `UNIQUE(test_book_id, subject_id)` constraint (aynı kitap-konu çifti tekrar edemez)
- Index'ler:
  - `idx_test_book_subjects_book` - test_book_id için
  - `idx_test_book_subjects_subject` - subject_id için
  - `idx_test_book_subjects_created_at` - created_at DESC için

### 2. Test Books Tablosundan subject_id Kaldırma
**Dosya:** `migrations/00015_remove_subject_id_from_test_books.sql`

- `test_books` tablosundan `subject_id` kolonunu kaldır
- `idx_test_books_subject` index'ini kaldır (artık gerekli değil)
- Foreign key constraint'i otomatik kaldırılacak

## Migration Sırası

1. **00014_create_test_book_subjects_table.sql** → Önce çalıştırılmalı
2. **00015_remove_subject_id_from_test_books.sql** → Sonra çalıştırılmalı

## Önemli Notlar

1. Migration sırası kritik: Önce junction table oluşturulmalı, sonra `subject_id` kolonu kaldırılmalı
2. Mevcut veriler varsa migration öncesi yedek alınmalı
3. Junction table oluşturulduktan sonra mevcut `test_books` kayıtlarının `subject_id` değerleri manuel olarak `test_book_subjects` tablosuna taşınmalı (eğer veri varsa)
4. Backend kod değişiklikleri bu migration'lar tamamlandıktan sonra yapılacak

