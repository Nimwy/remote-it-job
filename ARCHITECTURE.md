# System Architecture

## 1. Tổng quan

```text
                         Public Users
                              |
                              v
                    +-------------------+
                    | React Frontend    |
                    +---------+---------+
                              |
                         HTTPS / JSON
                              |
                              v
                    +-------------------+
                    | FastAPI Backend   |
                    +---------+---------+
                              |
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
 Authentication        Business Logic       PostgreSQL
 Email / Google        RBAC / Jobs          SQLAlchemy
 Session               Moderation           Alembic
```

## 2. Frontend

Công nghệ:
- React
- TypeScript
- React Router
- Tailwind CSS nếu phù hợp với Stitch output.

Frontend chịu trách nhiệm:
- Rendering UI.
- Client-side routing.
- Form interaction.
- Request API.
- Hiển thị loading/error/success states.
- Quản lý session state ở client.

Frontend không chịu trách nhiệm cuối cùng cho:
- Authorization.
- Ownership.
- Job status transition.
- HR approval.
- Security validation.

## 3. Backend

FastAPI là application/API layer.

Backend chịu trách nhiệm:
- Authentication.
- OAuth callback.
- Session management.
- Authorization/RBAC.
- CRUD.
- Business rules.
- Validation.
- Search/filter/pagination.
- Moderation.
- View counting.
- Database transaction.

Kiến trúc backend khuyến nghị:

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── api/
│   │   └── routes/
│   └── dependencies/
└── tests/
```

Không bắt buộc giữ đúng tên thư mục nếu implementation có lý do rõ ràng, nhưng phải giữ separation of concerns.

## 4. Database

PostgreSQL là database chính.

SQLAlchemy:
- ORM/model mapping.
- Query building.
- Transaction management.

Alembic:
- Database migrations.
- Không chỉnh schema bằng tay trong production workflow.

## 5. Authentication architecture

```text
                    +------------------+
                    | React            |
                    +--------+---------+
                             |
                +------------+------------+
                |                         |
                v                         v
        Email/password              Google OAuth
                |                         |
                +------------+------------+
                             v
                       FastAPI Auth
                             |
                             v
                          users
                             |
                             v
                         sessions
```

Session implementation phải dùng server-side session hoặc secure signed/session mechanism đã được chốt trong implementation. Không lưu access credentials nhạy cảm trong localStorage nếu không cần thiết.

Cookie-based HTTP-only session là phương án ưu tiên cho web application này.

## 6. Authorization

Roles:
- hr
- admin

Status:
- pending
- active
- blocked

Ma trận cơ bản:

| Action | Guest | Pending HR | Active HR | Admin |
|---|---:|---:|---:|---:|
| Xem public job | ✓ | ✓ | ✓ | ✓ |
| Search/filter | ✓ | ✓ | ✓ | ✓ |
| Login | - | ✓ | ✓ | ✓ |
| Tạo job | - | ✗ | ✓ | Theo admin policy |
| Sửa job của mình | - | ✗ | ✓ | ✓ |
| Gửi duyệt | - | ✗ | ✓ | - |
| Duyệt HR | - | ✗ | ✗ | ✓ |
| Block HR | - | ✗ | ✗ | ✓ |
| Duyệt job | - | ✗ | ✗ | ✓ |
| Quản lý mọi job | - | ✗ | ✗ | ✓ |

## 7. Public job visibility

Chỉ job có trạng thái:
- approved
- chưa hết hạn

mới được hiển thị public.

`closed`, `hidden`, `rejected`, `draft`, `pending` không được public.

Nếu `expires_at` đã qua, backend phải coi job là expired theo business rules; không phụ thuộc frontend.

## 8. Job lifecycle

```text
DRAFT
  |
  | submit
  v
PENDING
  | \
  |  \ reject
  |   v
  | REJECTED
  |
  | approve
  v
APPROVED
  | \
  |  \ admin hide
  |   v
  | HIDDEN
  |
  +---- HR close ---> CLOSED
  |
  +---- expires_at --> EXPIRED
```

Nếu job rejected được HR sửa và gửi lại, transition về pending.

## 9. Contact architecture

```text
users
  |
  +---- user_contacts
             |
             +-- zalo
             +-- telegram
             +-- linkedin
             +-- phone
             +-- email

jobs.hr_id ---> users.id
```

Job không lưu contact copy.

## 10. Search

MVP search chạy trên PostgreSQL.

Các trường chính:
- title
- description
- requirements
- tags
- category
- location

Filter:
- category
- tags
- job_type
- salary range
- location
- timezone

Pagination phải được thực hiện ở backend, không tải toàn bộ jobs về frontend.

## 11. Deployment

Domain, hosting và production infrastructure nằm ngoài phạm vi hiện tại.

Application phải portable và không phụ thuộc không cần thiết vào một cloud provider.
