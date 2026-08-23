# Implementation Plan

Lộ trình triển khai dự án Remote IT Job theo hướng **backend-first**, solo developer (AI agent).

---

## Nguyên tắc

- Backend hoàn chỉnh và test được trước khi chạm vào frontend.
- Không mock data ở frontend — nối API thật ngay từ đầu.
- Mỗi giai đoạn backend đều có test (pytest + httpx).
- Frontend dựa trên Stitch output làm tham chiếu visual.
- **Sau mỗi bước hoàn thành, commit và push code lên git** (`origin/main`).
  - Commit message theo format: `feat:` / `fix:` / `chore:` + mô tả ngắn.
  - Không commit secrets (`.env`), chỉ commit `.env.example`.
  - Kiểm tra `git status` trước khi commit, chỉ stage file liên quan.

---

## Giai đoạn 1: Thiết lập môi trường & Database

### 1.1 Docker + PostgreSQL
- Viết `docker-compose.yml`: PostgreSQL container + backend service skeleton.
- Viết `backend/Dockerfile`, `backend/requirements.txt`.
- Khởi động PostgreSQL, kiểm tra kết nối.

### 1.2 Cấu trúc thư mục backend
- Tạo cây thư mục theo `PROJECT_MAP.md`:
  ```
  backend/app/core/
  backend/app/db/
  backend/app/models/
  backend/app/schemas/
  backend/app/services/
  backend/app/repositories/
  backend/app/api/
  backend/app/main.py
  backend/tests/
  backend/migrations/
  ```
- Tạo `backend/app/core/config.py` — load biến môi trường từ `.env`.
- Tạo `backend/app/db/session.py` — SQLAlchemy engine + session factory.

### 1.3 Database models
- Tạo tất cả SQLAlchemy models trong `backend/app/models/`:
  - `user.py` — `users` table
  - `session.py` — `sessions` table
  - `contact.py` — `user_contacts` table
  - `category.py` — `categories` table
  - `tag.py` — `tags` table
  - `job.py` — `jobs` table
  - `job_tag.py` — `job_tags` table
- Định nghĩa đầy đủ FK, constraints, indexes.

### 1.4 Alembic migrations
- Khởi tạo Alembic.
- Tạo migration đầu tiên cho toàn bộ schema.
- Chạy migration, kiểm tra DB.

### 1.5 Seed data
- Viết script `backend/seed.py` tạo:
  - 1 tài khoản Admin (`active`, tạo bằng email/password)
  - 8 categories mặc định (Backend, Frontend, ...)
  - 10-15 tags mặc định (React, TypeScript, Python, ...)
- Chạy seed, kiểm tra dữ liệu.

---

## Giai đoạn 2: Core backend

### 2.1 Security utilities
- `core/security.py`:
  - `hash_password(password) -> str` — Argon2id hashing
  - `verify_password(plain, hashed) -> bool`
  - `generate_session_token() -> tuple[str, str]` — raw token + hash

### 2.2 Pydantic schemas
- `schemas/user.py` — UserCreate, UserResponse, UserLogin
- `schemas/session.py` — SessionCreate
- `schemas/job.py` — JobCreate, JobUpdate, JobResponse, JobListResponse
- `schemas/common.py` — PaginationParams, PaginatedResponse, ErrorResponse

### 2.3 API dependencies
- `api/dependencies.py`:
  - `get_db()` — FastAPI dependency, yield DB session
  - `get_current_user()` — lấy user từ session cookie, raise 401 nếu chưa auth
  - `require_active_hr()` — yêu cầu role=hr, status=active
  - `require_admin()` — yêu cầu role=admin, status=active

### 2.4 FastAPI app
- `main.py`: tạo app, CORS config, lifespan, include routers.
- `.env.example` với các biến cần thiết.

---

## Giai đoạn 3: Authentication

### 3.1 Register
- `POST /api/auth/register`
- Input: name, email, password, company_name
- Hash password, tạo user với status=`pending`
- Không tạo session (cần đăng nhập riêng)

### 3.2 Login
- `POST /api/auth/login`
- Input: email, password
- Verify password, tạo session, set HTTP-only cookie
- Cho phép pending HR login nhưng chặn HR operations

### 3.3 Google OAuth
- `GET /api/auth/google/login` — redirect Google
- `GET /api/auth/google/callback` — xử lý callback
- Tìm user theo google_id hoặc email, tạo mới nếu cần (status=`pending`)
- Tạo session, set cookie

### 3.4 Session management
- `POST /api/auth/logout` — xóa session khỏi DB, clear cookie
- `GET /api/auth/me` — trả về thông tin user hiện tại

### 3.5 Change password
- `POST /api/auth/change-password`
- Yêu cầu current_password + new_password
- Xác thực current_password, hash và lưu new_password

### 3.6 Tests
- Test tất cả auth endpoints:
  - Register thành công
  - Register email trùng
  - Login thành công
  - Login sai password
  - Pending HR bị chặn HR operations
  - Change password

---

## Giai đoạn 4: Public jobs

### 4.1 Search & filter service
- `services/job_service.py`:
  - `search_jobs(params)` — keyword, category, tags, job_type, salary_min, salary_max, location, timezone
  - Điều kiện: `status=approved`, `expires_at > now` hoặc NULL, HR owner không bị blocked
  - Offset pagination (mặc định 20/page)
  - Sort: latest / relevant

### 4.2 Public endpoints
- `GET /api/jobs` — danh sách job public với tất cả query params
- `GET /api/jobs/{job_id}` — chi tiết job + HR contacts, tăng view count (1/session/24h)
- `GET /api/categories` — danh sách category active
- `GET /api/tags` — danh sách tag active

### 4.3 View counting
- Kiểm tra session cookie
- Nếu session đó chưa xem job này trong 24h → tăng `jobs.views`
- Dùng bảng `job_views` hoặc logic in-memory để dedup

### 4.4 Tests
- Test search với từng filter
- Test pagination
- Test view count dedup
- Test job bị expired/blocked HR không hiển thị

---

## Giai đoạn 5: HR features

### 5.1 HR profile & contacts
- `GET /api/hr/profile` — thông tin HR + contacts
- `PATCH /api/hr/profile` — cập nhật name, company_name, avatar, contacts
- Contacts: tối đa 1 value/channel (UNIQUE constraint), 5 channels (zalo, telegram, linkedin, phone, email)

### 5.2 HR job CRUD
- `GET /api/hr/jobs` — danh sách job của HR, filter status, pagination
- `POST /api/hr/jobs` — tạo draft job
- `GET /api/hr/jobs/{job_id}` — chi tiết job (chỉ owner)
- `PATCH /api/hr/jobs/{job_id}` — sửa job:
  - Nếu job đang `approved` và sửa substantive fields → chuyển status về `pending`
- `DELETE /api/hr/jobs/{job_id}` — xóa job (chỉ khi draft/rejected/closed/expired)

### 5.3 Job lifecycle actions
- `POST /api/hr/jobs/{job_id}/submit` — draft/rejected → pending
- `POST /api/hr/jobs/{job_id}/close` — approved → closed

### 5.4 Tests
- HR không active bị chặn
- HR chỉ xem/sửa job của mình
- Substantive edit re-approval
- Submit/reject/close transitions

---

## Giai đoạn 6: Admin features

### 6.1 Admin job moderation
- `GET /api/admin/jobs` — tất cả job, filter status
- `GET /api/admin/jobs/pending` — job đang chờ duyệt
- `POST /api/admin/jobs/{job_id}/approve` — pending → approved
- `POST /api/admin/jobs/{job_id}/reject` — pending → rejected, lưu reason
- `POST /api/admin/jobs/{job_id}/hide` — approved → hidden
- `POST /api/admin/jobs/{job_id}/unhide` — hidden → approved

### 6.2 Admin HR management
- `GET /api/admin/users` — danh sách HR, filter status, pagination
- `POST /api/admin/users/{user_id}/approve` — pending → active
- `POST /api/admin/users/{user_id}/block` — active → blocked
- `POST /api/admin/users/{user_id}/unblock` — blocked → active

### 6.3 Admin catalog management
- `GET /api/admin/categories` + `POST`, `PATCH`, `POST .../deactivate`
- `GET /api/admin/tags` + `POST`, `PATCH`, `POST .../deactivate`
- Không hard-delete category/tag đã có job tham chiếu

### 6.4 Tests
- Chỉ admin mới truy cập được admin endpoints
- Block/unblock HR
- Job moderation transitions
- Catalog CRUD

---

## Giai đoạn 7: Frontend

> **Lưu ý:** Giai đoạn này ban đầu dự kiến dùng Vite + React Router, nhưng sau khi review
> đã chuyển sang **Next.js (App Router, SSR)** cho tối ưu SEO. Chi tiết xem `ARCHITECTURE.md`.

### 7.1 Thiết lập
- Khởi tạo Next.js + React + TypeScript (App Router)
- Cài Tailwind CSS v4 (cấu hình tokens từ `DESIGN.md` của Stitch)
- Cài TanStack Query, React Hook Form, Zod, next-intl
- Cấu trúc thư mục theo `PROJECT_MAP.md`

### 7.2 Layout & Design System
- `components/` — Button, Input, Select, Badge, Card, Modal, Pagination
- `components/` — NavBar (responsive, mobile hamburger)
- `components/` — Footer
- Cấu hình Tailwind với color tokens, typography từ Stitch DESIGN.md

### 7.3 Public pages
- `pages/HomePage` — Hero, filters, featured jobs grid
- `pages/JobsPage` — Search results với sidebar filter
- `pages/JobDetailPage` — Job info + HR contact sidebar
- `hooks/useJobs` — TanStack Query hooks gọi API

### 7.4 Auth pages
- `pages/LoginPage` — Email/password + Google OAuth
- `pages/RegisterPage` — Form đăng ký
- `hooks/useAuth` — TanStack Query hooks cho auth
- Route guard: redirect nếu chưa login

### 7.5 HR pages
- `pages/HrDashboardPage` — Stats + job list table
- `pages/PostJobPage` — Form đăng tin (category, tags, salary, mô tả)
- `pages/EditJobPage` — Sửa job
- `pages/HrProfilePage` — Profile + contacts management

### 7.6 Admin pages
- `pages/AdminDashboardPage` — Stats overview
- `pages/AdminJobsPage` — Duyệt/từ chối/ẩn job
- `pages/AdminUsersPage` — Duyệt/khóa HR
- `pages/AdminCatalogPage` — Quản lý categories + tags

### 7.7 Kết nối API
- Thay mock data bằng API thật
- Xử lý loading/error states
- Protected routes với role check

---

## Giai đoạn 8: Hoàn thiện

### 8.1 Tests
- Chạy toàn bộ backend test suite, sửa lỗi
- Kiểm tra frontend build không lỗi

### 8.2 End-to-end
- Đăng ký HR → duyệt → đăng tin → duyệt → hiển thị public
- Block HR → job biến mất khỏi public
- Sửa approved job → về pending → duyệt lại
- Expired job → không hiển thị

### 8.3 Dọn dẹp
- Xóa console.log, code thừa
- Kiểm tra lint (Ruff + ESLint)
- Cập nhật `PROJECT_STATE.md`

---

## Tổng quan tiến độ

```
Giai đoạn 1:  ████████████  Môi trường + Database       (2 buổi)
Giai đoạn 2:  ████████████  Core backend                (1 buổi)
Giai đoạn 3:  ████████████  Authentication              (2 buổi)
Giai đoạn 4:  ████████████  Public jobs                 (1 buổi)
Giai đoạn 5:  ████████████  HR features                 (1.5 buổi)
Giai đoạn 6:  ████████████  Admin features              (1.5 buổi)
Giai đoạn 7:  ████████████  Frontend                    (4 buổi)
Giai đoạn 8:  ████████████  Hoàn thiện                  (1 buổi)
                                                       ---------
                                           Tổng:       ~14 buổi
```
