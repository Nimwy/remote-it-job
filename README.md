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
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
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
- `DATABASE_SCHEMA.md` — database schema và constraints.
- `API_SPEC.md` — REST API contract.
- `SECURITY.md` — yêu cầu bảo mật.
- `PROJECT_MAP.md` — cấu trúc source code.
- `PROJECT_STATE.md` — trạng thái triển khai hiện tại.

## MVP Non-goals

Không tự ý thêm Redis, Elasticsearch, Kafka, Celery, microservices, Kubernetes, paid API/service, cloud storage hoặc AI API nếu chưa có quyết định mới.
