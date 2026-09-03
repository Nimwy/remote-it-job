# API Reference — Remote IT Job

Tài liệu kỹ thuật chi tiết cho REST API. Base URL: `/api`.

- Định dạng: JSON (UTF-8)
- Xác thực: access token (JWT) + refresh token qua HTTP-only cookie (`access_token`, `refresh_token`)
- Backend docs tự sinh: `GET /docs` (Swagger UI) và `GET /openapi.json`
- **Nguồn sự thật khi nghi ngờ:** `GET /openapi.json` (FastAPI tự sinh theo code) — tài liệu này nên được đối chiếu với nó để không lệch.

## 1. Quy ước chung

### 1.1 Response lỗi

Mọi lỗi (APIError, validation, 404...) trả về cùng dạng `{ "error": { "code", "message" } }`:

```json
{
  "error": {
    "code": "email_exists",
    "message": "Email đã được đăng ký"
  }
}
```

- `code`: mã lỗi ổn định (dùng trong frontend để hiển thị bản dịch).
- `message`: mô tả (nội bộ/fallback khi không có bản dịch).
- Lỗi chưa xử lý thêm `request_id` để truy vết log.

| HTTP status | Ý nghĩa | Ví dụ `code` |
|---|---|---|
| 200 | Thành công | — |
| 201 | Tạo mới thành công | — |
| 204 | Thành công, không có body | — |
| 422 | Dữ liệu không hợp lệ / validation | `validation_error` |
| 400 | Dữ liệu không hợp lệ | `invalid_input` |
| 401 | Chưa đăng nhập / phiên hết hạn | `not_authenticated` |
| 403 | Không có quyền | `forbidden` / `require_admin` |
| 404 | Không tìm thấy | `not_found` |
| 409 | Xung đột (email/slug đã tồn tại) | `email_exists`, `slug_exists` |
| 429 | Vượt giới hạn rate limit | `rate_limit_exceeded` |
| 501 | Tính năng chưa cấu hình (Google OAuth) | `oauth_not_configured` |

### 1.2 Phân trang

Query chung: `?page=1&page_size=20`

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 24,
  "total_pages": 2
}
```

- `page` mặc định `1` (min 1)
- `page_size` mặc định `20` (min 1, max 100)

### 1.3 Data models

#### UserResponse
```json
{
  "id": 1,
  "role": "hr",
  "name": "HR Test",
  "email": "hr@example.com",
  "company_name": "Corp",
  "avatar": null,
  "status": "pending",
  "created_at": "2026-08-22T10:00:00Z"
}
```

#### JobListItem
```json
{
  "id": 1,
  "title": "React Developer",
  "slug": "react-developer",
  "company_name": "Công ty ABC",
  "category": { "id": 2, "name": "Frontend", "slug": "frontend" },
  "job_type": "fulltime",
  "location": "Việt Nam",
  "timezone": "UTC+7",
  "salary_min": 1800.0,
  "salary_max": 3000.0,
  "currency": "USD",
  "tags": ["React", "TypeScript"],
  "tag_slugs": ["react", "typescript"],
  "created_at": "2026-08-22T10:00:00Z"
}
```

#### JobDetailResponse (JobListItem + ...)
```json
{
  "...JobListItem...": "...",
  "description": "Mô tả công việc",
  "requirements": "Yêu cầu kỹ năng",
  "views": 17,
  "expires_at": "2026-09-21T00:00:00Z",
  "contacts": [
    { "channel": "email", "value": "hr@abc.vn" },
    { "channel": "telegram", "value": "@abc_hr" }
  ]
}
```

#### HrJobResponse
```json
{
  "id": 1,
  "title": "React Developer",
  "slug": "react-developer",
  "category": { "id": 2, "name": "Frontend", "slug": "frontend" },
  "job_type": "fulltime",
  "location": "Việt Nam",
  "timezone": "UTC+7",
  "salary_min": 1800.0,
  "salary_max": 3000.0,
  "currency": "USD",
  "description": "...",
  "requirements": "...",
  "status": "draft",
  "rejection_reason": null,
  "views": 0,
  "expires_at": null,
  "tags": ["React"],
  "created_at": "2026-08-22T10:00:00Z",
  "updated_at": "2026-08-22T10:00:00Z"
}
```

#### HrProfileResponse
```json
{
  "id": 1,
  "name": "HR Test",
  "email": "hr@example.com",
  "company_name": "Corp",
  "avatar": null,
  "status": "active",
  "contacts": [
    { "channel": "email", "value": "hr@example.com" }
  ]
}
```

### 1.4 Enums

| Field | Giá trị |
|---|---|
| `role` | `hr`, `admin` |
| `status` (user) | `pending`, `active`, `blocked` |
| `status` (job) | `draft`, `pending`, `approved`, `rejected`, `closed`, `hidden`, `expired` |
| `job_type` | `fulltime`, `parttime`, `freelance`, `contract` |
| `channel` (contact) | `zalo`, `telegram`, `linkedin`, `phone`, `email` |
| `currency` | `VND`, `USD`, `EUR`, `SGD`, `JPY`, `GBP` |

### 1.5 Ràng buộc và kiểu dữ liệu

Các ràng buộc lấy từ `app/schemas/` và `app/core/config.py` (nguồn sự thật: `GET /openapi.json`).

| Field | Ràng buộc |
|---|---|
| `title` (job) | bắt buộc, 1–200 ký tự |
| `description`, `requirements` | bắt buộc, tối thiểu 1 ký tự |
| `salary_min` ≤ `salary_max` | nếu có salary thì min ≤ max (kiểm tra ở service) |
| `currency` | tối đa 10 ký tự |
| `name` (category) | bắt buộc, 1–100 ký tự |
| `slug` (category/tag) | tùy chọn, tự sinh; max 120 / 60 ký tự |
| `name` (tag) | bắt buộc, 1–50 ký tự |
| `company_name` | bắt buộc khi tạo HR |
| `password` | độ dài tối thiểu theo service validation |
| `page` | ≥ 1 (mặc định 1) |
| `page_size` | 1–100 (mặc định 20, cấu hình `page_size_max=100`) |
| `channel` (contact) | `zalo` \| `telegram` \| `linkedin` \| `phone` \| `email`; `value` 1–255 ký tự |
| `tag_ids` (create job) | mảng số nguyên id tag, mặc định `[]` |

> Để đảm bảo tài liệu không lệch code, có thể đối chiếu tự động với `GET /openapi.json` (FastAPI tự sinh theo schema).

---

## 2. Authentication

### POST /api/auth/register

Tạo tài khoản HR (trạng thái `pending`).

**Body (tất cả đều bắt buộc):**

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `name` | string | ✔ | Họ tên |
| `email` | string | ✔ | Email hợp lệ (định dạng email) |
| `password` | string | ✔ | Mật khẩu |
| `company_name` | string | ✔ | Tên công ty |

```json
{
  "name": "HR Test",
  "email": "hr@example.com",
  "password": "secret123",
  "company_name": "Test Corp"
}
```

**Response 201:** `UserResponse` (role=hr, status=`pending`)

**Lỗi mẫu:**
```json
{ "error": { "code": "email_exists", "message": "Email đã được đăng ký" } }
```

### POST /api/auth/login

Đăng nhập email/password, tạo access (JWT) + refresh token, đặt cả hai cookie.

**Body:**
```json
{
  "email": "hr@example.com",
  "password": "secret123"
}
```

**Response 200:** `UserResponse` + set cookie `access_token` (15 phút) + `refresh_token` (7 ngày, HttpOnly)

**Lỗi:** `401` sai email/password.

### POST /api/auth/refresh

Đọc refresh token từ cookie, cấp access token mới và xoay refresh token.

**Response 200:** `{"detail": "Đã làm mới phiên"}` + set cookie `access_token` + `refresh_token` mới.

**Lỗi:** `401` phiên không hợp lệ / hết hạn (`auth.invalid_session` / `auth.session_expired`).

### GET /api/auth/google/login

Bắt đầu Google OAuth flow (redirect sang Google, `302`; trả `501` nếu chưa cấu hình).

### GET /api/auth/google/callback

Xử lý Google OAuth callback, tạo/link account, set access + refresh cookie, redirect về frontend.

### POST /api/auth/logout

Thu hồi refresh token và xóa cả hai cookie.

**Response 200:**
```json
{ "detail": "Đã đăng xuất" }
```

### GET /api/auth/me

**Auth:** bất kỳ user đã đăng nhập.

**Response 200:** `UserResponse`

**Lỗi:** `401` chưa đăng nhập.

### POST /api/auth/change-password

**Auth:** user đã đăng nhập có password.

**Body:**
```json
{
  "current_password": "oldpass",
  "new_password": "newpass123"
}
```

**Response 200:** `{ "detail": "Đổi mật khẩu thành công" }`

---

## 3. Public (không cần đăng nhập)

### GET /api/jobs

Danh sách job công khai (approved, chưa hết hạn, HR không bị khóa).

**Query params (tất cả đều tùy chọn):**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `q` | string | ✕ | Tìm kiếm trong title/description |
| `category` | string | ✕ | Slug category |
| `tags` | string | ✕ | Danh sách slug tag, phân tách bằng `,` |
| `job_type` | string | ✕ | fulltime/parttime/freelance/contract |
| `salary_min` | number | ✕ | Lương tối thiểu |
| `salary_max` | number | ✕ | Lương tối đa |
| `location` | string | ✕ | Địa điểm (khớp một phần) |
| `timezone` | string | ✕ | Múi giờ |
| `page` | number | ✕ | Trang (≥ 1, mặc định 1) |
| `page_size` | number | ✕ | Số item/trang (1–100, mặc định 20) |

> Không có tham số `sort` hay `currency` — thứ tự mặc định cố định (mới nhất + tie-breaker theo id) và `currency` chỉ là một field trong response.

**Response 200:** `PaginatedResponse<JobListItem>` (hình dạng phẳng, xem mục 1.2).

### GET /api/jobs/{job_id}

Chi tiết job công khai + thông tin liên hệ HR. Tăng view count (1 lần/session/24h).

**Response 200:** `JobDetailResponse`

**Lỗi:** `404` job không tồn tại hoặc không công khai.

### GET /api/categories

Danh sách category đang active.

**Response 200:**
```json
[
  { "id": 1, "name": "Backend", "slug": "backend", "sort_order": 1 }
]
```

### GET /api/tags

Danh sách tag đang active.

**Response 200:**
```json
[
  { "id": 1, "name": "React", "slug": "react" }
]
```

---

## 4. HR (role=hr, status=active)

### GET /api/hr/profile

**Response 200:** `HrProfileResponse`

### PATCH /api/hr/profile

**Body (các field đều optional):**
```json
{
  "name": "New Name",
  "company_name": "New Corp",
  "avatar": "https://...",
  "contacts": [
    { "channel": "email", "value": "hr@example.com" },
    { "channel": "telegram", "value": "@hr" }
  ]
}
```

> Khi truyền `contacts`, toàn bộ contact cũ bị thay thế.

**Response 200:** `HrProfileResponse`

### GET /api/hr/jobs

Danh sách job của HR hiện tại.

**Query:** `?status=approved&page=1&page_size=20`

**Response 200:** `PaginatedResponse<HrJobResponse>`

### POST /api/hr/jobs

Tạo draft job. `slug` tự sinh, có thể thêm hậu tố số nếu trùng.

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `title` | string | ✔ | 1–200 ký tự |
| `category_id` | int | ✔ | Id category đang active |
| `job_type` | string | ✔ | `fulltime` \| `parttime` \| `freelance` \| `contract` |
| `description` | string | ✔ | ≥ 1 ký tự |
| `requirements` | string | ✔ | ≥ 1 ký tự |
| `location` | string | ✕ | Địa điểm |
| `timezone` | string | ✕ | Múi giờ |
| `salary_min` | number | ✕ | ≤ `salary_max` |
| `salary_max` | number | ✕ | ≥ `salary_min` |
| `currency` | string | ✕ | ≤ 10 ký tự |
| `expires_at` | datetime | ✕ | Thời hạn tin |
| `tag_ids` | int[] | ✕ | Mảng id tag, mặc định `[]` |

```json
{
  "title": "React Developer",
  "category_id": 2,
  "job_type": "fulltime",
  "location": "Việt Nam",
  "timezone": "UTC+7",
  "salary_min": 1800,
  "salary_max": 3000,
  "currency": "USD",
  "description": "...",
  "requirements": "...",
  "expires_at": "2026-09-21T00:00:00Z",
  "tag_ids": [1, 2]
}
```

**Response 201:** `HrJobResponse` (status `draft`)

**Lỗi mẫu:**
```json
{ "error": { "code": "invalid_category", "message": "Chuyên mục không hợp lệ" } }
```

### GET /api/hr/jobs/{job_id}

**Response 200:** `HrJobResponse`

**Lỗi:** `404` nếu không sở hữu job.

### PATCH /api/hr/jobs/{job_id}

Cập nhật job (field optional). Nếu job đang `approved` mà sửa field substantive (title, description, requirements, salary, location, job_type, category, tags) → status quay về `pending`.

**Response 200:** `HrJobResponse`

### DELETE /api/hr/jobs/{job_id}

Xóa job (chỉ cho phép `draft`, `rejected`, `closed`, `expired`).

**Response 204**

### POST /api/hr/jobs/{job_id}/submit

Gửi job `draft`/`rejected` để duyệt → `pending`.

**Response 200:** `HrJobResponse`

### POST /api/hr/jobs/{job_id}/close

Đóng job `approved` → `closed`.

**Response 200:** `HrJobResponse`

---

## 5. Admin (role=admin)

Tất cả endpoint yêu cầu session admin.

### 5.1 Quản lý job

#### GET /api/admin/jobs

Danh sách tất cả job.

**Query:** `?status=&q=&hr_id=&category_id=&page=&page_size=`

**Response 200:** `PaginatedResponse<AdminJobResponse>`

#### GET /api/admin/jobs/pending

Danh sách job đang `pending`.

**Response 200:** `PaginatedResponse<AdminJobResponse>`

#### POST /api/admin/jobs/{job_id}/approve

Duyệt job `pending` → `approved`.

**Response 200:** `AdminJobResponse`

#### POST /api/admin/jobs/{job_id}/reject

Từ chối job `pending` → `rejected`.

**Body:**
```json
{ "reason": "Thiếu thông tin yêu cầu" }
```

**Response 200:** `AdminJobResponse`

#### POST /api/admin/jobs/{job_id}/hide

Ẩn job `approved` → `hidden`.

#### POST /api/admin/jobs/{job_id}/unhide

Khôi phục job `hidden` → `approved`.

#### DELETE /api/admin/jobs/{job_id}

Xóa job (dọn cả `job_tags` và `job_views`).

**Response 204**

### 5.2 Quản lý HR

#### GET /api/admin/users

**Query:** `?search=&status=&page=&page_size=`

**Response 200:** `PaginatedResponse<AdminUserResponse>`

```json
{
  "items": [
    {
      "id": 3,
      "name": "Công ty ABC",
      "email": "demo.hr@remoteit.vn",
      "company_name": "Công ty ABC",
      "status": "active",
      "created_at": "2026-08-22T10:00:00Z",
      "job_count": 5
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1,
  "total_pages": 1
}
```

#### POST /api/admin/users/{user_id}/approve

Duyệt HR `pending` → `active`.

#### POST /api/admin/users/{user_id}/block

Khóa HR → `blocked` (job của HR bị ẩn khỏi public).

#### POST /api/admin/users/{user_id}/unblock

Mở khóa HR `blocked` → `active`.

### 5.3 Quản lý catalog

#### GET /api/admin/categories

**Response 200:**
```json
[
  { "id": 1, "name": "Backend", "slug": "backend", "sort_order": 1, "is_active": true }
]
```

#### POST /api/admin/categories

**Body:**
```json
{ "name": "Security", "slug": "security", "sort_order": 9 }
```

> `slug` optional — tự sinh từ `name` nếu không truyền.

**Response 201:** `CategoryResponse`

#### PATCH /api/admin/categories/{id}

**Body:** `{ "name"?, "slug"?, "sort_order"? }`

**Response 200:** `CategoryResponse`

#### POST /api/admin/categories/{id}/deactivate

Vô hiệu hóa category (không hard-delete).

**Response 200:** `CategoryResponse`

#### GET /api/admin/tags

**Response 200:**
```json
[
  { "id": 1, "name": "React", "slug": "react", "is_active": true }
]
```

#### POST /api/admin/tags

**Body:** `{ "name": "Rust", "slug": "rust" }`

**Response 201:** `TagResponse`

#### PATCH /api/admin/tags/{id}

**Body:** `{ "name"?, "slug"? }`

**Response 200:** `TagResponse`

#### POST /api/admin/tags/{id}/deactivate

Vô hiệu hóa tag.

**Response 200:** `TagResponse`
