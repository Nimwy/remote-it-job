# AI_CONTEXT.md — Instructions for AI Coding Agents

## 1. Project

Project name:

Remote IT Job Platform

Purpose:

Build a web platform focused on remote IT job recruitment.

The initial MVP must remain focused on the basic recruitment workflow.

---

## 2. Current Technology Direction

Frontend:

- React

Backend:

- Python
- FastAPI
- Pydantic
- SQLAlchemy 2.x
- Alembic

Database:

- PostgreSQL

Authentication:

- Google OAuth 2.0 / OpenID Connect

Infrastructure:

- Docker
- Docker Compose

Testing:

- Pytest
- Frontend testing tools selected during implementation

---

## 3. Read These Documents First

Before making architectural or security-sensitive changes, read:

1. `AI_CONTEXT.md`
2. `PROJECT_STATE.md`
3. `PROJECT_MAP.md`
4. `ARCHITECTURE.md`
5. `SECURITY.md`

For ordinary implementation work, inspect the relevant source files before editing them.

Do not assume the repository state from previous conversations.

The repository is the source of truth.

---

## 4. Core Architecture Rules

The backend follows:

```text
API
 ↓
Service
 ↓
Repository
 ↓
PostgreSQL
```

Do not put substantial business logic in API routers.

Do not put HTTP concerns in repositories.

Do not put raw database queries in frontend code.

The frontend communicates with the backend through the API layer.

---

## 5. MVP Scope

The initial MVP focuses on:

- Google authentication
- Candidate profiles
- Company profiles
- Employer/company membership
- Remote IT job creation
- Job listing
- Job search/filtering
- Job applications
- Application status tracking

Do not add advanced features unless explicitly requested.

---

## 6. Features Explicitly Deferred

Do not introduce these without an explicit requirement:

- AI job matching
- LLM features
- Recommendation engines
- Vector search
- Elasticsearch
- Redis
- Kafka
- Celery
- Microservices
- Kubernetes
- Real-time chat
- Advanced analytics
- Complex notification systems

A future feature may justify one of these technologies, but the current MVP does not.

---

## 7. Database Rules

- Use PostgreSQL.
- Use SQLAlchemy for application database access.
- Use Alembic for schema migrations.
- Do not modify production schema manually.
- Add appropriate indexes and constraints when justified.
- Preserve foreign-key relationships and data integrity.
- Avoid unnecessary denormalization in the MVP.

---

## 8. Authentication Rules

Authentication uses Google OAuth / OpenID Connect.

Never:

- Store Google passwords
- Hard-code OAuth secrets
- Commit OAuth secrets
- Invent custom cryptographic algorithms
- Disable authentication to make development easier

Application users must be represented by internal database records.

External OAuth identities should be separated from application authorization data.

---

## 9. Authorization Rules

Backend authorization is mandatory.

Never trust:

- Frontend role values
- Client-provided user IDs
- Client-provided company ownership
- Client-provided application ownership

Before modifying or exposing private data, determine ownership or explicit permission on the backend.

Frontend role checks are only for user interface behavior.

---

## 10. Personal Data Rules

Treat the following as private unless the architecture explicitly says otherwise:

- Email
- Candidate profile
- Resume
- Application history
- Cover letter
- Contact information

Do not return unnecessary private fields from APIs.

Do not expose resumes through public frontend directories.

---

## 11. Secrets

Never commit:

```text
.env
production credentials
OAuth secrets
database passwords
private keys
access tokens
refresh tokens
```

Use `.env.example` for documenting required configuration.

Never ask the user to paste a real production secret into source files.

---

## 12. File Upload Rules

For resumes and future user uploads:

- Validate file size
- Validate file type
- Generate safe storage keys
- Do not trust original filenames
- Store private files outside the public frontend directory
- Check authorization before serving private files

Do not implement public file URLs unless explicitly required.

---

## 13. Coding Rules

Prefer:

- Small focused modules
- Explicit names
- Type hints
- Clear error handling
- Reusable services
- Testable business logic
- Minimal dependencies

Avoid:

- Huge files
- Hidden global state
- Circular dependencies
- Duplicate business logic
- Premature abstractions
- Unnecessary frameworks

Do not refactor unrelated code while implementing a focused task.

---

## 14. Dependency Rules

Before adding a dependency:

1. Determine whether the standard library or existing dependency is sufficient.
2. Determine whether the dependency is actually required.
3. Check how it fits the existing architecture.
4. Add it only if justified.

Do not add infrastructure dependencies for hypothetical future requirements.

---

## 15. API Rules

API routes must be versioned:

```text
/api/v1/
```

Use appropriate HTTP methods and status codes.

Validate request data with Pydantic schemas.

Do not expose internal database models directly when an API schema is more appropriate.

Do not leak database errors or stack traces to clients.

---

## 16. Testing Rules

When implementing a feature:

1. Implement the feature.
2. Add or update relevant tests.
3. Run tests.
4. Fix failures caused by the change.
5. Review the final diff.

Authentication and authorization changes require dedicated tests.

Do not delete or weaken tests simply to make a feature pass.

---

## 17. Documentation Rules

When source structure changes:

- Update `PROJECT_MAP.md`.

When project status changes:

- Update `PROJECT_STATE.md`.

When a meaningful change is completed:

- Update `CHANGELOG.md`.

When architecture changes:

- Update `ARCHITECTURE.md`.
- Update `AI_CONTEXT.md` if the rule affects future AI work.

When security behavior changes:

- Update `SECURITY.md`.

Do not leave documentation describing an architecture that no longer exists.

---

## 18. Git Rules

Before making a commit:

```text
git status
git diff
```

Review changed files.

Do not commit:

- `.env`
- secrets
- generated build artifacts
- dependency caches
- uploaded user files

Use focused commit messages.

Examples:

```text
feat: add Google OAuth authentication
feat: add job creation API
feat: add candidate application flow
fix: prevent unauthorized job editing
docs: update architecture
test: add application authorization tests
```

---

## 19. AI Workflow

Before implementation:

```text
1. Read relevant documentation.
2. Inspect the existing source code.
3. Identify the smallest set of files that need changes.
4. Explain the implementation plan when the task is non-trivial.
```

During implementation:

```text
1. Make focused changes.
2. Preserve existing architecture.
3. Do not modify unrelated modules.
4. Run relevant tests.
```

After implementation:

```text
1. Review git diff.
2. Run tests.
3. Check for security regressions.
4. Update documentation when necessary.
5. Report what changed and any remaining issues.
```

---

## 20. Architecture Change Rule

An AI agent must not silently replace the project's architecture.

Examples of changes requiring explicit justification:

- Switching database
- Introducing Redis
- Introducing Elasticsearch
- Switching authentication strategy
- Introducing microservices
- Changing the API versioning strategy
- Moving to a different frontend framework

If a requested task cannot be completed cleanly within the current architecture, explain the problem before making a major architectural change.

---

## 21. Current Development Philosophy

The project prioritizes:

1. Correctness
2. Security
3. Maintainability
4. Simplicity
5. Testability
6. Feature completeness
7. Performance optimization

Do not optimize for theoretical scale before the MVP has a concrete need.

---

## 22. Important Instruction

Do not assume that a feature is required merely because it is common in large recruitment platforms.

Build what the current project requirements specify.

Do not turn the MVP into LinkedIn, Indeed, or a full enterprise ATS.

Keep the implementation understandable and maintainable for a small project.
