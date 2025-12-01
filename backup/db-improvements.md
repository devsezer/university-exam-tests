# Database Improvements - Lessons and Subjects Refactoring

## Genel Bakış

Mevcut yapıda `subjects` tablosu sadece `exam_type_id` ile bağlı. Bu plan ile veritabanı yapısı şu şekilde değiştirilecek:

1. `lessons` tablosu eklenecek (sınav türünden bağımsız dersler: Matematik, Fizik, vb.)
2. `subjects` tablosuna `lesson_id` eklenecek (konular: Rasyonel Sayılar, Limit, vb.)
3. `test_books` tablosuna `lesson_id` eklenecek

**Not**: Veritabanı boş olduğu için veri taşıma işlemi yapılmayacak.

## Database Migrations

### 1. migrations/00011_create_lessons_table.sql

**Amaç**: Sınav türünden bağımsız dersler tablosunu oluşturma

```sql
-- Create lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_lessons_name ON lessons(name);
CREATE INDEX idx_lessons_created_at ON lessons(created_at DESC);
```

### 2. migrations/00012_add_lesson_id_to_subjects.sql

**Amaç**: Subjects tablosuna lesson_id eklemek

```sql
-- Add lesson_id column to subjects
ALTER TABLE subjects ADD COLUMN lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE;

-- Update unique constraint (drop old, add new)
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_name_exam_type_id_key;
ALTER TABLE subjects ADD CONSTRAINT subjects_name_lesson_exam_type_unique UNIQUE(name, lesson_id, exam_type_id);

-- Create index
CREATE INDEX idx_subjects_lesson_id ON subjects(lesson_id);
```

### 3. migrations/00013_add_lesson_id_to_test_books.sql

**Amaç**: Test books tablosuna lesson_id eklemek

```sql
-- Add lesson_id column to test_books
ALTER TABLE test_books ADD COLUMN lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_test_books_lesson_id ON test_books(lesson_id);
CREATE INDEX idx_test_books_lesson_exam_type ON test_books(lesson_id, exam_type_id);
```

## Migration Sırası ve Bağımlılıklar

1. **00011_create_lessons_table.sql** → İlk çalıştırılmalı
2. **00012_add_lesson_id_to_subjects.sql** → 00011'den sonra
3. **00013_add_lesson_id_to_test_books.sql** → 00011'den sonra

## Sonuç Tablo Yapıları

### lessons (yeni)

```sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### subjects (güncellenmiş)

```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    exam_type_id UUID NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, lesson_id, exam_type_id)
);
```

### test_books (güncellenmiş)

```sql
CREATE TABLE test_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    exam_type_id UUID NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    published_year SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## İlişki Diyagramı

```
exam_types (TYT, AYT)
    ↓
lessons (Matematik, Fizik, Türkçe) ← Sınav türünden bağımsız
    ↓
subjects (Rasyonel Sayılar, Limit, vb.) ← lesson_id + exam_type_id ile bağlı
    ↓
test_books ← exam_type_id + lesson_id + subject_id ile bağlı
```

## Kullanım Senaryosu

Test kitabı eklerken admin şu akışı izleyecek:

1. **Sınav Türü Seç** → TYT veya AYT
2. **Ders Seç** → Matematik, Fizik, vb. (sınav türünden bağımsız liste)
3. **Konu Seç** → Seçilen ders ve sınav türüne göre filtrelenmiş konular
4. **Kitap Bilgilerini Gir** → Ad, yayın yılı vb.

