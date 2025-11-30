# Product Requirements Document (PRD)

## Rust Clean Architecture REST API Boilerplate

**Version:** 1.2.0  
**Date:** November 29, 2025  
**Author:** Engineering Team  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Purpose

This document outlines the requirements for a production-ready, modular Rust REST API boilerplate that serves as a foundation for building scalable backend services. The boilerplate implements Clean Architecture principles with Domain-Driven Design (DDD) patterns.

### 1.2 Scope

The project delivers a fully functional REST API template with:
- User authentication (registration and login)
- JWT-based authorization with refresh tokens
- Role-Based Access Control (RBAC) with permissions
- Admin dashboard for user and role management
- Redis caching layer for performance optimization
- Rate limiting for API protection
- Audit logging for compliance and debugging
- Soft delete for data recovery
- Advanced health checks (liveness/readiness)
- Graceful shutdown for zero-downtime deployments
- PostgreSQL database integration
- OpenAPI documentation
- Docker containerization
- Structured logging and error handling

### 1.3 Target Audience

- Backend developers starting new Rust projects
- Teams requiring a standardized API architecture
- Projects needing rapid prototyping with production-grade foundations

---

## 2. Technical Specifications

### 2.1 Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Language** | Rust | Latest Stable | Core language |
| **Runtime** | Tokio | 1.48 | Async runtime (full features) |
| **Web Framework** | Axum | 0.8 | HTTP server and routing |
| **Database** | PostgreSQL | 15+ | Primary data store |
| **Cache** | Redis | 7+ | Caching & rate limiting |
| **Redis Client** | redis-rs | 0.27 | Redis async client |
| **ORM/Query** | SQLx | 0.8 | Database operations |
| **Middleware** | Tower | 0.5 | Service middleware |
| **Middleware HTTP** | Tower-HTTP | 0.6 | HTTP-specific middleware (compression) |
| **HTTP** | Hyper | 1.8 | HTTP implementation |
| **Serialization** | Serde | 1.0 | JSON serialization |
| **Serialization JSON** | Serde JSON | 1.0 | JSON format support |
| **Auth JWT** | jsonwebtoken | 10.2 | JWT token handling |
| **Auth Hashing** | Argon2 | 0.5 | Password hashing |
| **Validation** | Validator | 0.20 | Input validation |
| **Error Handling** | thiserror | 2.0 | Custom error types |
| **Error Handling** | anyhow | 1.0 | Error propagation |
| **Logging** | Tracing | 0.1 | Structured logging |
| **Logging Subscriber** | Tracing-subscriber | 0.3 | Log output formatting |
| **Config** | dotenvy | 0.15 | Environment configuration |
| **UUID** | uuid | 1.18 | Unique identifiers |
| **DateTime** | chrono | 0.4 | Date/time handling |
| **Lazy Init** | once_cell | 1.21 | Lazy static initialization |
| **Docs** | utoipa | 5.4 | OpenAPI generation |
| **Docs UI** | utoipa-swagger-ui | 9 | Swagger UI serving |

### 2.2 System Requirements

- **Rust:** 1.75+ (stable)
- **PostgreSQL:** 15.0+
- **Redis:** 7.0+
- **Docker:** 24.0+
- **Docker Compose:** 2.20+

---

## 3. Architecture Design

### 3.1 Clean Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   Handlers  │ │   Routers   │ │    DTOs     │               │
│  │  (Axum)     │ │             │ │ (Req/Res)   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
├─────────────────────────────────────────────────────────────────┤
│                     APPLICATION LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Use Cases / Services                        │   │
│  │         (Business Logic Orchestration)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                       DOMAIN LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  Entities   │ │ Repository  │ │   Domain    │               │
│  │             │ │   Traits    │ │   Errors    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
├─────────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  Database   │ │    Cache    │ │  External   │ │  Config   │ │
│  │   (SQLx)    │ │   (Redis)   │ │  Adapters   │ │           │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Layer Responsibilities

#### 3.2.1 Domain Layer (`domain/`)

**Purpose:** Contains the core business logic and rules. Framework-agnostic.

**Components:**
- **Entities:** Core business objects (e.g., `User`, `Role`, `Permission`, `AuditLog`, `RefreshToken`)
- **Repository Traits:** Interfaces defining data access contracts
- **Cache Traits:** Interfaces defining caching contracts
- **Domain Errors:** Business rule violations and domain-specific errors
- **Value Objects:** Immutable objects defined by attributes

**Rules:**
- ❌ No external framework dependencies (no Axum, no SQLx, no Redis)
- ❌ No I/O operations
- ✅ Pure Rust types only
- ✅ Defines behavior through traits

#### 3.2.2 Application Layer (`application/`)

**Purpose:** Orchestrates use cases and application-specific business rules.

**Components:**
- **Services/Use Cases:** Application workflows (e.g., `RegisterUser`, `AuthenticateUser`, `AssignRole`, `RefreshAccessToken`)
- **DTOs:** Data transfer objects for service boundaries
- **Application Errors:** Use case specific errors

**Rules:**
- ✅ Depends on Domain layer only
- ✅ Defines input/output contracts
- ❌ No direct database access
- ❌ No HTTP-specific logic

#### 3.2.3 Infrastructure Layer (`infrastructure/`)

**Purpose:** Implements external concerns and adapters.

**Components:**
- **Repository Implementations:** SQLx-based data access
- **Cache Implementations:** Redis-based caching
- **Rate Limiter:** Redis-based distributed rate limiting
- **External Services:** Third-party integrations
- **Configuration:** Environment and settings management
- **Security:** JWT, password hashing implementations

**Rules:**
- ✅ Implements Domain traits
- ✅ Contains framework-specific code
- ✅ Manages database and cache connections

#### 3.2.4 Presentation Layer (`api/`)

**Purpose:** HTTP interface and request handling.

**Components:**
- **Handlers:** Axum route handlers
- **Routers:** Route definitions and grouping
- **Request DTOs:** Incoming data validation
- **Response DTOs:** Outgoing data formatting
- **Middleware:** Authentication, authorization, rate limiting, logging, CORS

**Rules:**
- ✅ Validates and transforms HTTP requests
- ✅ Calls Application services
- ❌ No business logic
- ❌ No direct database access

### 3.3 Project Structure

```
rust-api-boilerplate/
├── Cargo.toml                    # Workspace root
├── Cargo.lock
├── .env.example                  # Environment template
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── docs/
│   └── PRD.md
├── migrations/                   # SQLx migrations
│   ├── 00001_create_users_table.sql
│   ├── 00002_create_roles_table.sql
│   ├── 00003_create_permissions_table.sql
│   ├── 00004_create_role_permissions_table.sql
│   ├── 00005_create_user_roles_table.sql
│   ├── 00006_create_refresh_tokens_table.sql
│   └── 00007_create_audit_logs_table.sql
└── crates/
    ├── domain/                   # Domain Layer
    │   ├── Cargo.toml
    │   └── src/
    │       ├── lib.rs
    │       ├── entities/
    │       │   ├── mod.rs
    │       │   ├── user.rs
    │       │   ├── role.rs
    │       │   ├── permission.rs
    │       │   ├── refresh_token.rs
    │       │   └── audit_log.rs
    │       ├── repositories/
    │       │   ├── mod.rs
    │       │   ├── user_repository.rs
    │       │   ├── role_repository.rs
    │       │   ├── permission_repository.rs
    │       │   ├── refresh_token_repository.rs
    │       │   └── audit_log_repository.rs
    │       ├── cache/
    │       │   ├── mod.rs
    │       │   └── cache_trait.rs
    │       └── errors/
    │           ├── mod.rs
    │           └── domain_error.rs
    │
    ├── application/              # Application Layer
    │   ├── Cargo.toml
    │   └── src/
    │       ├── lib.rs
    │       ├── services/
    │       │   ├── mod.rs
    │       │   ├── auth_service.rs
    │       │   ├── user_service.rs
    │       │   ├── role_service.rs
    │       │   ├── permission_service.rs
    │       │   └── audit_service.rs
    │       └── dto/
    │           ├── mod.rs
    │           ├── auth_dto.rs
    │           ├── user_dto.rs
    │           ├── role_dto.rs
    │           ├── permission_dto.rs
    │           └── audit_dto.rs
    │
    ├── infrastructure/           # Infrastructure Layer
    │   ├── Cargo.toml
    │   └── src/
    │       ├── lib.rs
    │       ├── database/
    │       │   ├── mod.rs
    │       │   ├── connection.rs
    │       │   └── repositories/
    │       │       ├── mod.rs
    │       │       ├── user_repository_impl.rs
    │       │       ├── role_repository_impl.rs
    │       │       ├── permission_repository_impl.rs
    │       │       ├── refresh_token_repository_impl.rs
    │       │       └── audit_log_repository_impl.rs
    │       ├── cache/
    │       │   ├── mod.rs
    │       │   ├── redis_connection.rs
    │       │   └── redis_cache_impl.rs
    │       ├── rate_limiter/
    │       │   ├── mod.rs
    │       │   └── redis_rate_limiter.rs
    │       ├── security/
    │       │   ├── mod.rs
    │       │   ├── jwt.rs
    │       │   └── password.rs
    │       └── config/
    │           ├── mod.rs
    │           └── settings.rs
    │
    └── api/                      # Presentation Layer
        ├── Cargo.toml
        └── src/
            ├── lib.rs
            ├── main.rs           # Application entry point
            ├── server.rs         # Server with graceful shutdown
            ├── routes/
            │   ├── mod.rs
            │   ├── auth_routes.rs
            │   ├── health_routes.rs
            │   └── admin/
            │       ├── mod.rs
            │       ├── user_routes.rs
            │       ├── role_routes.rs
            │       ├── permission_routes.rs
            │       └── audit_routes.rs
            ├── handlers/
            │   ├── mod.rs
            │   ├── auth_handler.rs
            │   ├── health_handler.rs
            │   └── admin/
            │       ├── mod.rs
            │       ├── user_handler.rs
            │       ├── role_handler.rs
            │       ├── permission_handler.rs
            │       └── audit_handler.rs
            ├── dto/
            │   ├── mod.rs
            │   ├── request/
            │   │   ├── mod.rs
            │   │   ├── auth_request.rs
            │   │   ├── user_request.rs
            │   │   ├── role_request.rs
            │   │   └── permission_request.rs
            │   └── response/
            │       ├── mod.rs
            │       ├── auth_response.rs
            │       ├── user_response.rs
            │       ├── role_response.rs
            │       ├── permission_response.rs
            │       ├── audit_response.rs
            │       └── health_response.rs
            ├── middleware/
            │   ├── mod.rs
            │   ├── auth_middleware.rs
            │   ├── rbac_middleware.rs
            │   ├── rate_limit_middleware.rs
            │   └── audit_middleware.rs
            ├── extractors/
            │   ├── mod.rs
            │   └── current_user.rs
            ├── errors/
            │   ├── mod.rs
            │   └── app_error.rs
            └── state/
                ├── mod.rs
                └── app_state.rs
```

### 3.4 Dependency Flow

```
┌──────────────────┐
│   Presentation   │
│      (API)       │
└────────┬─────────┘
         │ depends on
         ▼
┌──────────────────┐     ┌──────────────────┐
│   Application    │────▶│  Infrastructure  │
└────────┬─────────┘     └────────┬─────────┘
         │ depends on             │ implements
         ▼                        ▼
┌──────────────────────────────────────────┐
│                 Domain                    │
└──────────────────────────────────────────┘
```

---

## 4. Feature Requirements

### 4.1 User Management Module

#### 4.1.1 User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric)",
  "email": "string (valid email format)",
  "password": "string (min 8 chars, complexity requirements)"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "created_at": "ISO8601 datetime"
  },
  "message": "User registered successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Username or email already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Business Rules:**
- Username must be unique (case-insensitive)
- Email must be unique (case-insensitive)
- Password must be hashed using Argon2
- UUID v4 generated for user ID
- New users automatically assigned "user" role
- Audit log entry created

#### 4.1.2 User Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "JWT string",
    "refresh_token": "opaque token string",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_expires_in": 604800,
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "roles": ["user"]
    }
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account deactivated
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Business Rules:**
- Verify password using Argon2
- Generate short-lived access token (15 minutes)
- Generate long-lived refresh token (7 days)
- Store refresh token hash in database
- Cache user session data in Redis
- Audit log entry created

#### 4.1.3 Refresh Access Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "new JWT string",
    "refresh_token": "new opaque token string",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_expires_in": 604800
  },
  "message": "Token refreshed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing refresh token
- `401 Unauthorized`: Invalid or expired refresh token
- `401 Unauthorized`: Refresh token revoked
- `403 Forbidden`: Account deactivated

**Business Rules:**
- Validate refresh token exists in database
- Check refresh token not expired
- Check refresh token not revoked
- Implement token rotation (issue new refresh token, revoke old)
- Audit log entry created

#### 4.1.4 Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Request Body (optional):**
```json
{
  "refresh_token": "string (optional, revokes specific token)",
  "all_devices": false
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Business Rules:**
- Revoke specified refresh token OR all user's refresh tokens
- Clear user session from cache
- Audit log entry created

#### 4.1.5 Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "roles": [
      {
        "id": "uuid",
        "name": "admin",
        "permissions": ["users:read", "users:write"]
      }
    ],
    "created_at": "ISO8601 datetime",
    "updated_at": "ISO8601 datetime"
  }
}
```

---

### 4.2 Refresh Token Module

#### 4.2.1 Token Design

| Property | Value |
|----------|-------|
| Format | Opaque (random bytes, base64 encoded) |
| Length | 32 bytes (256 bits) |
| Storage | Hashed (SHA-256) in database |
| Expiration | 7 days (configurable) |
| Rotation | Yes (new token on each refresh) |

#### 4.2.2 Token States

| State | Description |
|-------|-------------|
| `active` | Valid and usable |
| `revoked` | Manually revoked (logout) |
| `rotated` | Replaced by new token |
| `expired` | Past expiration time |

#### 4.2.3 Security Measures

- **Token Rotation:** Each refresh issues new tokens, preventing replay
- **Family Tracking:** Detect token reuse (compromised refresh token scenario)
- **Device Binding:** Optional binding to user agent/IP
- **Revocation Cascade:** Revoking parent revokes all descendants

---

### 4.3 Role-Based Access Control (RBAC) Module

#### 4.3.1 Permission System Design

**Permission Naming Convention:** `resource:action`

**Default Permissions:**
| Permission | Description |
|------------|-------------|
| `users:read` | View user list and details |
| `users:write` | Create and update users |
| `users:delete` | Delete users |
| `roles:read` | View role list and details |
| `roles:write` | Create, update, assign roles |
| `roles:delete` | Delete roles |
| `permissions:read` | View permission list |
| `permissions:write` | Create and update permissions |
| `audit:read` | View audit logs |

#### 4.3.2 Default Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| `super_admin` | All permissions | Full system access |
| `admin` | `users:*`, `roles:read`, `audit:read` | User management |
| `user` | None | Basic authenticated access |

#### 4.3.3 RBAC Middleware Flow

```
Request → Rate Limit → Auth Middleware → RBAC Middleware → Audit → Handler
              │              │                   │            │
              │              │                   │            └─ Log action
              │              │                   │
              │              │                   ├─ Extract user from JWT
              │              │                   ├─ Check cache for permissions
              │              │                   ├─ Verify required permission
              │              │                   └─ Allow/Deny access
              │              │
              │              └─ Validate JWT token
              │
              └─ Check rate limits
```

---

### 4.4 Rate Limiting Module

#### 4.4.1 Rate Limit Strategy

| Endpoint Category | Limit | Window | Key |
|-------------------|-------|--------|-----|
| Auth (login/register) | 5 requests | 1 minute | IP address |
| Auth (refresh) | 10 requests | 1 minute | IP address |
| API (authenticated) | 100 requests | 1 minute | User ID |
| API (unauthenticated) | 30 requests | 1 minute | IP address |
| Admin endpoints | 60 requests | 1 minute | User ID |

#### 4.4.2 Rate Limit Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1732876800
Retry-After: 45
```

#### 4.4.3 Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 45,
      "limit": 100,
      "window": "1 minute"
    }
  }
}
```

#### 4.4.4 Implementation (Redis-based)

```rust
// Sliding window rate limiter using Redis
pub struct RateLimiter {
    redis: RedisPool,
    prefix: String,
}

impl RateLimiter {
    pub async fn check(&self, key: &str, limit: u32, window_secs: u64) -> Result<RateLimitInfo, Error>;
}
```

**Algorithm:** Sliding Window Counter (Redis sorted sets)
- Precise rate limiting
- Memory efficient
- Distributed-friendly

---

### 4.5 Audit Logging Module

#### 4.5.1 Audit Log Entry Structure

```json
{
  "id": "uuid",
  "timestamp": "ISO8601 datetime",
  "user_id": "uuid (nullable for anonymous)",
  "action": "user.login",
  "resource_type": "user",
  "resource_id": "uuid",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "request_id": "uuid",
  "status": "success",
  "details": {
    "changes": {
      "email": { "old": "old@example.com", "new": "new@example.com" }
    }
  },
  "duration_ms": 45
}
```

#### 4.5.2 Audited Actions

| Category | Actions |
|----------|---------|
| **Authentication** | `auth.register`, `auth.login`, `auth.logout`, `auth.refresh`, `auth.login_failed` |
| **User Management** | `user.create`, `user.update`, `user.delete`, `user.restore`, `user.deactivate` |
| **Role Management** | `role.create`, `role.update`, `role.delete`, `role.assign`, `role.unassign` |
| **Permission Management** | `permission.create`, `permission.assign`, `permission.unassign` |

#### 4.5.3 Audit Log API (Admin)

##### List Audit Logs
**Endpoint:** `GET /api/v1/admin/audit-logs`

**Required Permission:** `audit:read`

**Query Parameters:**
- `page` (default: 1)
- `per_page` (default: 50, max: 100)
- `user_id` (optional, filter by user)
- `action` (optional, filter by action)
- `resource_type` (optional, filter by resource)
- `status` (optional: success, failure)
- `from` (optional, ISO8601 datetime)
- `to` (optional, ISO8601 datetime)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "timestamp": "2025-11-29T10:30:00Z",
        "user_id": "uuid",
        "username": "admin",
        "action": "user.update",
        "resource_type": "user",
        "resource_id": "uuid",
        "ip_address": "192.168.1.1",
        "status": "success",
        "duration_ms": 45
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total_items": 1250,
      "total_pages": 25
    }
  }
}
```

#### 4.5.4 Audit Retention

- **Default retention:** 90 days
- **Configurable via environment**
- **Automatic cleanup job** (optional, can be run manually)

---

### 4.6 Soft Delete Module

#### 4.6.1 Soft Delete Design

All deletable entities include:
- `deleted_at: Option<DateTime<Utc>>` - Null means active, timestamp means deleted
- `deleted_by: Option<Uuid>` - Who performed the deletion

#### 4.6.2 Query Behavior

| Query Type | Behavior |
|------------|----------|
| Default queries | Exclude soft-deleted records (`WHERE deleted_at IS NULL`) |
| Admin list (with flag) | Include soft-deleted records |
| Get by ID | Return even if soft-deleted (with `is_deleted` flag) |

#### 4.6.3 Soft Delete API

##### Delete User (Soft)
**Endpoint:** `DELETE /api/v1/admin/users/{id}`

**Behavior:** Sets `deleted_at` timestamp, does not remove record

##### Restore User
**Endpoint:** `POST /api/v1/admin/users/{id}/restore`

**Required Permission:** `users:write`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "is_active": true,
    "restored_at": "ISO8601 datetime"
  },
  "message": "User restored successfully"
}
```

**Business Rules:**
- Only soft-deleted users can be restored
- Audit log entry created
- Cache invalidated

##### List Users (Include Deleted)
**Endpoint:** `GET /api/v1/admin/users?include_deleted=true`

**Additional Response Fields:**
```json
{
  "is_deleted": true,
  "deleted_at": "ISO8601 datetime",
  "deleted_by": "uuid"
}
```

#### 4.6.4 Hard Delete (Optional)

**Endpoint:** `DELETE /api/v1/admin/users/{id}/permanent`

**Required Permission:** `users:delete` + confirmation

**Business Rules:**
- Only super_admin can perform
- Requires confirmation parameter
- Irreversible action
- Audit log entry created

---

### 4.7 Health Check Module

#### 4.7.1 Health Check Endpoints

##### Liveness Probe
**Endpoint:** `GET /health/live`

**Purpose:** Is the application running?

**Success Response (200 OK):**
```json
{
  "status": "alive",
  "timestamp": "ISO8601 datetime"
}
```

**Failure Response (503 Service Unavailable):**
```json
{
  "status": "dead",
  "timestamp": "ISO8601 datetime"
}
```

##### Readiness Probe
**Endpoint:** `GET /health/ready`

**Purpose:** Is the application ready to receive traffic?

**Success Response (200 OK):**
```json
{
  "status": "ready",
  "timestamp": "ISO8601 datetime",
  "checks": {
    "database": {
      "status": "healthy",
      "latency_ms": 5
    },
    "redis": {
      "status": "healthy",
      "latency_ms": 2
    }
  }
}
```

**Degraded Response (200 OK with warning):**
```json
{
  "status": "degraded",
  "timestamp": "ISO8601 datetime",
  "checks": {
    "database": {
      "status": "healthy",
      "latency_ms": 5
    },
    "redis": {
      "status": "unhealthy",
      "error": "Connection refused",
      "latency_ms": null
    }
  }
}
```

**Failure Response (503 Service Unavailable):**
```json
{
  "status": "not_ready",
  "timestamp": "ISO8601 datetime",
  "checks": {
    "database": {
      "status": "unhealthy",
      "error": "Connection timeout"
    },
    "redis": {
      "status": "unhealthy",
      "error": "Connection refused"
    }
  }
}
```

##### Detailed Health (Admin)
**Endpoint:** `GET /health/details`

**Required:** Authentication (any valid token)

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "ISO8601 datetime",
  "version": "1.0.0",
  "uptime_seconds": 86400,
  "checks": {
    "database": {
      "status": "healthy",
      "latency_ms": 5,
      "connections": {
        "active": 5,
        "idle": 15,
        "max": 20
      }
    },
    "redis": {
      "status": "healthy",
      "latency_ms": 2,
      "memory_used_mb": 45,
      "connected_clients": 10
    }
  },
  "system": {
    "memory_used_mb": 128,
    "cpu_usage_percent": 15
  }
}
```

#### 4.7.2 Health Check Configuration

```env
# Health check timeouts
HEALTH_CHECK_TIMEOUT_MS=5000
HEALTH_DB_CHECK_QUERY=SELECT 1
HEALTH_REDIS_CHECK_COMMAND=PING
```

#### 4.7.3 Kubernetes Integration

```yaml
# Example Kubernetes deployment
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

---

### 4.8 Graceful Shutdown Module

#### 4.8.1 Shutdown Sequence

```
SIGTERM/SIGINT received
        │
        ▼
┌───────────────────────┐
│ 1. Stop accepting new │
│    connections        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 2. Set readiness to   │
│    "not_ready"        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 3. Wait for in-flight │
│    requests (timeout) │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 4. Close database     │
│    connections        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 5. Close Redis        │
│    connections        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 6. Flush logs         │
└───────────┬───────────┘
            │
            ▼
        Exit(0)
```

#### 4.8.2 Configuration

```env
# Graceful shutdown settings
SHUTDOWN_TIMEOUT_SECONDS=30
```

#### 4.8.3 Implementation

```rust
// Graceful shutdown handler
pub async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c().await.expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("Shutdown signal received, starting graceful shutdown...");
}
```

---

### 4.9 Admin Dashboard Module

#### 4.9.1 User Management (Admin)

##### List All Users
**Endpoint:** `GET /api/v1/admin/users`

**Required Permission:** `users:read`

**Query Parameters:**
- `page` (default: 1)
- `per_page` (default: 20, max: 100)
- `search` (optional, searches username/email)
- `role` (optional, filter by role name)
- `is_active` (optional, boolean)
- `include_deleted` (optional, boolean, default: false)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "roles": ["admin", "user"],
        "is_active": true,
        "is_deleted": false,
        "created_at": "ISO8601 datetime",
        "updated_at": "ISO8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 150,
      "total_pages": 8
    }
  }
}
```

##### Get User by ID
**Endpoint:** `GET /api/v1/admin/users/{id}`

**Required Permission:** `users:read`

##### Update User
**Endpoint:** `PUT /api/v1/admin/users/{id}`

**Required Permission:** `users:write`

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "is_active": "boolean (optional)"
}
```

##### Delete User (Soft)
**Endpoint:** `DELETE /api/v1/admin/users/{id}`

**Required Permission:** `users:delete`

**Business Rules:**
- Cannot delete own account
- Cannot delete super_admin users (unless you are super_admin)
- Soft delete by default
- Revokes all refresh tokens
- Audit log entry created

##### Restore User
**Endpoint:** `POST /api/v1/admin/users/{id}/restore`

**Required Permission:** `users:write`

##### Assign Roles to User
**Endpoint:** `POST /api/v1/admin/users/{id}/roles`

**Required Permission:** `roles:write`

##### Remove Role from User
**Endpoint:** `DELETE /api/v1/admin/users/{id}/roles/{role_id}`

**Required Permission:** `roles:write`

---

#### 4.9.2 Role Management (Admin)

##### List All Roles
**Endpoint:** `GET /api/v1/admin/roles`

##### Create Role
**Endpoint:** `POST /api/v1/admin/roles`

##### Update Role
**Endpoint:** `PUT /api/v1/admin/roles/{id}`

##### Delete Role
**Endpoint:** `DELETE /api/v1/admin/roles/{id}`

##### Assign Permissions to Role
**Endpoint:** `POST /api/v1/admin/roles/{id}/permissions`

##### Remove Permission from Role
**Endpoint:** `DELETE /api/v1/admin/roles/{id}/permissions/{permission_id}`

---

#### 4.9.3 Permission Management (Admin)

##### List All Permissions
**Endpoint:** `GET /api/v1/admin/permissions`

##### Create Permission
**Endpoint:** `POST /api/v1/admin/permissions`

---

### 4.10 Caching Module

#### 4.10.1 Cache Strategy

| Data Type | TTL | Cache Key Pattern | Invalidation Trigger |
|-----------|-----|-------------------|----------------------|
| User Session | 15 mins | `session:{user_id}` | Logout, password change |
| User Permissions | 15 mins | `permissions:{user_id}` | Role assignment change |
| User Profile | 5 mins | `user:{user_id}` | User update |
| Role List | 10 mins | `roles:all` | Role CRUD operations |
| Permission List | 30 mins | `permissions:all` | Permission CRUD operations |
| Rate Limit | Varies | `ratelimit:{type}:{key}` | Auto-expire |

#### 4.10.2 Cache Interface

```rust
#[async_trait]
pub trait CacheService: Send + Sync {
    async fn get<T: DeserializeOwned>(&self, key: &str) -> Result<Option<T>, CacheError>;
    async fn set<T: Serialize>(&self, key: &str, value: &T, ttl_seconds: u64) -> Result<(), CacheError>;
    async fn delete(&self, key: &str) -> Result<(), CacheError>;
    async fn delete_pattern(&self, pattern: &str) -> Result<(), CacheError>;
    async fn exists(&self, key: &str) -> Result<bool, CacheError>;
    async fn increment(&self, key: &str, ttl_seconds: u64) -> Result<i64, CacheError>;
}
```

---

### 4.11 Database Schema

#### 4.11.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_is_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
```

#### 4.11.2 Roles Table

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

-- Insert default roles
INSERT INTO roles (name, description, is_system) VALUES
    ('super_admin', 'Super Administrator with full system access', true),
    ('admin', 'Administrator with user management access', true),
    ('user', 'Regular authenticated user', true);
```

#### 4.11.3 Permissions Table

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permissions_name ON permissions(name);

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
    ('users:read', 'View user list and details'),
    ('users:write', 'Create and update users'),
    ('users:delete', 'Delete users'),
    ('roles:read', 'View role list and details'),
    ('roles:write', 'Create, update, and assign roles'),
    ('roles:delete', 'Delete roles'),
    ('permissions:read', 'View permission list'),
    ('permissions:write', 'Create and update permissions'),
    ('audit:read', 'View audit logs');
```

#### 4.11.4 Role Permissions (Junction Table)

```sql
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- Assign all permissions to super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin';

-- Assign user management permissions to admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name IN ('users:read', 'users:write', 'users:delete', 'roles:read', 'audit:read');
```

#### 4.11.5 User Roles (Junction Table)

```sql
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

#### 4.11.6 Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_reason VARCHAR(50),
    replaced_by UUID REFERENCES refresh_tokens(id),
    user_agent TEXT,
    ip_address INET
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;
```

#### 4.11.7 Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    details JSONB,
    duration_ms INTEGER
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Partitioning by month (optional, for high-volume)
-- CREATE TABLE audit_logs_y2025m11 PARTITION OF audit_logs
--     FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

#### 4.11.8 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────┐       ┌─────────────┐
│     users       │       │ user_roles  │       │    roles    │
├─────────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)         │◄──────┤ user_id(FK) │       │ id (PK)     │
│ username        │       │ role_id(FK) │──────▶│ name        │
│ email           │       │ assigned_at │       │ description │
│ password_hash   │       │ assigned_by │       │ is_system   │
│ is_active       │       └─────────────┘       │ created_at  │
│ created_at      │                             │ updated_at  │
│ updated_at      │                             └──────┬──────┘
│ deleted_at      │                                    │
│ deleted_by      │                                    │
└────────┬────────┘       ┌─────────────────┐          │
         │                │ role_permissions│          │
         │                ├─────────────────┤          │
         │                │ role_id (FK)    │◄─────────┘
         │                │ permission_id   │───────────┐
         │                │ created_at      │           │
         │                └─────────────────┘           │
         │                                             ▼
         │                                    ┌─────────────┐
         │                                    │ permissions │
         │                                    ├─────────────┤
         │                                    │ id (PK)     │
         │                                    │ name        │
         │                                    │ description │
         │                                    │ created_at  │
         │                                    │ updated_at  │
         │                                    └─────────────┘
         │
         │         ┌──────────────────┐
         │         │  refresh_tokens  │
         │         ├──────────────────┤
         └────────▶│ id (PK)          │
                   │ user_id (FK)     │
                   │ token_hash       │
                   │ expires_at       │
                   │ revoked_at       │
                   │ replaced_by      │
                   └──────────────────┘

         ┌──────────────────┐
         │   audit_logs     │
         ├──────────────────┤
         │ id (PK)          │
         │ user_id (FK)     │◄─────────── (from users)
         │ timestamp        │
         │ action           │
         │ resource_type    │
         │ resource_id      │
         │ status           │
         │ details (JSONB)  │
         └──────────────────┘
```

---

## 5. API Design Standards

### 5.1 Response Format

All API responses follow a consistent structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description"
}
```

**Paginated Success Response:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 150,
      "total_pages": 8
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [ ... ]
  }
}
```

### 5.2 Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Input validation failed |
| 401 | `UNAUTHORIZED` | Authentication required |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password |
| 401 | `INVALID_TOKEN` | JWT validation failed |
| 401 | `TOKEN_EXPIRED` | JWT token has expired |
| 401 | `REFRESH_TOKEN_EXPIRED` | Refresh token has expired |
| 401 | `REFRESH_TOKEN_REVOKED` | Refresh token was revoked |
| 403 | `FORBIDDEN` | Access denied |
| 403 | `ACCOUNT_DEACTIVATED` | User account is deactivated |
| 403 | `INSUFFICIENT_PERMISSIONS` | Missing required permission |
| 404 | `NOT_FOUND` | Resource not found |
| 404 | `USER_NOT_FOUND` | User does not exist |
| 404 | `ROLE_NOT_FOUND` | Role does not exist |
| 409 | `CONFLICT` | Resource already exists |
| 409 | `DUPLICATE_EMAIL` | Email already registered |
| 409 | `DUPLICATE_USERNAME` | Username already taken |
| 422 | `CANNOT_DELETE_SYSTEM_ROLE` | System roles cannot be deleted |
| 422 | `CANNOT_DELETE_SELF` | Cannot delete own account |
| 422 | `USER_ALREADY_DELETED` | User is already soft-deleted |
| 422 | `USER_NOT_DELETED` | User is not deleted (cannot restore) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| 503 | `DATABASE_ERROR` | Database connection error |
| 503 | `CACHE_ERROR` | Cache service unavailable |

### 5.3 API Versioning

- Base path: `/api/v1/`
- Version in URL path
- Future versions: `/api/v2/`, etc.

### 5.4 Authentication Header

```
Authorization: Bearer <JWT_TOKEN>
```

### 5.5 Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1732876800
```

---

## 6. Security Requirements

### 6.1 Password Security

- **Algorithm:** Argon2id
- **Memory Cost:** 19456 KB (19 MiB)
- **Time Cost:** 2 iterations
- **Parallelism:** 1
- **Salt:** 16 bytes (auto-generated)
- **Hash Length:** 32 bytes

### 6.2 JWT Configuration (Access Token)

- **Algorithm:** HS256 (configurable to RS256)
- **Expiration:** 15 minutes (configurable)
- **Issuer:** Application name (configurable)
- **Claims:**
  - `sub`: User ID (UUID)
  - `roles`: Array of role names
  - `permissions`: Array of permission names
  - `exp`: Expiration timestamp
  - `iat`: Issued at timestamp
  - `jti`: Unique token ID

### 6.3 Refresh Token Configuration

- **Format:** 32 random bytes, base64 encoded
- **Storage:** SHA-256 hash in database
- **Expiration:** 7 days (configurable)
- **Rotation:** Enabled (new token on each refresh)

### 6.4 CORS Configuration

- **Allowed Origins:** Configurable via environment
- **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers:** Content-Type, Authorization
- **Max Age:** 3600 seconds

### 6.5 Authorization Rules

- All admin endpoints require authentication
- Permission checks are enforced via middleware
- Super admin bypasses all permission checks
- System roles cannot be modified or deleted
- Users cannot delete their own account
- Soft-deleted users cannot authenticate

---

## 7. Configuration Management

### 7.1 Environment Variables

```env
# Application
APP_NAME=rust-api-boilerplate
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8080
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgres://user:password@localhost:5432/dbname
DATABASE_MAX_CONNECTIONS=10

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_POOL_SIZE=10
CACHE_DEFAULT_TTL_SECONDS=300

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ACCESS_TOKEN_EXPIRATION_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRATION_DAYS=7

# Rate Limiting
RATE_LIMIT_AUTH_REQUESTS=5
RATE_LIMIT_AUTH_WINDOW_SECONDS=60
RATE_LIMIT_API_REQUESTS=100
RATE_LIMIT_API_WINDOW_SECONDS=60

# Audit
AUDIT_LOG_RETENTION_DAYS=90

# Health Check
HEALTH_CHECK_TIMEOUT_MS=5000

# Graceful Shutdown
SHUTDOWN_TIMEOUT_SECONDS=30

# Logging
RUST_LOG=info,tower_http=debug,sqlx=warn

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 7.2 Configuration Hierarchy

1. Environment variables (highest priority)
2. `.env` file
3. Default values in code

---

## 8. Logging & Observability

### 8.1 Log Format

Structured JSON logging in production:

```json
{
  "timestamp": "2025-11-29T10:30:00Z",
  "level": "INFO",
  "target": "api::handlers::auth",
  "message": "User logged in",
  "span": {
    "request_id": "uuid",
    "method": "POST",
    "path": "/api/v1/auth/login"
  },
  "fields": {
    "user_id": "uuid",
    "email": "user@example.com"
  }
}
```

### 8.2 Request Tracing

Every HTTP request includes:
- Unique request ID
- Method and path
- Response status code
- Response time (ms)
- Client IP (if available)
- User ID (if authenticated)
- Rate limit info

### 8.3 Metrics (Logged)

- Cache hits/misses
- Cache latency
- Database query latency
- Rate limit hits
- Authentication success/failure counts

---

## 9. Documentation

### 9.1 OpenAPI Specification

- **Version:** OpenAPI 3.0.3
- **Endpoint:** `/swagger-ui`
- **Format:** Interactive Swagger UI

### 9.2 Documentation Contents

- All API endpoints
- Request/Response schemas
- Authentication requirements
- Permission requirements for each endpoint
- Rate limit information
- Error codes and messages
- Example requests

---

## 10. Docker Configuration

### 10.1 Development Environment

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app_db
      - REDIS_URL=redis://redis:6379
      - RUST_LOG=debug
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health/live"]
      interval: 10s
      timeout: 5s
      retries: 3
    stop_grace_period: 30s

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

### 10.2 Production Dockerfile

Multi-stage build for minimal image size:
1. Builder stage: Compile with release optimizations
2. Runtime stage: Minimal base image with binary only

---

## 11. Non-Functional Requirements

### 11.1 Performance

- API response time: < 100ms (P95) for simple operations
- API response time: < 50ms (P95) for cached operations
- Database query time: < 50ms (P95)
- Cache operation time: < 5ms (P95)
- Rate limit check: < 2ms (P95)
- Startup time: < 5 seconds
- Shutdown time: < 30 seconds

### 11.2 Scalability

- Stateless design enables horizontal scaling
- Connection pooling for database efficiency
- Redis for distributed caching and rate limiting
- Async I/O throughout

### 11.3 Maintainability

- Clean Architecture separation
- Consistent code style (rustfmt)
- Self-documenting code with doc comments

### 11.4 Availability

- Cache degradation: System continues without cache (slower, no rate limiting)
- Health check endpoints for load balancers
- Graceful shutdown for zero-downtime deployments

### 11.5 Security

- Rate limiting prevents abuse
- Audit logging for compliance
- Soft delete for data recovery
- Refresh token rotation prevents replay attacks

---

## 12. Out of Scope

The following are explicitly **NOT** included:

- ❌ Unit tests
- ❌ Integration tests
- ❌ CI/CD pipelines
- ❌ Email verification
- ❌ Password reset functionality
- ❌ Multi-tenancy
- ❌ WebSocket support
- ❌ File upload handling
- ❌ Background job processing

---

## 13. Success Criteria

### 13.1 Functional

- [ ] User can register with valid credentials
- [ ] User cannot register with duplicate email/username
- [ ] User can login with correct credentials
- [ ] User receives access token and refresh token on login
- [ ] User can refresh access token using refresh token
- [ ] User can logout (single device or all devices)
- [ ] Refresh tokens are rotated on each use
- [ ] Protected routes reject requests without valid JWT
- [ ] Rate limiting blocks excessive requests
- [ ] Rate limit headers are returned in responses
- [ ] Admin can list, view, update, and delete users
- [ ] Admin can restore soft-deleted users
- [ ] Admin can create, update, and delete custom roles
- [ ] Admin can assign and remove roles from users
- [ ] Admin can view audit logs with filters
- [ ] Permission-based access control works correctly
- [ ] Cache improves response times for repeated requests
- [ ] Health endpoints return correct status
- [ ] Swagger UI displays all endpoints with permission requirements

### 13.2 Technical

- [ ] Application compiles without warnings
- [ ] Application starts successfully
- [ ] Application shuts down gracefully
- [ ] Database migrations execute successfully
- [ ] Redis connection established successfully
- [ ] Docker containers build and run
- [ ] All endpoints return proper error responses
- [ ] Cache invalidation works correctly
- [ ] Audit logs are created for all tracked actions
- [ ] Soft delete excludes records from normal queries

---

## 14. Appendix

### A. API Endpoint Summary

| Method | Endpoint | Description | Auth | Permission | Rate Limit |
|--------|----------|-------------|------|------------|------------|
| POST | `/api/v1/auth/register` | Register new user | No | - | 5/min |
| POST | `/api/v1/auth/login` | Authenticate user | No | - | 5/min |
| POST | `/api/v1/auth/refresh` | Refresh access token | No | - | 10/min |
| POST | `/api/v1/auth/logout` | Logout user | Yes | - | 100/min |
| GET | `/api/v1/auth/me` | Get current user | Yes | - | 100/min |
| GET | `/api/v1/admin/users` | List all users | Yes | `users:read` | 60/min |
| GET | `/api/v1/admin/users/{id}` | Get user by ID | Yes | `users:read` | 60/min |
| PUT | `/api/v1/admin/users/{id}` | Update user | Yes | `users:write` | 60/min |
| DELETE | `/api/v1/admin/users/{id}` | Delete user (soft) | Yes | `users:delete` | 60/min |
| DELETE | `/api/v1/admin/users/{id}/permanent` | Delete user (hard) | Yes | `users:delete` | 60/min |
| POST | `/api/v1/admin/users/{id}/restore` | Restore user | Yes | `users:write` | 60/min |
| POST | `/api/v1/admin/users/{id}/roles` | Assign roles | Yes | `roles:write` | 60/min |
| DELETE | `/api/v1/admin/users/{id}/roles/{role_id}` | Remove role | Yes | `roles:write` | 60/min |
| GET | `/api/v1/admin/roles` | List all roles | Yes | `roles:read` | 60/min |
| POST | `/api/v1/admin/roles` | Create role | Yes | `roles:write` | 60/min |
| PUT | `/api/v1/admin/roles/{id}` | Update role | Yes | `roles:write` | 60/min |
| DELETE | `/api/v1/admin/roles/{id}` | Delete role | Yes | `roles:delete` | 60/min |
| POST | `/api/v1/admin/roles/{id}/permissions` | Assign permissions | Yes | `roles:write` | 60/min |
| DELETE | `/api/v1/admin/roles/{id}/permissions/{id}` | Remove permission | Yes | `roles:write` | 60/min |
| GET | `/api/v1/admin/permissions` | List permissions | Yes | `permissions:read` | 60/min |
| POST | `/api/v1/admin/permissions` | Create permission | Yes | `permissions:write` | 60/min |
| GET | `/api/v1/admin/audit-logs` | List audit logs | Yes | `audit:read` | 60/min |
| GET | `/health/live` | Liveness probe | No | - | None |
| GET | `/health/ready` | Readiness probe | No | - | None |
| GET | `/health/details` | Detailed health | Yes | - | 60/min |
| GET | `/swagger-ui` | API documentation | No | - | None |

### B. Error Code Reference

| Domain | Code Range | Example |
|--------|------------|---------|
| Validation | 1000-1999 | Invalid email format |
| Authentication | 2000-2999 | Invalid credentials, token expired |
| Authorization | 3000-3999 | Insufficient permissions |
| User Management | 4000-4999 | User not found |
| Role Management | 5000-5999 | Role not found |
| Database | 6000-6999 | Duplicate entry |
| Cache | 7000-7999 | Cache unavailable |
| Rate Limiting | 8000-8999 | Rate limit exceeded |
| System | 9000-9999 | Internal error |

### C. Cache Key Reference

| Key Pattern | Description | TTL |
|-------------|-------------|-----|
| `session:{user_id}` | User session data | 15 mins |
| `permissions:{user_id}` | User's compiled permissions | 15 mins |
| `user:{user_id}` | User profile data | 5 mins |
| `roles:all` | All roles list | 10 mins |
| `permissions:all` | All permissions list | 30 mins |
| `ratelimit:auth:{ip}` | Auth rate limit counter | 1 min |
| `ratelimit:api:{user_id}` | API rate limit counter | 1 min |

### D. Audit Action Reference

| Action | Description | Resource Type |
|--------|-------------|---------------|
| `auth.register` | User registration | user |
| `auth.login` | Successful login | user |
| `auth.login_failed` | Failed login attempt | user |
| `auth.logout` | User logout | user |
| `auth.refresh` | Token refresh | user |
| `user.update` | User profile updated | user |
| `user.delete` | User soft deleted | user |
| `user.restore` | User restored | user |
| `user.deactivate` | User deactivated | user |
| `role.create` | Role created | role |
| `role.update` | Role updated | role |
| `role.delete` | Role deleted | role |
| `role.assign` | Role assigned to user | user_role |
| `role.unassign` | Role removed from user | user_role |
| `permission.create` | Permission created | permission |
| `permission.assign` | Permission assigned to role | role_permission |
| `permission.unassign` | Permission removed from role | role_permission |

### E. Glossary

| Term | Definition |
|------|------------|
| **Clean Architecture** | Software design philosophy separating concerns into layers |
| **DDD** | Domain-Driven Design - approach focusing on core domain logic |
| **JWT** | JSON Web Token - compact token format for authentication |
| **DTO** | Data Transfer Object - object carrying data between processes |
| **Repository Pattern** | Abstraction layer between domain and data mapping |
| **RBAC** | Role-Based Access Control - permissions assigned via roles |
| **Cache-Aside** | Caching pattern where app manages cache population |
| **TTL** | Time To Live - duration before cached data expires |
| **Rate Limiting** | Controlling request frequency to prevent abuse |
| **Soft Delete** | Marking records as deleted without removing data |
| **Audit Log** | Record of system actions for compliance/debugging |
| **Graceful Shutdown** | Controlled shutdown allowing in-flight requests to complete |
| **Liveness Probe** | Health check verifying application is running |
| **Readiness Probe** | Health check verifying application can serve traffic |
| **Token Rotation** | Security practice of issuing new tokens on each use |

---

**Document Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-29 | Engineering Team | Initial document |
| 1.1.0 | 2025-11-29 | Engineering Team | Added caching layer, admin dashboard, user roles/permissions |
| 1.2.0 | 2025-11-29 | Engineering Team | Added rate limiting, refresh tokens, soft delete, audit logging, health checks, graceful shutdown |
