# Project Map — Remote IT Job

## 1. Repository structure

```text
remote-it-job/
├── stitch_remote_it_job_board/     # Stitch UI reference; not production source
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── types/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── migrations/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── README.md
├── AI_CONTEXT.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_SPEC.md
├── SECURITY.md
├── PROJECT_MAP.md
└── PROJECT_STATE.md
```

## 2. Frontend boundaries

### pages/
View cấp route cao nhất.

Ví dụ:
- HomePage
- JobsPage
- JobDetailPage
- LoginPage
- RegisterPage
- HrDashboardPage
- AdminDashboardPage

### features/
Logic frontend theo domain.

Ví dụ:
- auth
- jobs
- hr
- admin
- search

### components/
Component UI tái sử dụng, không thuộc riêng một domain.

Ví dụ:
- Button
- Modal
- Pagination
- JobCard
- FormField

Component có thể chuyển thành domain-specific và chuyển vào feature khi phù hợp.

### services/
Hàm gọi API client.

### hooks/
React hooks tái sử dụng.

### lib/
Thiết lập infrastructure/helper như query client và hàm tiện ích.

### types/
TypeScript types dùng chung khi không thuộc riêng một feature.

## 3. Backend boundaries

### api/
HTTP endpoints và dependency wiring.

### schemas/
Pydantic request/response schemas.

### models/
SQLAlchemy database models.

### services/
Business logic và lifecycle rules.

### repositories/
Database access abstractions khi cần.

Không tạo repository wrapper cho mọi query mà không có lý do cụ thể.

### core/
Security, configuration, tiện ích toàn ứng dụng.

### db/
Database engine/session setup.

### migrations/
Alembic migrations.

### tests/
Unit/integration/API tests.

## 4. Naming

Python:
- modules/files: snake_case
- functions/variables: snake_case
- classes: PascalCase

TypeScript:
- variables/functions: camelCase
- React components/types: PascalCase
- hooks: `useXxx`

## 5. Quy tắc sở hữu

Trước khi thêm file, xác định layer nào chịu trách nhiệm.

Tránh:
- database queries trong React
- business logic trực tiếp trong UI components
- authorization logic chỉ ở frontend
- FastAPI route handler lớn chứa toàn bộ business logic
