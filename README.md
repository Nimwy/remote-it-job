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
