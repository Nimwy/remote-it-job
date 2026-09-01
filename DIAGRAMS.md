# Diagrams — Remote IT Job

Các sơ đồ kiến trúc, luồng nghiệp vụ và sequence bằng Mermaid.

## 1. Kiến trúc tổng thể

```mermaid
flowchart TB
    B[Browser] --> F["Next.js Frontend<br/>(SSR + Client Components)"]
    F -->|"REST / JSON<br/>HTTP-only session cookie"| A["FastAPI Backend"]
    A --> D[("PostgreSQL")]
    A -->|Google OAuth| G["Google Identity"]
```

## 2. Kiến trúc phân lớp backend

```mermaid
flowchart TB
    R[API Routes] --> S[Services<br/>(business logic)]
    S --> Rep[Repositories<br/>(data access)]
    Rep --> M[SQLAlchemy Models]
    Rep --> D[("PostgreSQL")]
    S --> Sch[Pydantic Schemas]
    R --> Sch
```

## 3. User lifecycle (HR)

```mermaid
flowchart LR
    Start(["HR register<br/>hoặc Google login"]) --> Pending[pending]
    Pending -->|"Admin approve"| Active[active]
    Active -->|"Admin block"| Blocked[blocked]
    Blocked -->|"Admin unblock"| Active
```

## 4. Job lifecycle

```mermaid
flowchart TD
    Draft[draft] -->|"HR submit"| Pending[pending]
    Pending -->|"Admin approve"| Approved[approved]
    Pending -->|"Admin reject"| Rejected[rejected]
    Rejected -->|"HR edit + resubmit"| Pending
    Approved -->|"HR close"| Closed[closed]
    Approved -->|"expires_at reached"| Expired[expired]
    Approved -->|"Admin hide"| Hidden[hidden]
    Hidden -->|"Admin unhide"| Approved
    Approved -->|"HR edit substantive"| Pending
```

## 5. Sequence — Đăng nhập email/password

```mermaid
sequenceDiagram
    participant C as Client
    participant B as Backend
    participant D as DB

    C->>B: POST /auth/login {email, password}
    B->>D: find user by email
    D-->>B: user
    B->>B: verify password (Argon2id)
    B->>D: create session (token_hash)
    B-->>C: 200 UserResponse + set-cookie session
```

## 6. Sequence — Google OAuth

```mermaid
sequenceDiagram
    participant C as Client
    participant B as Backend
    participant G as Google
    participant D as DB

    C->>B: GET /auth/google/login
    B-->>C: redirect sang Google (authorize)
    C->>G: authorize
    G-->>C: redirect /auth/google/callback?code=
    C->>B: GET /auth/google/callback?code=
    B->>G: exchange code, validate state/issuer
    G-->>B: userinfo (sub, email, name)
    B->>D: find user by google_id, hoặc email, hoặc tạo mới (pending)
    B->>D: create session
    B-->>C: redirect frontend + set-cookie session
```

## 7. Sequence — Đăng tin và kiểm duyệt

```mermaid
sequenceDiagram
    participant H as HR
    participant B as Backend
    participant A as Admin

    H->>B: POST /hr/jobs (tạo draft)
    H->>B: POST /hr/jobs/{id}/submit
    B-->>H: status = pending
    A->>B: GET /admin/jobs/pending
    A->>B: POST /admin/jobs/{id}/approve
    B-->>A: status = approved
    Note over B: Job hiển thị public
```

## 8. Sequence — Xem job và đếm view

```mermaid
sequenceDiagram
    participant V as Visitor
    participant B as Backend
    participant D as DB

    V->>B: GET /jobs/{id} (visitor cookie)
    B->>D: kiểm tra approved + chưa hết hạn + owner active
    B->>D: tìm job_views (job_id, visitor_key)
    alt Chưa xem trong 24h
        B->>D: tăng jobs.views, ghi job_views
    end
    B-->>V: job detail + contacts
```

## 9. Class diagram — Models

```mermaid
classDiagram
    class User {
        +int id
        +str role
        +str name
        +str email
        +str password_hash
        +str google_id
        +str company_name
        +str avatar
        +str status
        +datetime created_at
        +datetime updated_at
    }
    class Session {
        +int id
        +int user_id
        +str token_hash
        +datetime expires_at
    }
    class UserContact {
        +int id
        +int user_id
        +str channel
        +str value
    }
    class Category {
        +int id
        +str name
        +str slug
        +int sort_order
        +bool is_active
    }
    class Tag {
        +int id
        +str name
        +str slug
        +bool is_active
    }
    class Job {
        +int id
        +int hr_id
        +int category_id
        +str title
        +str slug
        +str job_type
        +str location
        +decimal salary_min
        +decimal salary_max
        +str status
        +str rejection_reason
        +int views
        +datetime expires_at
    }
    class JobTag {
        +int job_id
        +int tag_id
    }
    class JobView {
        +int id
        +int job_id
        +str visitor_key
        +datetime viewed_at
    }

    User "1" --> "0..*" Job : posts
    User "1" --> "0..*" Session : has
    User "1" --> "0..*" UserContact : owns
    Category "1" --> "0..*" Job : classifies
    Job "1" --> "0..*" JobTag : has
    Tag "1" --> "0..*" JobTag : used_by
    Job "1" --> "0..*" JobView : viewed_by
```

## 10. Hành trình người dùng (User Journey)

> Mô tả trạng thái màn hình tương ứng ở `SCREENS.md`; sơ đồ này bổ sung sequence, nhánh lỗi và trạng thái rỗng.

### 10.1 Job seeker: tìm việc → xem chi tiết → liên hệ HR

```mermaid
sequenceDiagram
    actor K as Job seeker
    participant F as Frontend (SSR)
    participant B as Backend
    participant D as DB

    K->>F: Mở trang chủ `/`
    F->>B: GET /jobs (featured)
    B->>D: job approved + chưa hết hạn + owner active
    alt Không có job
        F-->>K: "Chưa có tin tuyển dụng nổi bật"
    else Có job
        F-->>K: danh sách JobCard
    end
    K->>F: Bấm tìm kiếm / bộ lọc `/jobs`
    F-->>K: danh sách kết quả (filter, pagination)
    alt Không tìm thấy
        F-->>K: "Không tìm thấy việc làm nào phù hợp"
    end
    K->>F: Mở chi tiết `/jobs/{slug}-{id}`
    F->>B: GET /jobs/{id} (visitor cookie)
    alt Job không public (pending/hidden/expired/blocked owner)
        B-->>F: 404 -> F-->>K: "Việc làm không tồn tại hoặc đã ẩn"
    else Job public
        B->>D: đếm view (max 1/24h)
        F-->>K: mô tả + yêu cầu + kênh liên hệ + tags
        K->>K: liên hệ HR qua kênh ngoài (không nộp CV trên nền tảng)
    end
```

### 10.2 HR: đăng ký → chờ duyệt → đăng tin → bị từ chối → sửa → gửi lại

```mermaid
sequenceDiagram
    actor H as HR
    actor A as Admin
    participant F as Frontend
    participant B as Backend
    participant D as DB

    H->>F: Đăng ký `/register`
    F->>B: POST /auth/register
    B->>D: tạo HR (status=pending)
    B-->>H: "Tài khoản đang chờ phê duyệt"
    A->>F: Duyệt HR `/admin/users`
    F->>B: POST /admin/users/{id}/approve -> status=active
    H->>F: Đăng nhập `/login` -> `/hr`
    H->>F: Đăng tin `/hr/jobs/new`
    F->>B: POST /hr/jobs -> status=draft
    H->>F: Gửi duyệt (job) -> status=pending
    alt Admin TỪ CHỐI
        A->>B: POST /admin/jobs/{id}/reject
        B-->>H: job=rejected + rejection_reason
        H->>F: Sửa `/hr/jobs/{id}/edit` -> gửi lại -> status=pending
    else Admin CHẤP THUẬN
        A->>B: POST /admin/jobs/{id}/approve -> status=approved
        B-->>K: job public
    end
    H->>F: Đóng/Xoá tin tại `/hr`
```

Trạng thái rỗng liên quan: `/hr` chưa có tin nào → "Bạn chưa có tin tuyển dụng nào"; `/admin/pending` không còn tin → "Không có tin nào đang chờ duyệt".
