# AI Context — Remote IT Job

## 1. Vai trò của tài liệu

File này là nguồn quy tắc dành cho AI coding agent (OpenCode/DeepSeek hoặc agent tương đương).

AI phải đọc tài liệu này trước khi sửa code.

Khi có xung đột giữa code hiện tại và tài liệu:
1. Không tự ý thay đổi requirement.
2. Xác định phần xung đột.
3. Ưu tiên quyết định kiến trúc đã được chốt trong tài liệu.
4. Nếu thay đổi ảnh hưởng schema, API, authentication hoặc security, phải cập nhật tài liệu liên quan.

## 2. Mục tiêu hệ thống

Xây dựng website đăng tin tuyển dụng IT remote, hướng tới người dùng Việt Nam.

Job seeker:
- Không cần tài khoản.
- Tìm kiếm, lọc, xem chi tiết job.
- Xem kênh liên hệ HR.
- Tự liên hệ HR bên ngoài hệ thống.
- Không upload/nộp CV qua website.

HR:
- Đăng ký bằng email/password hoặc đăng nhập bằng Google.
- Tài khoản mới phải chờ Admin duyệt.
- Tạo, sửa, đóng và quản lý job của mình.
- Job phải được Admin duyệt trước khi public.

Admin:
- Đăng nhập bằng tài khoản quản trị.
- Duyệt/từ chối job.
- Duyệt, khóa/mở khóa HR.
- Ẩn/xóa job vi phạm.
- Quản lý category/tag.
- Xem thống kê cơ bản.

## 3. Tech Stack đã chốt

Frontend:
- Next.js (App Router, SSR)
- React
- TypeScript
- Tailwind CSS v4
- TanStack Query
- React Hook Form
- Zod
- next-intl (i18n EN/VI)
- Node.js/npm chạy trực tiếp, không Docker hóa frontend trong MVP.

Backend:
- Python
- FastAPI
- Pydantic
- SQLAlchemy 2.x
- Alembic
- pytest + httpx
- Ruff
- Docker.

Database:
- PostgreSQL
- Docker Compose.

Authentication:
- Email/password
- Google OAuth
- Server-side session lưu PostgreSQL
- HTTP-only cookie
- Argon2id cho password.

API:
- REST
- JSON
- OpenAPI do FastAPI sinh.

## 4. Nguyên tắc kiến trúc

- Backend là nguồn xác thực cuối cùng.
- Frontend route guard không phải cơ chế bảo mật.
- Không tin dữ liệu do frontend gửi.
- Mọi authorization phải được kiểm tra ở backend.
- HR chỉ được thao tác với tài nguyên thuộc về mình.
- Admin có quyền moderation theo role.
- Không hard-delete HR khi khóa tài khoản.
- Job của HR bị khóa phải được ẩn khỏi public.
- Job đã approved nếu sửa các trường nội dung quan trọng phải quay lại pending.
- Job bị từ chối phải có rejection reason.
- `expires_at` phải được kiểm tra khi truy vấn public; không phụ thuộc hoàn toàn vào cron/background task.

## 5. User lifecycle

```text
HR register / Google first login
        ↓
pending
        ↓ Admin approve
active
        ↓ Admin block
blocked
```

Google không tự động cấp quyền HR.

Admin account được tạo bằng seed/CLI, không dùng Google OAuth trong MVP.

## 6. Job lifecycle

```text
draft
  ↓ submit
pending
  ├── approve → approved
  └── reject  → rejected
                    ↓ edit + resubmit
                  pending

approved
  ├── HR close → closed
  ├── expires_at reached → expired
  └── Admin hide → hidden
```

Nếu job approved được sửa các trường substantive như title, description, requirements, salary, location, job_type, category hoặc tags thì phải re-approval.

## 7. Coding rules

### Python
- snake_case cho variables/functions/modules.
- PascalCase cho classes.
- Type hints cho public functions.
- Không nhồi toàn bộ business logic vào route handler.
- Pydantic schema, service/business logic và database access phải có ranh giới rõ.
- Không dùng `print()` cho application logging; sử dụng Python standard library `logging`. Không thêm logging framework bên ngoài nếu chưa có nhu cầu thực tế.
- Không commit secrets.

### TypeScript
- camelCase cho variables/functions.
- PascalCase cho React components/types.
- Ưu tiên type rõ ràng, tránh `any`.
- Server state dùng TanStack Query.
- Form dùng React Hook Form + Zod khi phù hợp.

### General
- Ưu tiên code đơn giản, dễ đọc.
- Không thêm dependency nếu chưa cần.
- Không tạo abstraction chỉ để "phòng tương lai".
- Không refactor diện rộng nếu task không yêu cầu.

## 8. MVP không được tự ý thêm

- Redis
- Elasticsearch/OpenSearch
- Kafka
- Celery
- Kubernetes
- Microservices
- GraphQL
- Firebase/Supabase thay thế backend/database
- Paid email service
- Paid analytics
- AI API
- Cloud storage
- Docker hóa frontend

Các công nghệ trên chỉ được thêm khi có quyết định mới.

## 9. Testing

Ưu tiên test các logic quan trọng:
- authentication
- authorization
- HR approval
- job lifecycle
- job moderation
- search/filter
- pagination
- view counting
- blocked HR behavior

## 10. Documentation rule

Nếu code làm thay đổi:
- database schema → cập nhật `DATABASE_SCHEMA.md`
- API contract → cập nhật `API_SPEC.md` và `API_REFERENCE.md`
- security behavior → cập nhật `SECURITY.md`
- architecture → cập nhật `ARCHITECTURE.md` và `DIAGRAMS.md` (nếu ảnh hưởng sơ đồ)
- project state → cập nhật `PROJECT_STATE.md`

Không tạo thêm file documentation chỉ để mô tả lại thông tin đã có nếu không thực sự cần.

## 11. Tham chiếu UI từ Stitch

Dự án chứa thư mục `stitch_remote_it_job_board/` với UI output được tạo từ Google Stitch.

Sử dụng Stitch output làm nguồn tham chiếu visual cho React frontend:
- giữ nguyên các requirement và kiến trúc đã được phê duyệt trong tài liệu này;
- chuyển đổi Stitch UI thành cấu trúc React/TypeScript component của dự án;
- không coi markup hoặc cấu trúc dự án từ Stitch là nguồn xác thực cho backend, API, authentication, database, hoặc kiến trúc frontend;
- không tạo ra một kiến trúc frontend riêng chỉ vì nó xuất hiện trong Stitch output.

