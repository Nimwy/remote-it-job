# PROJECT_STATE.md — Current Project State

## Last Updated

2026-08-04

---

## Current Phase

Phase 0 — Project Foundation and Architecture

---

## Repository Status

- [x] WSL2 project directory created
- [x] Git repository initialized
- [x] GitHub remote configured
- [x] Initial documentation files created
- [x] Initial documentation pushed to GitHub

---

## Documentation Status

- [x] `AI_CONTEXT.md` — initial version
- [x] `ARCHITECTURE.md` — initial version
- [x] `SECURITY.md` — initial version
- [x] `PROJECT_MAP.md` — initial version
- [x] `PROJECT_STATE.md` — initial version
- [x] `CHANGELOG.md` — initial version
- [x] `README.md` — initial version

---

## Implementation Status

### Frontend

- [ ] React project initialized
- [ ] Routing
- [ ] API client
- [ ] Authentication UI
- [ ] Candidate pages
- [ ] Employer pages
- [ ] Job pages
- [ ] Application pages

### Backend

- [ ] FastAPI project initialized
- [ ] Configuration
- [ ] PostgreSQL connection
- [ ] SQLAlchemy setup
- [ ] Alembic setup
- [ ] API v1 structure
- [ ] Google OAuth
- [ ] Authorization
- [ ] Candidate profile
- [ ] Company
- [ ] Job
- [ ] Application

### Database

- [ ] Initial schema
- [ ] Initial migration
- [ ] Indexes and constraints review

### Testing

- [ ] Backend test setup
- [ ] Authentication tests
- [ ] Authorization tests
- [ ] Job tests
- [ ] Application tests
- [ ] Frontend test setup

### Infrastructure

- [ ] Docker configuration
- [ ] Docker Compose development environment
- [ ] Production deployment configuration

---

## Current Architecture

```text
React
  |
  | REST / JSON
  v
FastAPI
  |
  v
Service Layer
  |
  v
Repository Layer
  |
  v
PostgreSQL
```

Authentication:

```text
Google OAuth / OpenID Connect
        |
        v
FastAPI
        |
        v
Internal User
```

---

## Current Security Direction

The application will treat candidate profiles, resumes, applications, and contact information as protected data.

Backend authorization is mandatory.

Resume files must not be publicly accessible by default.

Secrets must be stored outside source control.

See `SECURITY.md` for the current security rules.

---

## Current Next Steps

1. Review and approve architecture documentation.
2. Initialize backend project.
3. Initialize frontend project.
4. Configure PostgreSQL.
5. Configure SQLAlchemy and Alembic.
6. Implement Google authentication.
7. Implement authorization foundation.
8. Implement candidate profile.
9. Implement company management.
10. Implement job management.
11. Implement applications.
12. Add tests and security review.

---

## Known Issues

None at the documentation stage.

---

## Important Note

This file describes the actual current state.

Do not mark a task as completed until the implementation exists and has been checked.
