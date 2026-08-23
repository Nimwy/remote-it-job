# API Reference — Remote IT Job

Tài liệu kỹ thuật chi tiết cho REST API. Base URL: `/api`.

- Định dạng: JSON (UTF-8)
- Xác thực: server-side session qua HTTP-only cookie (`session`)
- Backend docs tự sinh: `GET /docs` (Swagger UI) và `GET /openapi.json`

## 1. Quy ước chung

### 1.1 Response lỗi

```json
{
  "detail": "Email đã được đăng ký"
}
```

| HTTP status | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 204 | Thành công, không có body |
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập / phiên hết hạn |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 409 | Xung đột (email/slug đã tồn tại) |

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

---

## 2. Authentication

### POST /api/auth/register

Tạo tài khoản HR (trạng thái `pending`).

**Body:**
```json
{
  "name": "HR Test",
  "email": "hr@example.com",
  "password": "secret123",
  "company_name": "Test Corp"
}
```

**Response 201:** `UserResponse`

**Lỗi:** `409` nếu email đã tồn tại.

### POST /api/auth/login

Đăng nhập email/password, tạo session cookie.

**Body:**
```json
{
  "email": "hr@example.com",
  "password": "secret123"
}
```

**Response 200:** `UserResponse` + set cookie `session` (HttpOnly, 7 ngày)

**Lỗi:** `401` sai email/password.

### GET /api/auth/google/login

Bắt đầu Google OAuth flow (redirect sang Google).

### GET /api/auth/google/callback

Xử lý Google OAuth callback, tạo/link account, set session cookie, redirect về frontend.

### POST /api/auth/logout

Hủy session hiện tại, xóa cookie.

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

**Query params:**

| Param | Type | Mô tả |
|---|---|---|
| `q` | string | Tìm kiếm trong title/description |
| `category` | string | Slug category |
| `tags` | string | Danh sách slug tag, phân tách bằng `,` |
| `job_type` | string | fulltime/parttime/freelance/contract |
| `salary_min` | number | Lương tối thiểu |
| `salary_max` | number | Lương tối đa |
| `location` | string | Địa điểm (khớp một phần) |
| `timezone` | string | Múi giờ |
| `page` | number | Trang (mặc định 1) |
| `page_size` | number | Số item/trang (mặc định 20) |
| `sort` | string | `latest` (mặc định) |

**Response 200:** `PaginatedResponse<JobListItem>`

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

Tạo draft job.

**Body:**
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

**Response 201:** `HrJobResponse` (status `draft`, `slug` tự sinh từ title)

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
