# Project Map

## 1. Repository structure

```text
remote-it-job/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── router/
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── dependencies/
│   │   └── main.py
│   └── tests/
│
├── migrations/
│
├── docs/
│
├── .env.example
├── .gitignore
├── AI_CONTEXT.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_SPEC.md
├── SECURITY.md
├── PROJECT_MAP.md
├── PROJECT_STATE.md
├── CHANGELOG.md
└── README.md
```

## 2. Frontend areas

### Public
- Home
- Job search/results
- Job detail
- HR login/register

### HR
- Dashboard
- My jobs
- Create job
- Edit job
- Account/profile
- Contact management

### Admin
- Dashboard
- HR management
- Pending job moderation
- All jobs
- Category/tag management nếu được đưa vào MVP

## 3. Backend modules

### Auth
- Email registration/login.
- Google OAuth.
- Session.
- Logout.
- Account linking.

### Users
- Current user.
- HR profile.
- Contact management.
- Admin HR management.

### Jobs
- Create.
- Read.
- Update.
- Delete/controlled removal.
- Submit for review.
- Close.
- Search.
- Filter.
- Pagination.
- View counting.

### Moderation
- HR approval.
- Job approval/rejection.
- Hide/unhide.
- Block/unblock HR.

### Catalog
- Categories.
- Tags.

## 4. Data ownership

```text
User
 ├── Contacts
 └── Jobs

Job
 ├── Category
 └── Tags
```

Job không sở hữu contact/company data độc lập.

## 5. Route convention

Public routes:
```text
/
 /jobs
 /jobs/:id
 /login
 /register
```

HR routes:
```text
/hr
/hr/jobs
/hr/jobs/new
/hr/jobs/:id/edit
/hr/account
```

Admin routes:
```text
/admin
/admin/hr
/admin/jobs
/admin/jobs/pending
/admin/catalog
```

API routes nên có prefix `/api/v1`.

## 6. File ownership guideline

- `models/`: database representation.
- `schemas/`: API input/output schemas.
- `repositories/`: database access.
- `services/`: business logic.
- `api/routes/`: HTTP layer.
- `dependencies/`: authentication/authorization dependencies.
- `components/`: reusable UI.
- `features/`: domain-specific frontend logic.
- `services/`: API client functions.

Không đặt business logic lớn trực tiếp trong React page hoặc FastAPI route handler.
