# Project Map — Remote IT Job

## 1. Repository structure

```text
remote-it-job/
├── stitch_remote_it_job_board/     # Stitch UI reference; not production source
├── frontend/                       # Next.js (App Router)
│   ├── src/
│   │   ├── app/                    # route segments (App Router)
│   │   │   ├── [locale]/
│   │   │   │   ├── (main)/         # NavBar + Footer (home, jobs, category, tag, hr, admin)
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── layout.tsx          # root layout (html/body)
│   │   │   └── globals.css         # Tailwind v4 + design tokens
│   │   ├── components/             # UI tái sử dụng
│   │   ├── hooks/                  # React hooks (useAuth, useHr, useAdmin)
│   │   ├── lib/                    # helper (api client, server fetch, url, date)
│   │   ├── services/               # API client functions
│   │   ├── types/                  # shared TypeScript types
│   │   └── i18n/                   # next-intl config (routing, request, navigation)
│   ├── messages/                   # vi.json + en.json
│   ├── e2e/                        # Playwright tests
│   ├── proxy.ts                    # locale middleware
│   ├── next.config.ts
│   ├── playwright.config.ts
│   ├── vitest.config.ts
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/             # auth, jobs, catalog, hr, admin
│   │   ├── core/                   # config, security, slug, oauth
│   │   ├── db/                     # engine/session
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── repositories/           # data access
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── services/               # business logic
│   │   └── main.py
│   ├── migrations/                 # Alembic (mỗi bảng 1 file)
│   ├── tests/                      # pytest
│   ├── pyproject.toml              # Ruff config
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── README.md
├── AI_CONTEXT.md
├── ARCHITECTURE.md
├── DIAGRAMS.md
├── DATABASE_SCHEMA.md
├── API_SPEC.md
├── API_REFERENCE.md
├── SECURITY.md
├── PROJECT_MAP.md
└── PROJECT_STATE.md
```

## 2. Frontend boundaries

### app/
Route segments (Next.js App Router). Mỗi thư mục là một route.

Ví dụ:
- `app/[locale]/(main)/page.tsx` — Home
- `app/[locale]/(main)/jobs/page.tsx` — Job list
- `app/[locale]/(main)/jobs/[slugId]/page.tsx` — Job detail
- `app/[locale]/(main)/category/[slug]/page.tsx` — Category
- `app/[locale]/(main)/tag/[slug]/page.tsx` — Tag
- `app/[locale]/(main)/hr/...` — HR pages
- `app/[locale]/(main)/admin/...` — Admin pages
- `app/[locale]/login/`, `app/[locale]/register/` — Auth

Route group `(main)` dùng chung NavBar + Footer; `login`/`register` không có NavBar.

### components/
Component UI tái sử dụng, không thuộc riêng một domain.

Ví dụ:
- Button, Icon, Badge (ui/)
- JobCard, CompanyLogo, Skeleton
- NavBar, Footer, AuthPage, JobForm

### hooks/
React hooks dùng chung (useAuth, useHr, useAdmin).

### services/
Hàm gọi API client.

### lib/
Helper: api client (`api.ts`), server fetch (`server.ts`), `url.ts`, `date.ts`, `queryClient.ts`.

### i18n/
Cấu hình next-intl: `routing.ts`, `request.ts`, `navigation.ts`.

### messages/
File dịch `vi.json` + `en.json`.

### types/
TypeScript types dùng chung.

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
