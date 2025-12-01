# Proje Dokümantasyonu

**Proje Adı:** Üniversite Sınavına Hazırlık Deneme Testi Platformu  
**Versiyon:** 1.0.0  
**Son Güncelleme:** 2025

---

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Proje Özeti](#proje-özeti)
3. [Teknoloji Stack](#teknoloji-stack)
4. [Mimari Yapı](#mimari-yapı)
5. [Proje Yapısı](#proje-yapısı)
6. [Veritabanı Şeması](#veritabanı-şeması)
7. [API Dokümantasyonu](#api-dokümantasyonu)
8. [Frontend Yapısı](#frontend-yapısı)
9. [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
10. [Geliştirme Rehberi](#geliştirme-rehberi)
11. [Deployment](#deployment)
12. [Güvenlik](#güvenlik)
13. [Test Stratejisi](#test-stratejisi)

---

## Genel Bakış

Bu proje, üniversite sınavına hazırlanan öğrencilerin deneme testlerini çözüp sonuçlarını takip edebilecekleri modern bir web platformudur. Proje, Clean Architecture prensiplerine göre tasarlanmış, Rust ve Angular teknolojileri kullanılarak geliştirilmiştir.

### Temel Özellikler

- ✅ Kullanıcı kaydı ve kimlik doğrulama (JWT tabanlı)
- ✅ Rol tabanlı erişim kontrolü (RBAC)
- ✅ Deneme testi çözme ve sonuç hesaplama
- ✅ Test sonuçlarını görüntüleme ve analiz
- ✅ Admin paneli ile içerik yönetimi
- ✅ Sınav türü ve ders bazlı test organizasyonu
- ✅ Redis cache desteği
- ✅ OpenAPI/Swagger dokümantasyonu
- ✅ Docker containerization

---

## Proje Özeti

### Amaç

Öğrencilerin üniversite sınavına hazırlanırken çözdükleri deneme testlerinin cevaplarını sisteme girip, sistemin otomatik olarak test sonucunu hesaplayarak kaydetmesini sağlamak. Böylece öğrenciler başarı durumlarını ve gelişimlerini takip edebilirler.

### Kullanıcı Senaryoları

1. **Öğrenci:**
   - Hesap oluşturma ve giriş yapma
   - Sınav türüne (TYT, AYT) ve derse göre test kitapları görüntüleme
   - Deneme testi seçip cevaplarını girme
   - Test sonuçlarını anında görme
   - Geçmiş test sonuçlarını görüntüleme
   - Aynı testi tekrar çözme

2. **Admin:**
   - Kullanıcı yönetimi
   - Rol yönetimi
   - Sınav türleri, dersler, test kitapları ve deneme testleri ekleme/düzenleme
   - Sistem içeriğini yönetme

---

## Teknoloji Stack

### Backend

| Kategori | Teknoloji | Versiyon | Amaç |
|----------|-----------|----------|------|
| **Dil** | Rust | Latest Stable | Ana programlama dili |
| **Runtime** | Tokio | 1.48 | Async runtime |
| **Web Framework** | Axum | 0.8 | HTTP server ve routing |
| **Veritabanı** | PostgreSQL | 15+ | Ana veri deposu |
| **ORM/Query** | SQLx | 0.8 | Veritabanı işlemleri |
| **Cache** | Redis | 7+ | Önbellekleme |
| **Redis Client** | redis-rs | 0.27 | Redis async client |
| **Middleware** | Tower | 0.5 | Service middleware |
| **HTTP Middleware** | Tower-HTTP | 0.6 | HTTP middleware (CORS, compression) |
| **Authentication** | JWT | 10.2 | Token tabanlı kimlik doğrulama |
| **Password Hashing** | Argon2 | 0.5 | Şifre hashleme |
| **Serialization** | Serde | 1.0 | JSON serileştirme |
| **Validation** | Validator | 0.20 | Veri doğrulama |
| **Error Handling** | ThisError | 2.0 | Hata yönetimi |
| **Logging** | Tracing | 0.1 | Yapılandırılmış loglama |
| **OpenAPI** | Utoipa | 5.4 | API dokümantasyonu |
| **Utilities** | UUID, Chrono | Latest | Yardımcı kütüphaneler |

### Frontend

| Kategori | Teknoloji | Versiyon | Amaç |
|----------|-----------|----------|------|
| **Framework** | Angular | 21.0 | Web framework |
| **Language** | TypeScript | 5.9 | Programlama dili |
| **Styling** | Tailwind CSS | 3.4 | CSS framework |
| **Build Tool** | Angular Build | 21.0 | Build sistemi |
| **Testing** | Vitest | 4.0 | Test framework |

### DevOps

| Kategori | Teknoloji | Versiyon | Amaç |
|----------|-----------|----------|------|
| **Containerization** | Docker | Latest | Containerization |
| **Orchestration** | Docker Compose | Latest | Multi-container yönetimi |
| **Database** | PostgreSQL | 15-alpine | Veritabanı container |
| **Cache** | Redis | 7-alpine | Cache container |

---

## Mimari Yapı

Proje, **Clean Architecture** prensiplerine göre tasarlanmıştır ve **Domain-Driven Design (DDD)** yaklaşımını benimser.

### Katman Yapısı

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────┐ │
│  │   Routes    │ │  Handlers   │ │    Middleware     │ │
│  │   (Axum)    │ │  (Axum)     │ │    (Tower)        │ │
│  └─────────────┘ └─────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │ depends on
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────┐ │
│  │  Services   │ │    DTOs     │ │  Use Cases        │ │
│  │             │ │             │ │                   │ │
│  └─────────────┘ └─────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │ depends on
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────┐ │
│  │  Entities   │ │ Repository  │ │  Domain Errors    │ │
│  │             │ │   Traits    │ │                   │ │
│  └─────────────┘ └─────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ▲ implements
                        │
┌─────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                      │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────┐ │
│  │  Database   │ │    Cache    │ │  External        │ │
│  │   (SQLx)    │ │   (Redis)   │ │  Adapters        │ │
│  └─────────────┘ └─────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Katman Sorumlulukları

#### 1. Domain Layer (`crates/domain/`)

**Amaç:** İş mantığının çekirdeği, framework'ten bağımsız.

**Bileşenler:**
- **Entities:** İş nesneleri (User, Role, PracticeTest, TestResult, vb.)
- **Repository Traits:** Veri erişim arayüzleri
- **Domain Errors:** İş kuralı ihlalleri

**Kurallar:**
- ❌ Harici framework bağımlılıkları yok
- ❌ I/O işlemleri yok
- ✅ Sadece saf Rust tipleri
- ✅ Davranış trait'ler aracılığıyla tanımlanır

#### 2. Application Layer (`crates/application/`)

**Amaç:** Use case'leri orkestra eder ve uygulama özel iş kurallarını içerir.

**Bileşenler:**
- **Services:** Uygulama iş akışları (AuthService, TestSolvingService, vb.)
- **DTOs:** Servis sınırları için veri transfer nesneleri
- **Application Errors:** Use case özel hataları

**Kurallar:**
- ✅ Sadece Domain katmanına bağımlı
- ✅ Giriş/çıkış sözleşmelerini tanımlar
- ❌ Doğrudan veritabanı erişimi yok
- ❌ HTTP özel mantık yok

#### 3. Infrastructure Layer (`crates/infrastructure/`)

**Amaç:** Harici sistemlerle entegrasyon sağlar.

**Bileşenler:**
- **Database:** SQLx ile PostgreSQL implementasyonu
- **Cache:** Redis implementasyonu
- **Security:** JWT ve şifre hashleme
- **Config:** Uygulama konfigürasyonu

**Kurallar:**
- ✅ Domain trait'lerini implement eder
- ✅ Harici kütüphanelerle çalışır

#### 4. Presentation Layer (`crates/api/`)

**Amaç:** HTTP isteklerini işler ve yanıtlar döner.

**Bileşenler:**
- **Routes:** Endpoint tanımları
- **Handlers:** HTTP istek işleyicileri
- **Middleware:** Kimlik doğrulama, CORS, logging
- **DTOs:** Request/Response nesneleri
- **State:** Uygulama durumu

**Kurallar:**
- ✅ Application katmanına bağımlı
- ✅ HTTP özel mantık burada

### Bağımlılık Akışı

```
Presentation → Application → Domain ← Infrastructure
```

**Önemli:** Domain katmanı hiçbir katmana bağımlı değildir. Infrastructure, Domain'deki trait'leri implement eder.

---

## Proje Yapısı

### Workspace Yapısı

```
deneme02/
├── Cargo.toml                 # Workspace konfigürasyonu
├── Cargo.lock                 # Dependency lock dosyası
├── Dockerfile                 # Backend container tanımı
├── docker-compose.yml         # Multi-container orchestration
├── backup/                    # Eski dokümantasyonlar (yedek)
├── docs/                      # Proje dokümantasyonu
│   └── project-documentation.md
├── migrations/                # Veritabanı migration dosyaları
│   ├── 00001_create_users_table.sql
│   ├── 00002_create_refresh_tokens_table.sql
│   └── ...
├── scripts/                   # Yardımcı scriptler
│   └── generate_admin_hash.sh
├── crates/                    # Rust workspace crates
│   ├── domain/                # Domain layer
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── entities/      # Domain entities
│   │       │   ├── user.rs
│   │       │   ├── role.rs
│   │       │   ├── practice_test.rs
│   │       │   ├── test_result.rs
│   │       │   └── ...
│   │       ├── repositories/  # Repository traits
│   │       │   ├── user_repository.rs
│   │       │   ├── test_repository.rs
│   │       │   └── ...
│   │       └── errors/         # Domain errors
│   ├── application/            # Application layer
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── services/      # Business logic services
│   │       │   ├── auth_service.rs
│   │       │   ├── test_solving_service.rs
│   │       │   ├── test_management_service.rs
│   │       │   └── result_service.rs
│   │       └── dto/            # Application DTOs
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── database/      # Database implementations
│   │       │   ├── postgres_user_repository.rs
│   │       │   ├── postgres_test_repository.rs
│   │       │   └── ...
│   │       ├── security/      # Security utilities
│   │       │   ├── jwt.rs
│   │       │   └── password.rs
│   │       └── config/         # Configuration
│   └── api/                   # Presentation layer
│       ├── Cargo.toml
│       └── src/
│           ├── main.rs        # Application entry point
│           ├── lib.rs
│           ├── routes/        # API routes
│           │   ├── auth_routes.rs
│           │   ├── test_routes.rs
│           │   ├── user_routes.rs
│           │   └── ...
│           ├── handlers/      # Request handlers
│           │   ├── auth_handler.rs
│           │   ├── test_handler.rs
│           │   └── ...
│           ├── middleware/    # HTTP middleware
│           │   ├── auth_middleware.rs
│           │   └── ...
│           ├── dto/           # Request/Response DTOs
│           │   ├── request/
│           │   └── response/
│           ├── extractors/    # Axum extractors
│           │   └── current_user.rs
│           ├── errors/        # HTTP errors
│           ├── state/          # Application state
│           └── openapi.rs      # OpenAPI documentation
└── frontend/                  # Angular frontend
    ├── package.json
    ├── angular.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── src/
        ├── main.ts
        ├── index.html
        ├── app/
        │   ├── app.ts
        │   ├── app.routes.ts
        │   ├── core/          # Core services
        │   │   ├── services/
        │   │   ├── guards/
        │   │   └── interceptors/
        │   ├── features/      # Feature modules
        │   │   ├── auth/
        │   │   ├── dashboard/
        │   │   ├── tests/
        │   │   ├── results/
        │   │   └── admin/
        │   ├── models/        # TypeScript models
        │   └── shared/        # Shared components
        └── environments/
```

### Crate Detayları

#### Domain Crate

**Bağımlılıklar:** Sadece standart Rust kütüphaneleri ve serde, uuid, chrono gibi yardımcılar.

**Entity'ler:**
- `User`: Kullanıcı bilgileri
- `Role`: Rol tanımları
- `RefreshToken`: Refresh token bilgileri
- `ExamType`: Sınav türleri (TYT, AYT)
- `Lesson`: Dersler (Matematik, Türkçe, vb.)
- `Subject`: Ders konuları
- `TestBook`: Test kitapları
- `PracticeTest`: Deneme testleri
- `TestResult`: Test sonuçları

#### Application Crate

**Bağımlılıklar:** Domain crate

**Servisler:**
- `AuthService`: Kimlik doğrulama ve yetkilendirme
- `TestSolvingService`: Test çözme işlemleri
- `TestManagementService`: Test yönetimi (admin)
- `ResultService`: Sonuç görüntüleme ve analiz

#### Infrastructure Crate

**Bağımlılıklar:** Domain crate, SQLx, Redis, JWT kütüphaneleri

**Implementasyonlar:**
- PostgreSQL repository implementasyonları
- Redis cache implementasyonları
- JWT ve şifre hashleme utilities
- Konfigürasyon yönetimi

#### API Crate

**Bağımlılıklar:** Application, Infrastructure, Domain crates, Axum, Tower

**Bileşenler:**
- HTTP route tanımları
- Request handler'lar
- Middleware'ler (auth, CORS, logging)
- OpenAPI dokümantasyonu

---

## Veritabanı Şeması

### Tablolar

#### 1. users
Kullanıcı bilgileri.

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| username | VARCHAR(50) | Kullanıcı adı (unique, case-insensitive) |
| email | VARCHAR(255) | E-posta (unique, case-insensitive) |
| password_hash | VARCHAR(255) | Argon2 hash |
| is_active | BOOLEAN | Aktiflik durumu |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |
| updated_at | TIMESTAMPTZ | Güncellenme zamanı |
| deleted_at | TIMESTAMPTZ | Soft delete zamanı (nullable) |
| deleted_by | UUID | Silen kullanıcı (nullable, FK) |

**İndeksler:**
- `idx_users_email_unique`: Unique email (deleted_at IS NULL)
- `idx_users_username_unique`: Unique username (deleted_at IS NULL)
- `idx_users_email`: Email lookup
- `idx_users_username`: Username lookup
- `idx_users_is_active`: Active users filter
- `idx_users_deleted_at`: Deleted users filter
- `idx_users_created_at`: Created date sorting

#### 2. refresh_tokens
Refresh token'lar.

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| user_id | UUID | Kullanıcı ID (FK) |
| token | TEXT | Token değeri |
| expires_at | TIMESTAMPTZ | Son kullanma zamanı |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

**İndeksler:**
- `idx_refresh_tokens_user_id`: User lookup
- `idx_refresh_tokens_token`: Token lookup
- `idx_refresh_tokens_expires_at`: Expiration cleanup

#### 3. roles
Roller.

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| name | VARCHAR(50) | Rol adı (unique) |
| description | TEXT | Rol açıklaması |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

#### 4. user_roles
Kullanıcı-rol ilişkisi (many-to-many).

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| user_id | UUID | Kullanıcı ID (FK) |
| role_id | UUID | Rol ID (FK) |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

**Primary Key:** (user_id, role_id)

#### 5. exam_types
Sınav türleri (TYT, AYT).

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| name | VARCHAR(50) | Sınav türü adı (unique) |
| description | TEXT | Açıklama |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

#### 6. lessons
Dersler.

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Ders adı (unique) |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

#### 7. subjects
Ders konuları.

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Konu adı |
| lesson_id | UUID | Ders ID (FK) |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

#### 8. test_books
Test kitapları.

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Kitap adı |
| exam_type_id | UUID | Sınav türü ID (FK) |
| lesson_id | UUID | Ders ID (FK) |
| published_year | INTEGER | Yayın yılı |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

#### 9. test_book_subjects
Test kitabı-konu ilişkisi (many-to-many).

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| test_book_id | UUID | Test kitabı ID (FK) |
| subject_id | UUID | Konu ID (FK) |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

**Primary Key:** (test_book_id, subject_id)

#### 10. practice_tests
Deneme testleri.

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Test adı |
| test_number | INTEGER | Test numarası |
| question_count | INTEGER | Soru sayısı |
| answer_key | TEXT | Cevap anahtarı (JSON veya string) |
| test_book_id | UUID | Test kitabı ID (FK) |
| subject_id | UUID | Konu ID (FK) |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

**Unique Constraint:** (test_book_id, test_number)

#### 11. test_results
Test sonuçları.

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| user_id | UUID | Kullanıcı ID (FK) |
| practice_test_id | UUID | Deneme testi ID (FK) |
| user_answers | TEXT | Kullanıcı cevapları (JSON) |
| correct_count | INTEGER | Doğru sayısı |
| wrong_count | INTEGER | Yanlış sayısı |
| empty_count | INTEGER | Boş sayısı |
| net_score | DECIMAL(10,2) | Net puan (Doğru - Yanlış/4) |
| solved_at | TIMESTAMPTZ | Çözülme zamanı |

**İndeksler:**
- `idx_test_results_user_id`: User results lookup
- `idx_test_results_practice_test_id`: Test results lookup
- `idx_test_results_solved_at`: Date sorting

### İlişki Diyagramı

```
users ──┬── refresh_tokens
        │
        └── user_roles ── roles
        │
        └── test_results ── practice_tests ── test_books ── exam_types
                                                              │
                                                              └── lessons
                                                              │
                                                              └── subjects
                                                              │
                                                              └── test_book_subjects
```

---

## API Dokümantasyonu

### Base URL

```
http://localhost:8080/api/v1
```

### Swagger UI

API dokümantasyonu Swagger UI üzerinden erişilebilir:

```
http://localhost:8080/swagger-ui
```

### Authentication

API, JWT (JSON Web Token) tabanlı kimlik doğrulama kullanır.

**Token Türleri:**
- **Access Token:** Kısa ömürlü (varsayılan: 15 dakika)
- **Refresh Token:** Uzun ömürlü (varsayılan: 7 gün)

**Header Format:**
```
Authorization: Bearer <access_token>
```

### Endpoint'ler

#### Health Check

##### GET /health/live
Liveness kontrolü.

**Response:**
```json
{
  "status": "ok"
}
```

##### GET /health/ready
Readiness kontrolü (veritabanı bağlantısı kontrol edilir).

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

#### Authentication

##### POST /auth/register
Kullanıcı kaydı.

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "created_at": "ISO8601"
  },
  "message": "User registered successfully"
}
```

##### POST /auth/login
Kullanıcı girişi.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "string",
    "refresh_token": "string",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

##### POST /auth/refresh
Access token yenileme.

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "string",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

##### POST /auth/logout
Çıkış yapma (refresh token'ı geçersiz kılar).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Tests (Public)

##### GET /tests/exam-types
Sınav türlerini listele.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "TYT",
      "description": "Temel Yeterlilik Testi"
    }
  ]
}
```

##### GET /tests/lessons
Dersleri listele.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Matematik"
    }
  ]
}
```

##### GET /tests/test-books
Test kitaplarını listele (filtreleme ile).

**Query Parameters:**
- `exam_type_id` (optional): Sınav türü ID
- `lesson_id` (optional): Ders ID
- `subject_id` (optional): Konu ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Limit Yayınları TYT Matematik",
      "exam_type": {...},
      "lesson": {...},
      "subjects": [...],
      "published_year": 2024
    }
  ]
}
```

##### GET /tests/practice-tests/:test_book_id
Belirli bir test kitabına ait deneme testlerini listele.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Deneme 1",
      "test_number": 1,
      "question_count": 40,
      "test_book": {...}
    }
  ]
}
```

##### GET /tests/practice-tests/:id/details
Deneme testi detaylarını getir (cevap anahtarı hariç).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Deneme 1",
    "test_number": 1,
    "question_count": 40,
    "test_book": {...},
    "subject": {...}
  }
}
```

#### Test Solving (Authenticated)

##### POST /tests/solve/:practice_test_id
Test çöz ve sonucu kaydet.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "answers": ["A", "B", "C", "D", "_", ...] // "_" = boş
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "result_id": "uuid",
    "correct_count": 35,
    "wrong_count": 3,
    "empty_count": 2,
    "net_score": 34.25,
    "solved_at": "ISO8601"
  }
}
```

#### Results (Authenticated)

##### GET /results
Kullanıcının tüm test sonuçlarını listele.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `practice_test_id` (optional): Belirli bir test için filtrele
- `limit` (optional): Sayfa başına kayıt sayısı
- `offset` (optional): Sayfa offset'i

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "practice_test": {
        "id": "uuid",
        "name": "Deneme 1",
        "test_book": {...}
      },
      "correct_count": 35,
      "wrong_count": 3,
      "empty_count": 2,
      "net_score": 34.25,
      "solved_at": "ISO8601"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

##### GET /results/:id
Belirli bir test sonucunun detaylarını getir.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "practice_test": {...},
    "user_answers": ["A", "B", "C", ...],
    "correct_count": 35,
    "wrong_count": 3,
    "empty_count": 2,
    "net_score": 34.25,
    "solved_at": "ISO8601"
  }
}
```

#### Admin Endpoints

Tüm admin endpoint'leri `/admin` prefix'i ile başlar ve `admin` rolü gerektirir.

##### Users Management

- `GET /admin/users`: Kullanıcıları listele
- `GET /admin/users/:id`: Kullanıcı detayı
- `PUT /admin/users/:id`: Kullanıcı güncelle
- `DELETE /admin/users/:id`: Kullanıcı sil (soft delete)

##### Roles Management

- `GET /admin/roles`: Rolleri listele
- `POST /admin/roles`: Rol oluştur
- `PUT /admin/roles/:id`: Rol güncelle
- `DELETE /admin/roles/:id`: Rol sil
- `POST /admin/users/:user_id/roles/:role_id`: Kullanıcıya rol ata
- `DELETE /admin/users/:user_id/roles/:role_id`: Kullanıcıdan rol kaldır

##### Test Management

- `POST /admin/exam-types`: Sınav türü oluştur
- `PUT /admin/exam-types/:id`: Sınav türü güncelle
- `POST /admin/lessons`: Ders oluştur
- `PUT /admin/lessons/:id`: Ders güncelle
- `POST /admin/subjects`: Konu oluştur
- `PUT /admin/subjects/:id`: Konu güncelle
- `POST /admin/test-books`: Test kitabı oluştur
- `PUT /admin/test-books/:id`: Test kitabı güncelle
- `POST /admin/practice-tests`: Deneme testi oluştur
- `PUT /admin/practice-tests/:id`: Deneme testi güncelle

### Hata Yönetimi

Tüm hatalar standart bir format ile döner:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

**HTTP Status Kodları:**
- `200`: Başarılı
- `201`: Oluşturuldu
- `400`: Geçersiz istek
- `401`: Yetkisiz erişim
- `403`: Yasak erişim
- `404`: Bulunamadı
- `409`: Çakışma (örn: duplicate email)
- `500`: Sunucu hatası

---

## Frontend Yapısı

### Genel Mimari

Frontend, Angular 21 ile geliştirilmiştir ve **feature-based** modüler yapı kullanır.

### Klasör Yapısı

```
frontend/src/app/
├── app.ts                    # Ana component
├── app.routes.ts             # Route tanımları
├── app.config.ts             # App configuration
├── core/                     # Core services (singleton)
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── api.service.ts
│   │   └── ...
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── admin.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts
├── features/                 # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── auth.routes.ts
│   ├── dashboard/
│   │   └── components/
│   ├── tests/
│   │   ├── components/
│   │   │   ├── test-list/
│   │   │   ├── test-solve/
│   │   │   └── ...
│   │   └── tests.routes.ts
│   ├── results/
│   │   ├── components/
│   │   └── results.routes.ts
│   └── admin/
│       ├── components/
│       │   ├── users/
│       │   ├── roles/
│       │   ├── test-books/
│       │   └── ...
│       └── admin.routes.ts
├── models/                   # TypeScript interfaces
│   ├── user.model.ts
│   ├── test.model.ts
│   └── ...
└── shared/                   # Shared components
    ├── components/
    └── directives/
```

### Routing

**Ana Route'lar:**
- `/`: Dashboard'a yönlendirme
- `/auth`: Kimlik doğrulama (login, register)
- `/dashboard`: Ana sayfa (auth guard)
- `/tests`: Test listesi ve çözme (auth guard)
- `/results`: Test sonuçları (auth guard)
- `/admin`: Admin paneli (admin guard)

### Authentication Flow

1. Kullanıcı login/register yapar
2. Access token ve refresh token alınır
3. Token'lar localStorage'a kaydedilir
4. `AuthInterceptor` her istekte token'ı header'a ekler
5. Token süresi dolduğunda refresh token ile yenilenir
6. Refresh token da geçersizse kullanıcı logout edilir

### State Management

Şu anda Angular'ın built-in state management kullanılıyor. İleride NgRx veya Akita eklenebilir.

### Styling

- **Tailwind CSS:** Utility-first CSS framework
- **Responsive Design:** Mobile-first yaklaşım
- **Component Styles:** Component-scoped styles

### API Integration

- **Base URL:** `http://localhost:8080/api/v1`
- **HTTP Client:** Angular HttpClient
- **Error Handling:** Global error interceptor
- **Loading States:** Component-level loading indicators

---

## Kurulum ve Çalıştırma

### Gereksinimler

- **Rust:** 1.83+ (https://rustup.rs/)
- **Node.js:** 18+ (https://nodejs.org/)
- **Docker & Docker Compose:** Latest (https://www.docker.com/)
- **PostgreSQL:** 15+ (Docker ile otomatik kurulur)
- **Redis:** 7+ (Docker ile otomatik kurulur)

### Backend Kurulumu

#### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd deneme02
```

#### 2. Environment Variables

`.env` dosyası oluşturun (veya `.env.example`'dan kopyalayın):

```env
APP_NAME=deneme-test-platform
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8080

DATABASE_URL=postgres://postgres:postgres@localhost:5432/app_db
DATABASE_MAX_CONNECTIONS=10

REDIS_URL=redis://localhost:6379

JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_ACCESS_TOKEN_EXPIRATION_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRATION_DAYS=7

RUST_LOG=info,tower_http=debug,sqlx=warn
```

#### 3. Docker Compose ile Servisleri Başlatın

```bash
docker-compose up -d db redis
```

Bu komut PostgreSQL ve Redis container'larını başlatır.

#### 4. Veritabanı Migration'larını Çalıştırın

Migration'lar uygulama başlatıldığında otomatik olarak çalışır. Manuel çalıştırmak için:

```bash
# SQLx CLI kurulumu (gerekirse)
cargo install sqlx-cli

# Migration'ları çalıştır
sqlx migrate run
```

#### 5. Backend'i Çalıştırın

**Development:**
```bash
cargo run --bin api
```

**Release Build:**
```bash
cargo build --release --bin api
./target/release/api
```

Backend `http://localhost:8080` adresinde çalışacaktır.

### Frontend Kurulumu

#### 1. Dependencies'leri Yükleyin

```bash
cd frontend
npm install
```

#### 2. Environment Configuration

`src/environments/environment.ts` dosyasını kontrol edin:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

#### 3. Development Server'ı Başlatın

```bash
npm start
# veya
ng serve
```

Frontend `http://localhost:4200` adresinde çalışacaktır.

### Docker ile Tam Kurulum

Tüm servisleri Docker Compose ile başlatmak için:

```bash
docker-compose up -d
```

Bu komut:
- PostgreSQL container'ını başlatır
- Redis container'ını başlatır
- Backend API container'ını build edip başlatır

**Not:** Frontend şu anda Docker'da değil, local'de çalıştırılmalıdır.

### İlk Admin Kullanıcı Oluşturma

Migration `00010_create_admin_user.sql` otomatik olarak bir admin kullanıcı oluşturur. Şifre hash'i oluşturmak için:

```bash
./scripts/generate_admin_hash.sh
```

Veya manuel olarak:

```bash
cargo run --bin api -- --generate-hash <password>
```

---

## Geliştirme Rehberi

### Kod Standartları

#### Rust

- **Formatting:** `cargo fmt`
- **Linting:** `cargo clippy`
- **Documentation:** `cargo doc`

**Önemli Kurallar:**
- Domain katmanına harici bağımlılık eklenmez
- Her public fonksiyon dokümante edilmelidir
- Error handling için `thiserror` kullanılır
- Async işlemler için `tokio` kullanılır

#### TypeScript/Angular

- **Formatting:** Prettier (otomatik)
- **Linting:** ESLint (yapılandırılabilir)
- **Type Safety:** Strict mode aktif

**Önemli Kurallar:**
- Her component ve service type-safe olmalıdır
- API çağrıları service'lerde toplanmalıdır
- Error handling için try-catch kullanılmalıdır

### Yeni Özellik Ekleme

#### Backend

1. **Domain Layer:**
   - Entity tanımla (`crates/domain/src/entities/`)
   - Repository trait tanımla (`crates/domain/src/repositories/`)

2. **Infrastructure Layer:**
   - Repository implementasyonu (`crates/infrastructure/src/database/`)

3. **Application Layer:**
   - Service tanımla (`crates/application/src/services/`)
   - DTO tanımla (`crates/application/src/dto/`)

4. **API Layer:**
   - Route tanımla (`crates/api/src/routes/`)
   - Handler yaz (`crates/api/src/handlers/`)
   - Request/Response DTO'ları (`crates/api/src/dto/`)

5. **Migration:**
   - SQL migration dosyası oluştur (`migrations/`)

#### Frontend

1. **Model:**
   - TypeScript interface tanımla (`src/app/models/`)

2. **Service:**
   - API service yaz (`src/app/core/services/`)

3. **Component:**
   - Component oluştur (`src/app/features/<feature>/components/`)

4. **Route:**
   - Route tanımla (`src/app/features/<feature>/<feature>.routes.ts`)

### Testing

#### Backend Tests

```bash
# Tüm testleri çalıştır
cargo test

# Belirli bir test
cargo test test_name

# Integration testler
cargo test --test integration_test
```

#### Frontend Tests

```bash
cd frontend
npm test
```

### Debugging

#### Backend

- **Logging:** `RUST_LOG` environment variable ile log seviyesi ayarlanır
- **Debug Mode:** `cargo run --bin api` ile debug modda çalıştırılabilir
- **Database Queries:** SQLx query logging aktif (`sqlx=debug`)

#### Frontend

- **Browser DevTools:** Angular DevTools extension
- **Network:** Browser Network tab
- **Console:** Browser Console

### Git Workflow

1. Feature branch oluştur: `git checkout -b feature/feature-name`
2. Değişiklikleri commit et: `git commit -m "feat: description"`
3. Push et: `git push origin feature/feature-name`
4. Pull Request oluştur

**Commit Mesaj Formatı:**
- `feat:` Yeni özellik
- `fix:` Bug düzeltme
- `docs:` Dokümantasyon
- `refactor:` Kod refactoring
- `test:` Test ekleme
- `chore:` Build/config değişiklikleri

---

## Deployment

### Production Environment Variables

```env
APP_NAME=deneme-test-platform
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8080

DATABASE_URL=postgres://user:password@db-host:5432/db_name
DATABASE_MAX_CONNECTIONS=20

REDIS_URL=redis://redis-host:6379

JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_ACCESS_TOKEN_EXPIRATION_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRATION_DAYS=7

RUST_LOG=warn
```

### Docker Build

```bash
# Backend image build
docker build -t deneme-api:latest .

# Frontend build (production)
cd frontend
npm run build
```

### Docker Compose Production

`docker-compose.prod.yml` oluşturulabilir:

```yaml
version: '3.8'
services:
  api:
    image: deneme-api:latest
    environment:
      - APP_ENV=production
      # ... diğer env vars
    restart: always
    # ...
```

### Health Checks

- **Liveness:** `GET /health/live`
- **Readiness:** `GET /health/ready`

### Monitoring

- **Logging:** Structured logging (JSON format)
- **Metrics:** (İleride Prometheus eklenebilir)
- **Tracing:** (İleride OpenTelemetry eklenebilir)

---

## Güvenlik

### Authentication & Authorization

- **JWT:** Access token ve refresh token kullanımı
- **Password Hashing:** Argon2 algoritması
- **RBAC:** Rol tabanlı erişim kontrolü
- **Token Expiration:** Kısa ömürlü access token'lar

### API Security

- **CORS:** Yapılandırılabilir CORS politikaları
- **Rate Limiting:** (İleride eklenebilir)
- **Input Validation:** Validator crate ile
- **SQL Injection:** SQLx prepared statements
- **XSS Protection:** Frontend'de Angular'ın built-in koruması

### Data Security

- **Soft Delete:** Veri silme işlemleri soft delete ile
- **Password Policy:** Minimum 8 karakter, karmaşıklık gereksinimleri
- **HTTPS:** Production'da HTTPS kullanılmalı

### Best Practices

1. **Secrets Management:** Environment variables kullanın, kod içine secret yazmayın
2. **Dependency Updates:** Düzenli olarak dependency'leri güncelleyin
3. **Security Audits:** `cargo audit` ile güvenlik açıklarını kontrol edin
4. **Code Reviews:** Tüm değişiklikler review edilmeli

---

## Test Stratejisi

### Backend Testing

#### Unit Tests

- Domain logic testleri
- Service testleri (mock repository'ler ile)
- Utility function testleri

#### Integration Tests

- API endpoint testleri
- Database integration testleri
- End-to-end senaryolar

### Frontend Testing

#### Unit Tests

- Component testleri
- Service testleri
- Guard testleri

#### E2E Tests

- (İleride Cypress veya Playwright eklenebilir)

### Test Coverage

- **Hedef:** %80+ coverage
- **Araçlar:** `cargo-tarpaulin` (Rust), `ng test --code-coverage` (Angular)

---

## Gelecek Geliştirmeler

### Kısa Vadeli

- [ ] Rate limiting implementasyonu
- [ ] Email doğrulama
- [ ] Şifre sıfırlama
- [ ] Test sonuçları için grafikler ve analizler
- [ ] Pagination iyileştirmeleri

### Orta Vadeli

- [ ] File upload (test kitabı PDF'leri)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native veya Flutter)
- [ ] Multi-language support

### Uzun Vadeli

- [ ] Microservices migration
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Performance monitoring (Prometheus, Grafana)
- [ ] Distributed tracing (Jaeger)

---

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

---

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## İletişim

Sorularınız için issue açabilir veya proje maintainer'ları ile iletişime geçebilirsiniz.

---

**Son Güncelleme:** 2025  
**Versiyon:** 1.0.0

