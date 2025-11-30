# Backend Rol Yönetim Sistemi Implementasyon Planı

**Tarih:** 2025-01-XX  
**Durum:** Planlama  
**Hedef:** Backend projesine rol tabanlı erişim kontrolü (RBAC) sistemi eklenmesi

---

## Genel Bakış

Backend projesine rol tabanlı erişim kontrolü (RBAC) sistemi eklenmesi. Admin ve user rolleri ile admin endpoint'lerinin korunması ve kullanıcıların rollerine göre yetkilendirilmesi.

### Roller

- **admin**: Sisteme yeni veri ekleyebilir, user bilgilerini ve test sonuçlarını görebilir
- **user**: Sisteme giriş yapabilir, test kitaplarındaki testleri seçebilir, cevapları girebilir, kendi sonuçlarını görebilir

---

## Mevcut Durum Analizi

### Mevcut Özellikler

- ✅ JWT token yapısı `roles` ve `permissions` alanlarını destekliyor
- ✅ `CurrentUser` extractor'da `has_role()` ve `is_admin()` metodları mevcut
- ✅ JWT Claims struct'ında roles ve permissions alanları var
- ✅ `crates/infrastructure/src/security/jwt.rs` - JWT servisi hazır

### Eksikler

- ❌ Database'de roles ve user_roles tabloları yok
- ❌ Domain layer'da Role entity yok
- ❌ RoleRepository trait ve implementasyonu yok
- ❌ AuthService'de hardcoded "user" rolü kullanılıyor
- ❌ Admin handler'larda rol kontrolü yok
- ❌ UserRepository'de rol yönetim metodları yok

---

## Implementasyon Adımları

### 1. Database Migration'ları

#### 1.1 Roles Tablosu

**Dosya:** `migrations/00008_create_roles_table.sql`

```sql
-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for role name lookups
CREATE INDEX idx_roles_name ON roles(name);

-- Insert default roles
INSERT INTO roles (name, description, is_system) VALUES
    ('admin', 'Administrator with full system access', true),
    ('user', 'Regular authenticated user', true);
```

#### 1.2 User Roles Junction Tablosu

**Dosya:** `migrations/00009_create_user_roles_table.sql`

```sql
-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- Assign default 'user' role to all existing users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'user' AND u.deleted_at IS NULL;
```

---

### 2. Domain Layer

#### 2.1 Role Entity

**Dosya:** `crates/domain/src/entities/role.rs` (YENİ)

```rust
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_system: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Role {
    pub fn new(name: String, description: Option<String>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            description,
            is_system: false,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn is_system_role(&self) -> bool {
        self.is_system
    }
}
```

**Dosya:** `crates/domain/src/entities/mod.rs`
- `role` modülünü export etme

#### 2.2 Role Repository Trait

**Dosya:** `crates/domain/src/repositories/role_repository.rs` (YENİ)

```rust
use async_trait::async_trait;
use uuid::Uuid;
use crate::entities::Role;
use crate::errors::DomainError;

#[async_trait]
pub trait RoleRepository: Send + Sync {
    async fn create(&self, role: &Role) -> Result<Role, DomainError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Role>, DomainError>;
    async fn find_by_name(&self, name: &str) -> Result<Option<Role>, DomainError>;
    async fn list(&self) -> Result<Vec<Role>, DomainError>;
    async fn update(&self, role: &Role) -> Result<Role, DomainError>;
    async fn delete(&self, id: Uuid) -> Result<(), DomainError>;
    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<Role>, DomainError>;
}
```

**Dosya:** `crates/domain/src/repositories/mod.rs`
- `role_repository` modülünü export etme

#### 2.3 User Repository Güncellemeleri

**Dosya:** `crates/domain/src/repositories/user_repository.rs`

Mevcut trait'e ekleme:

```rust
async fn assign_role(&self, user_id: Uuid, role_id: Uuid, assigned_by: Option<Uuid>) -> Result<(), DomainError>;
async fn remove_role(&self, user_id: Uuid, role_id: Uuid) -> Result<(), DomainError>;
async fn get_user_roles(&self, user_id: Uuid) -> Result<Vec<String>, DomainError>;
```

---

### 3. Infrastructure Layer

#### 3.1 Role Repository Implementation

**Dosya:** `crates/infrastructure/src/database/repositories/role_repository_impl.rs` (YENİ)

- `PgRoleRepository` struct'ı oluşturma
- `RoleRepository` trait implementasyonu
- SQL sorguları ve `RoleRow` struct'ı
- Diğer repository implementasyonlarına benzer pattern kullanma

#### 3.2 User Repository Implementation Güncellemeleri

**Dosya:** `crates/infrastructure/src/database/repositories/user_repository_impl.rs`

- `assign_role()`, `remove_role()`, `get_user_roles()` metodlarını implement etme
- `find_by_id()` metodunu güncelleme - rollerle birlikte getirme (JOIN ile)
- `find_by_email()` ve `find_by_username()` metodlarını güncelleme - rollerle birlikte

**Dosya:** `crates/infrastructure/src/database/repositories/mod.rs`
- `role_repository_impl` modülünü export etme
- `PgRoleRepository` export etme

---

### 4. Application Layer - Auth Service Güncellemeleri

#### 4.1 Auth Service Struct Güncellemesi

**Dosya:** `crates/application/src/services/auth_service.rs`

```rust
pub struct AuthServiceImpl<U, R, J, P, RoleRepo>
where
    U: UserRepository,
    R: RefreshTokenRepository,
    J: JwtOperations,
    P: PasswordOperations,
    RoleRepo: RoleRepository,
{
    user_repo: Arc<U>,
    refresh_token_repo: Arc<R>,
    jwt_service: Arc<J>,
    password_service: Arc<P>,
    role_repo: Arc<RoleRepo>, // YENİ
}
```

#### 4.2 Register Metodu Güncellemesi

- Kullanıcı oluşturulduktan sonra default "user" rolünü atama
- `role_repo.find_by_name("user")` ile rolü bulma
- `user_repo.assign_role()` ile rol atama

#### 4.3 Login Metodu Güncellemesi

- Hardcoded `vec!["user".to_string()]` yerine
- `user_repo.get_user_roles(user.id)` ile roller database'den çekme
- JWT token'a gerçek roller ekleme

#### 4.4 Refresh Token Metodu Güncellemesi

- `user_repo.get_user_roles(user.id)` ile roller database'den çekme
- Yeni token'a gerçek roller ekleme

#### 4.5 User to Response Metodu Güncellemesi

- `user_repo.get_user_roles(user.id)` ile roller database'den çekme
- `UserResponse`'a gerçek roller ekleme

---

### 5. API Layer - App State Güncellemesi

**Dosya:** `crates/api/src/state/app_state.rs`

```rust
impl AppState {
    pub fn new(db_pool: DatabasePool, settings: Settings) -> Self {
        // ... mevcut kod ...
        
        // Initialize role repository
        let role_repo = Arc::new(PgRoleRepository::new(db_pool.clone()));
        
        // Create adapters
        let jwt_adapter = Arc::new(JwtAdapter(jwt_service.clone()));
        let password_adapter = Arc::new(PasswordAdapter(password_service.clone()));
        
        // Initialize auth service with role repository
        let auth_service: Arc<dyn AuthService> = Arc::new(AuthServiceImpl::new(
            user_repo,
            refresh_token_repo,
            jwt_adapter,
            password_adapter,
            role_repo, // YENİ
        ));
        
        // ... rest of the code ...
    }
}
```

---

### 6. API Layer - Admin Endpoint Koruması

#### 6.1 RequireAdmin Extractor

**Dosya:** `crates/api/src/extractors/require_admin.rs` (YENİ)

```rust
use axum::extract::FromRequestParts;
use crate::extractors::CurrentUser;
use crate::errors::AppError;
use crate::state::AppState;

pub struct RequireAdmin(pub CurrentUser);

impl FromRequestParts<AppState> for RequireAdmin {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let current_user = CurrentUser::from_request_parts(parts, state).await?;
        
        if !current_user.is_admin() {
            return Err(AppError::Forbidden);
        }
        
        Ok(RequireAdmin(current_user))
    }
}
```

**Alternatif:** Middleware yaklaşımı için `crates/api/src/middleware/require_admin.rs`

#### 6.2 Admin Handler Güncellemeleri

**Dosya:** `crates/api/src/handlers/test_handler.rs`

Tüm admin handler'lara `RequireAdmin` extractor ekleme:

```rust
pub async fn create_exam_type(
    State(state): State<AppState>,
    RequireAdmin(_): RequireAdmin, // YENİ
    Json(request): Json<CreateExamTypeRequest>,
) -> Result<(StatusCode, Json<ApiResponse<ExamTypeResponse>>), AppError> {
    // ... mevcut kod ...
}
```

Etkilenen handler'lar:
- `create_exam_type`, `update_exam_type`, `delete_exam_type`
- `create_subject`, `update_subject`, `delete_subject`
- `create_test_book`, `update_test_book`, `delete_test_book`
- `create_practice_test`, `update_practice_test`, `delete_practice_test`

---

### 7. Error Handling

**Dosya:** `crates/api/src/errors.rs`

`AppError` enum'ına `Forbidden` variant'ı eklenmeli (eğer yoksa):

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    // ... mevcut error'lar ...
    #[error("Forbidden: Insufficient permissions")]
    Forbidden,
}
```

---

## Test Senaryoları

### 1. Migration Testleri

- ✅ Roles tablosu oluşturuldu mu?
- ✅ Default roller (admin, user) eklendi mi?
- ✅ User_roles tablosu oluşturuldu mu?
- ✅ Mevcut kullanıcılara "user" rolü atandı mı?

### 2. Authentication Testleri

- ✅ Yeni kullanıcı kaydında "user" rolü otomatik atanıyor mu?
- ✅ Login'de JWT token'a gerçek roller ekleniyor mu?
- ✅ Refresh token'da roller güncelleniyor mu?

### 3. Authorization Testleri

- ✅ Admin endpoint'lerine user rolü ile erişim → 403 Forbidden
- ✅ Admin endpoint'lerine admin rolü ile erişim → 200 OK
- ✅ User endpoint'lerine her iki rol de erişebiliyor mu?

### 4. Role Management Testleri

- ✅ Rol atama çalışıyor mu?
- ✅ Rol kaldırma çalışıyor mu?
- ✅ Kullanıcı rollerini listeleme çalışıyor mu?

---

## İlk Admin Kullanıcı Oluşturma

İlk admin kullanıcısı oluşturmak için SQL script:

```sql
-- 1. Admin kullanıcısını oluştur (password hash'i gerçek hash ile değiştir)
INSERT INTO users (id, username, email, password_hash, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin',
    'admin@example.com',
    '$argon2id$v=19$m=65536,t=3,p=4$...', -- Gerçek hash
    true,
    NOW(),
    NOW()
);

-- 2. Admin rolünü ata
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, r.id, NOW()
FROM users u, roles r
WHERE u.email = 'admin@example.com' AND r.name = 'admin';
```

---

## Notlar ve Dikkat Edilmesi Gerekenler

1. **JWT Token Yenileme**: Mevcut token'lar yenilenene kadar eski token'lar geçerli kalacak. Bu normal bir davranıştır.

2. **Migration Sırası**: Migration'ları sırayla çalıştırmak önemlidir. Önce roles tablosu, sonra user_roles tablosu oluşturulmalı.

3. **Default Rol Atama**: Yeni kullanıcılar otomatik olarak "user" rolü alacak. Admin rolü manuel olarak atanmalı.

4. **System Roller**: `is_system = true` olan roller silinememeli (domain logic'te kontrol edilmeli).

5. **Soft Delete**: User silindiğinde user_roles kayıtları CASCADE ile silinecek (ON DELETE CASCADE).

---

## İleride Yapılabilecek İyileştirmeler

- Permission sistemi eklenebilir (şu an sadece rol yönetimi yeterli)
- Role assignment endpoint'leri eklenebilir (admin panel için)
- Role management API'leri eklenebilir
- Audit log için rol değişiklikleri loglanabilir
- Role-based caching (roller cache'lenebilir)

---

## Dosya Listesi

### Yeni Dosyalar

1. `migrations/00008_create_roles_table.sql`
2. `migrations/00009_create_user_roles_table.sql`
3. `crates/domain/src/entities/role.rs`
4. `crates/domain/src/repositories/role_repository.rs`
5. `crates/infrastructure/src/database/repositories/role_repository_impl.rs`
6. `crates/api/src/extractors/require_admin.rs` (veya middleware)

### Güncellenecek Dosyalar

1. `crates/domain/src/entities/mod.rs`
2. `crates/domain/src/repositories/mod.rs`
3. `crates/domain/src/repositories/user_repository.rs`
4. `crates/infrastructure/src/database/repositories/user_repository_impl.rs`
5. `crates/infrastructure/src/database/repositories/mod.rs`
6. `crates/application/src/services/auth_service.rs`
7. `crates/api/src/state/app_state.rs`
8. `crates/api/src/handlers/test_handler.rs`
9. `crates/api/src/errors.rs` (eğer Forbidden yoksa)

---

## Implementasyon Sırası

1. ✅ Database migration'ları oluştur ve test et
2. ✅ Domain layer: Role entity ve RoleRepository trait
3. ✅ Infrastructure layer: PgRoleRepository implementasyonu
4. ✅ UserRepository'ye rol metodları ekle ve implement et
5. ✅ AuthService'i güncelle
6. ✅ AppState'i güncelle
7. ✅ RequireAdmin extractor oluştur
8. ✅ Admin handler'ları koru
9. ✅ Test et ve doğrula

---

**Son Güncelleme:** 2025-01-XX

