# Remote IT Job

Website tuyển dụng việc làm remote dành cho thị trường Việt Nam.

## Mục tiêu

- Job seeker không cần đăng nhập để tìm kiếm và xem việc làm.
- HR có thể đăng ký/đăng nhập bằng email + password hoặc Google OAuth.
- Tài khoản HR mới phải được Admin duyệt trước khi sử dụng chức năng đăng tin.
- Job phải được Admin duyệt trước khi hiển thị công khai.
- Job seeker tự liên hệ HR qua các kênh được HR công khai; hệ thống không nhận CV.

## Tech Stack

### Frontend
- Next.js (App Router, SSR)
- React
- TypeScript
- Tailwind CSS v4
- TanStack Query
- React Hook Form + Zod
- next-intl (i18n EN/VI)
- Chạy trực tiếp bằng Node.js/npm, không Docker hóa trong MVP.

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy 2.x
- Alembic
- pytest + httpx
- Ruff
- Chạy bằng Docker.

### Database
- PostgreSQL
- Chạy bằng Docker Compose.

### Testing
- pytest (unit + API)
- Vitest (frontend unit)
- Playwright (e2e)

### Authentication
- Email/password
- Google OAuth
- Server-side session
- HTTP-only cookie
- Session lưu trong PostgreSQL
- Password hash bằng Argon2id

## Chạy dự án

### Yêu cầu
- Docker + Docker Compose
- Node.js 18+ và npm
- Python 3.12 (chạy trong Docker, không cần cài local)

### 1. Backend + Database

```bash
# Khởi động PostgreSQL + FastAPI
docker compose up -d db
docker compose run --rm backend alembic upgrade head   # chạy migration
docker compose run --rm backend python seed.py         # seed admin + categories + tags
docker compose run --rm backend python seed_demo.py    # (tùy chọn) seed dữ liệu mẫu
docker compose up -d backend                           # chạy API tại :8000
```

Backend docs tự sinh: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # nếu cần đổi BACKEND_URL
npm install
npm run dev                  # chạy tại :3000
```

### 3. Test

```bash
# Backend (unit + API)
docker compose run --rm backend pytest

# Frontend unit
cd frontend && npm test

# e2e (cần cài browser: npx playwright install chromium)
# Linux cần: sudo npx playwright install-deps chromium
cd frontend && npm run test:e2e
```

## Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `admin@remoteit.vn` | `admin123` |
| HR (demo) | `demo.hr@remoteit.vn` | `demo123` |

## Documentation

- `AI_CONTEXT.md` — quy tắc và context cho AI coding agent.
- `ARCHITECTURE.md` — kiến trúc hệ thống.
- `DIAGRAMS.md` — sơ đồ flow/sequence/class (Mermaid).
- `DATABASE_SCHEMA.md` — database schema và constraints.
- `API_SPEC.md` — REST API contract (tổng quan).
- `API_REFERENCE.md` — tài liệu kỹ thuật chi tiết từng API (request/response).
- `SECURITY.md` — yêu cầu bảo mật.
- `PROJECT_MAP.md` — cấu trúc source code.
- `PROJECT_STATE.md` — trạng thái triển khai hiện tại.

## MVP Non-goals

Không tự ý thêm Redis, Elasticsearch, Kafka, Celery, microservices, Kubernetes, paid API/service, cloud storage hoặc AI API nếu chưa có quyết định mới.
