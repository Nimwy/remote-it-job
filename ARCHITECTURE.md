# Architecture — Remote IT Job

## 1. Tổng quan

```text
Browser
   │
   ▼
React + TypeScript + Vite
   │
   │ REST / JSON
   │ HTTP-only session cookie
   ▼
FastAPI
   │
   ├── Authentication / Authorization
   ├── API routes
   ├── Business services
   └── SQLAlchemy
   │
   ▼
PostgreSQL
```

Backend và PostgreSQL chạy bằng Docker Compose.
Frontend chạy trực tiếp trong WSL2 bằng Node.js/npm.

## 2. Thành phần

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod

Trách nhiệm:
- render UI
- client-side routing
- form UX/validation
- gọi REST API
- hiển thị loading/error state

Frontend không chịu trách nhiệm quyết định quyền truy cập cuối cùng.

### Backend

FastAPI chịu trách nhiệm:
- authentication
- authorization
- validation
- job lifecycle
- moderation
- search/filter/pagination
- view counting
- database access

### Database

PostgreSQL lưu:
- users
- sessions
- contacts
- categories
- tags
- jobs
- job_tags

## 3. Backend layers

Khuyến nghị:

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   ├── api/
│   ├── schemas/
│   ├── models/
│   ├── services/
│   ├── repositories/
│   └── db/
├── tests/
├── migrations/
├── Dockerfile
└── requirements.txt
```

Ranh giới:
- `api/`: HTTP routes/dependencies.
- `schemas/`: Pydantic request/response models.
- `models/`: SQLAlchemy models.
- `services/`: business rules.
- `repositories/`: database operations khi cần tách riêng.
- `core/`: config, security, auth utilities.
- `db/`: engine/session/database setup.

Không bắt buộc mọi function phải qua repository nếu abstraction đó không mang lại giá trị.

## 4. Authentication

### Email/password

```text
Register
  ↓
validate input
  ↓
hash password with Argon2id
  ↓
create user(status=pending)
```

Login chỉ thành công về mặt authentication nhưng HR functionality phải bị giới hạn nếu user chưa active.

### Google OAuth

```text
Browser
  ↓
Google authorization
  ↓
OAuth callback
  ↓
validate Google identity
  ↓
find/create user
  ↓
create server-side session
```

Account Google mới vẫn có `pending` status và phải được Admin duyệt.

Google OAuth không tự động biến user thành active HR.

## 5. Session

Server-side session.

Browser nhận session cookie.
Session record nằm trong PostgreSQL.

Cookie production:
- HttpOnly
- Secure
- SameSite được cấu hình phù hợp

Không dùng JWT làm authentication chính của MVP.

Session tối thiểu cần:
- session id/token identifier
- user id
- created_at
- expires_at

Không bắt buộc `updated_at` khi session không dùng sliding expiration.

## 6. Authorization

Role:
- `hr`
- `admin`

Status:
- `pending`
- `active`
- `blocked`

Backend phải kiểm tra cả role và account status.

Ví dụ:
- pending HR không được đăng/submit job.
- blocked HR không được thao tác HR.
- HR chỉ sửa/xóa/đóng job của chính mình.
- Admin có quyền moderation.

## 7. Public job flow

Public chỉ lấy job đáp ứng:

```text
status = approved
AND
(expires_at IS NULL OR expires_at > current_time)
AND
owner account is not blocked
```

`expires_at` được kiểm tra ngay tại query.

Một background/periodic task có thể cập nhật `approved → expired` để đồng bộ database, nhưng public visibility không phụ thuộc hoàn toàn vào task đó.

## 8. Search

MVP dùng PostgreSQL.

Search/filter gồm:
- keyword
- category
- tags
- job type
- salary
- location
- timezone

Pagination:
- offset pagination
- mặc định 20 jobs/page

Không dùng Elasticsearch/OpenSearch trong MVP.

## 9. View counting

Mỗi session chỉ tăng view của một job tối đa một lần trong 24 giờ.

Backend xác định session từ server-side session cookie.

Không tin `user_id` hoặc counter do frontend gửi.

Có thể dùng bảng tracking riêng nếu cần chính xác/audit; implementation phải bảo đảm concurrent requests không làm tăng counter nhiều lần ngoài rule 24h.

## 10. Job moderation

Job mới:

```text
draft → pending → approved
```

Từ chối:

```text
pending → rejected
```

`rejection_reason` phải được lưu.

Job approved khi sửa substantive content:

```text
approved → pending
```

HR vẫn có thể đóng job của mình:

```text
approved → closed
```

Admin có thể:

```text
approved → hidden
```

## 11. HR blocking

Không hard-delete HR khi Admin khóa.

```text
users.status = blocked
```

Các job của HR bị blocked không được public.

Dữ liệu cũ được giữ để phục vụ moderation/audit cơ bản.

## 12. Docker

Docker Compose cung cấp:
- FastAPI backend
- PostgreSQL

Frontend không chạy trong Docker ở MVP.

## 13. Không dùng microservices

Toàn bộ backend là một FastAPI application.

Không tách:
- auth service
- job service
- admin service
- search service

thành các microservice riêng.
