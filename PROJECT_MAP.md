# PROJECT_MAP.md — Project Structure

## 1. Purpose

This file is a map of the repository.

It describes where responsibilities belong rather than documenting every implementation detail.

Update this file when the source structure changes significantly.

---

## 2. Current Repository

```text
remote-it-job/
├── frontend/
├── backend/
├── docs/
├── AI_CONTEXT.md
├── ARCHITECTURE.md
├── SECURITY.md
├── PROJECT_MAP.md
├── PROJECT_STATE.md
├── CHANGELOG.md
├── README.md
├── .env.example
├── .gitignore
└── docker-compose.yml
```

At the initial documentation stage, `frontend/`, `backend/`, and `docs/` may not contain implementation files yet.

---

## 3. Frontend

Expected structure:

```text
frontend/
└── src/
    ├── assets/
    ├── components/
    ├── pages/
    ├── services/
    ├── hooks/
    ├── context/
    ├── routes/
    ├── utils/
    ├── App.*
    └── main.*
```

### components/

Reusable UI components.

### pages/

Page-level components corresponding to application routes.

Expected pages include:

```text
Home
Jobs
JobDetail
Login
Profile
Applications
Company
EmployerDashboard
```

The exact page structure may evolve.

### services/

Frontend API communication.

Examples:

```text
api
auth
jobs
applications
companies
profile
```

### context/

Application-wide React state where appropriate.

Authentication state may live here if this remains suitable for the chosen frontend architecture.

### routes/

Frontend route definitions and route protection for user experience.

### utils/

Small reusable frontend utilities.

---

## 4. Backend

Expected structure:

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   ├── db/
│   ├── api/
│   │   └── v1/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── repositories/
├── tests/
├── alembic/
├── alembic.ini
├── requirements.txt
└── Dockerfile
```

### app/main.py

FastAPI application entry point.

### app/core/

Cross-cutting configuration and security functionality.

Potential modules:

```text
config
security
dependencies
```

### app/db/

Database engine, session configuration, and SQLAlchemy base configuration.

### app/api/

HTTP API routers.

### app/api/v1/

Version 1 endpoints.

Expected modules:

```text
auth
users
profile
companies
jobs
applications
```

### app/models/

SQLAlchemy database models.

Expected domain models:

```text
User
OAuthAccount
CandidateProfile
Company
CompanyMember
Job
Application
```

### app/schemas/

Pydantic request/response schemas.

### app/services/

Business logic.

Expected services:

```text
auth
user
profile
company
job
application
```

### app/repositories/

Database access and persistence operations.

Expected repositories:

```text
user
oauth_account
profile
company
job
application
```

---

## 5. Tests

```text
backend/tests/
```

Tests should be organized around application behavior.

Potential areas:

```text
auth
users
profiles
companies
jobs
applications
authorization
```

The exact test structure may evolve.

---

## 6. Database Migrations

```text
backend/alembic/
```

All database schema changes must be represented through Alembic migrations.

---

## 7. Documentation

Root-level documentation:

```text
AI_CONTEXT.md
ARCHITECTURE.md
SECURITY.md
PROJECT_MAP.md
PROJECT_STATE.md
CHANGELOG.md
README.md
```

### AI_CONTEXT.md

Rules for AI coding agents.

### ARCHITECTURE.md

Technical architecture and design decisions.

### SECURITY.md

Security and privacy requirements.

### PROJECT_MAP.md

Repository structure.

### PROJECT_STATE.md

Current implementation status.

### CHANGELOG.md

Project history.

### README.md

Human-facing project overview and setup instructions.

---

## 8. Update Rule

When adding or moving important modules:

1. Update the relevant section of this file.
2. Keep descriptions short.
3. Do not duplicate implementation details from source code.
4. Do not document files that do not exist merely because they may exist in the future.
