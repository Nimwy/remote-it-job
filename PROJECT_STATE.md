# Project State

## Current status

**Phase: Architecture and documentation**

Chưa bắt đầu production implementation.

## Completed

- [x] Xác định mục tiêu sản phẩm.
- [x] Xác định 3 loại context: Job seeker, HR, Admin.
- [x] Quyết định Job seeker không cần login.
- [x] Quyết định không có CV/application system.
- [x] Chốt React + TypeScript.
- [x] Chốt FastAPI + Python.
- [x] Chốt PostgreSQL.
- [x] Chốt Email/Password authentication.
- [x] Chốt Google OAuth.
- [x] Chốt HR approval.
- [x] Chốt category/tag controlled by system.
- [x] Chốt contact thuộc HR.
- [x] Có thiết kế UI từ Google Stitch.
- [x] Chốt nguyên tắc không tự ý thêm chi phí.

## Documentation status

- [x] README
- [x] AI_CONTEXT
- [x] ARCHITECTURE
- [x] DATABASE_SCHEMA
- [x] SECURITY
- [x] PROJECT_MAP
- [x] PROJECT_STATE
- [x] CHANGELOG
- [x] API_SPEC

## Current decisions

### Authentication

Methods:
- Email/password.
- Google OAuth.

One user account may have both methods linked.

### User approval

```text
new HR
  -> pending
  -> admin approval
  -> active
```

Blocked HR remains in database.

### Job

```text
draft
 -> pending
 -> approved
 -> closed / expired / hidden
```

Rejected jobs can be edited and resubmitted.

### Contact

Stored in `user_contacts`.

### Search

PostgreSQL-based MVP search with backend pagination.

### Views

Simple integer counter in `jobs.views`.

### UI

Google Stitch design is the visual reference.

The Stitch prototype is not the source of truth for business logic.

### Deployment

Domain and hosting are handled separately and are outside the current development scope.

## Next phase

1. Review Stitch output and map pages/components.
2. Finalize API specification.
3. Initialize frontend/backend projects.
4. Create database models.
5. Create Alembic migrations.
6. Implement authentication.
7. Implement HR approval.
8. Implement job CRUD and moderation.
9. Implement public search/filter/pagination.
10. Connect React to API.
11. Add tests.
12. Security review.

## Known future decisions

These are intentionally not locked yet:
- Exact frontend state management library.
- Exact session library/implementation package.
- Rich text editor vs plain text.
- Exact search ranking.
- Production deployment configuration.
- Email verification/password reset implementation details.
