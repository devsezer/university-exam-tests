# Practice Tests - Subject İlişki Planı (Sadece Veritabanı)

## Genel Bakış

`practice_tests` tablosuna `subject_id` kolonu eklenerek, her practice test'in hangi konuya ait olduğu belirlenecek. Test kitabı seçildikten sonra o kitabın konularından birini seçmek mümkün olacak.

## Database Migration

**Dosya:** `migrations/00016_add_subject_id_to_practice_tests.sql`

### Yapılacak Değişiklikler

1. **subject_id Kolonu Ekleme**
   - `practice_tests` tablosuna `subject_id UUID NOT NULL` kolonu ekle
   - Foreign key constraint: `REFERENCES subjects(id) ON DELETE CASCADE`
   - NOT NULL constraint (her test bir konuya ait olmalı)

2. **UNIQUE Constraint Güncelleme**
   - Mevcut `UNIQUE(test_book_id, test_number)` constraint'ini kaldır
   - Yeni constraint ekle: `UNIQUE(test_book_id, subject_id, test_number)`
   - Aynı kitap-konu-test numarası kombinasyonu tekrar edemez

3. **Index Ekleme**
   - `idx_practice_tests_subject` - subject_id için index ekle
   - Subject'e göre filtreleme sorgularını hızlandırmak için

### Migration SQL İçeriği

```sql
-- Add subject_id column to practice_tests table
ALTER TABLE practice_tests 
ADD COLUMN subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE;

-- Drop existing unique constraint
ALTER TABLE practice_tests 
DROP CONSTRAINT IF EXISTS practice_tests_test_book_id_test_number_key;

-- Add new unique constraint with subject_id
ALTER TABLE practice_tests 
ADD CONSTRAINT practice_tests_test_book_subject_number_unique 
UNIQUE(test_book_id, subject_id, test_number);

-- Create index for subject_id
CREATE INDEX idx_practice_tests_subject ON practice_tests(subject_id);
```

## Önemli Notlar

1. **Veritabanı Boş Kabul Ediliyor:** Bu migration veritabanının boş olduğu varsayımıyla hazırlanmıştır. Eğer mevcut veri varsa, migration öncesi yedek alınmalı ve mevcut kayıtlar için `subject_id` değerleri manuel olarak atanmalıdır.

2. **NOT NULL Constraint:** `subject_id` kolonu NOT NULL olarak eklenmiştir. Her practice test mutlaka bir konuya ait olmalıdır.

3. **Foreign Key Cascade:** `ON DELETE CASCADE` sayesinde, bir subject silindiğinde ona ait tüm practice test'ler de otomatik olarak silinecektir.

4. **UNIQUE Constraint:** Aynı test kitabı, aynı konu ve aynı test numarası kombinasyonu tekrar edemez. Bu sayede aynı test kitabından aynı konu için aynı numaralı test birden fazla kez eklenemez.

5. **Backend ve Frontend Değişiklikleri:** Bu migration tamamlandıktan sonra backend ve frontend kodları güncellenmelidir.

## Migration Sırası

Bu migration, `00015_remove_subject_id_from_test_books.sql` migration'ından sonra çalıştırılmalıdır.

## Sonraki Adımlar

1. Backend: `PracticeTest` entity'sine `subject_id` alanı eklenmeli
2. Backend: Repository ve service katmanlarında `subject_id` desteği eklenmeli
3. Frontend: Practice test form'una subject seçimi eklenmeli (test kitabı seçildikten sonra)

