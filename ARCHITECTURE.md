# Remote IT Job Platform — Architecture

## 1. Purpose

Remote IT Job Platform is a web application for connecting candidates with companies offering remote IT jobs.

The initial version focuses on a reliable recruitment workflow:

- Candidate registration and profile management
- Employer/company management
- Remote IT job posting
- Job search and filtering
- Job applications
- Application status tracking
- Google-based authentication

This document defines the technical architecture for the initial MVP.

---

## 2. Architecture Principles

1. Keep the MVP as a modular monolith.
2. Prefer simple, explicit architecture over premature scalability.
3. Keep frontend, business logic, and database access separated.
4. Keep authentication and authorization separate.
5. Backend is the source of truth for permissions.
6. Database schema changes must use Alembic migrations.
7. Secrets must come from environment variables.
8. New infrastructure or dependencies require a concrete need.
9. Avoid microservices, message brokers, vector databases, and search infrastructure in the MVP.
10. Preserve backward compatibility where practical.

---

## 3. High-Level Architecture

```text
                        Browser
                           |
                           | HTTPS / REST / JSON
                           v
                    +--------------+
                    |    React     |
                    |   Frontend   |
                    +------+-------+
                           |
                           v
                    +--------------+
                    |   FastAPI    |
                    |   API Layer  |
                    +------+-------+
                           |
                    +------+-------+
                    |   Services   |
                    | Business Logic|
                    +------+-------+
                           |
                    +------+-------+
                    | Repositories |
                    |  DB Access   |
                    +------+-------+
                           |
                           v
                    +--------------+
                    | PostgreSQL   |
                    +--------------+

Google OAuth / OpenID Connect
           |
           v
      Authentication
           |
           v
        FastAPI
```

---

## 4. Technology Stack

### Frontend

- React
- React Router
- Axios or an equivalent HTTP client
- JavaScript or TypeScript, depending on the implementation decision made during project initialization

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy 2.x
- Alembic
- Pytest

### Database

- PostgreSQL

### Authentication

- Google OAuth 2.0 / OpenID Connect
- Application-managed user and authorization records

### Infrastructure

- Docker
- Docker Compose for local development
- Git / GitHub

No additional infrastructure is required for the initial MVP.

---

## 5. Repository Structure

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

The exact internal structure may evolve during implementation, but architectural responsibilities must remain separated.

---

## 6. Backend Architecture

The backend uses four main layers.

```text
API / Router
     |
     v
Service
     |
     v
Repository
     |
     v
PostgreSQL
```

### 6.1 API Layer

Responsibilities:

- HTTP routing
- Request parsing
- Response serialization
- Authentication dependencies
- Basic request/response validation
- HTTP status codes

The API layer must not contain substantial business logic or raw database queries.

API routes are versioned:

```text
/api/v1/
```

### 6.2 Service Layer

Responsibilities:

- Business rules
- Permission decisions
- Workflow handling
- Coordination between repositories
- Application-specific logic

Example:

```text
Create Job
    |
    +-- verify authenticated user
    +-- verify company membership
    +-- validate job data
    +-- create job
```

### 6.3 Repository Layer

Responsibilities:

- Database queries
- SQLAlchemy operations
- Persistence-related logic

Repositories should not decide application permissions or HTTP responses.

### 6.4 Models

SQLAlchemy models represent persistent database entities.

### 6.5 Schemas

Pydantic schemas represent API input and output contracts.

Request and response schemas should be separated where their requirements differ.

---

## 7. Initial Backend Structure

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

The exact module names may change if implementation requires it, but the separation of responsibilities should remain.

---

## 8. Frontend Architecture

The frontend is responsible for:

- Rendering pages
- User interaction
- Client-side state
- Calling backend APIs
- Form handling
- Displaying validation and server errors
- Route protection for user experience

The frontend must not be treated as a security boundary.

A conceptual structure:

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

API communication should be centralized through service/API modules rather than scattered throughout components.

---

## 9. Authentication Architecture

The application uses Google OAuth / OpenID Connect for sign-in.

Conceptually:

```text
Browser
   |
   | Login with Google
   v
Google
   |
   | Identity / authorization result
   v
FastAPI
   |
   +-- Find existing OAuth account
   |
   +-- Create or load application user
   |
   +-- Establish application session
   v
Authenticated Application
```

The application does not store Google passwords.

Google identity is linked to an internal `users` record through an OAuth account record.

---

## 10. Authorization Architecture

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to do?

The backend must enforce authorization independently of frontend UI checks.

Initial roles:

```text
candidate
employer
admin
```

Examples:

- Candidate can manage their own candidate profile.
- Candidate can apply to jobs.
- Employer can manage companies they belong to.
- Employer can create and manage authorized company jobs.
- Employer can review applications submitted to their jobs.
- Admin capabilities are reserved for moderation/administration and should not be implemented beyond actual MVP requirements.

---

## 11. Initial Domain Model

Core entities:

```text
User
CandidateProfile
Company
CompanyMember
Job
Application
OAuthAccount
```

Conceptual relationships:

```text
User 1 -------- 1 CandidateProfile

User N -------- N Company
       via CompanyMember

Company 1 ----- N Job

Candidate 1 --- N Application

Job 1 --------- N Application

User 1 -------- N OAuthAccount
```

---

## 12. Initial Database Tables

### users

```text
id
email
role
is_active
created_at
updated_at
```

### oauth_accounts

```text
id
user_id
provider
provider_user_id
created_at
```

### candidate_profiles

```text
id
user_id
full_name
headline
bio
location
avatar_url
resume_storage_key
created_at
updated_at
```

### companies

```text
id
name
description
website
logo_url
location
created_at
updated_at
```

### company_members

```text
id
company_id
user_id
role
created_at
```

### jobs

```text
id
company_id
title
description
employment_type
remote_type
location
salary_min
salary_max
currency
status
created_at
updated_at
expires_at
```

### applications

```text
id
job_id
candidate_id
resume_storage_key
cover_letter
status
created_at
updated_at
```

The final schema may add indexes, constraints, timestamps, or supporting fields during implementation.

---

## 13. API Design

Initial API namespace:

```text
/api/v1/
```

Authentication:

```text
GET  /auth/me
GET  /auth/google
GET  /auth/google/callback
POST /auth/logout
```

Jobs:

```text
GET    /jobs
GET    /jobs/{job_id}
POST   /jobs
PATCH  /jobs/{job_id}
DELETE /jobs/{job_id}
```

Applications:

```text
POST  /jobs/{job_id}/applications
GET   /applications
GET   /applications/{application_id}
PATCH /applications/{application_id}
```

Profile:

```text
GET   /profile
PATCH /profile
```

Companies:

```text
POST  /companies
GET   /companies/{company_id}
PATCH /companies/{company_id}
```

The exact endpoint contract should be finalized when each module is implemented.

---

## 14. File Storage

User-uploaded files such as resumes should not be stored in the frontend public directory.

The database stores metadata or a storage key.

Conceptually:

```text
Candidate
    |
    v
FastAPI
    |
    +-- validate upload
    +-- authorize
    +-- store file
    |
    v
Private File Storage

PostgreSQL
    |
    +-- resume_storage_key
```

The MVP may use a simple local/private storage implementation for development, but the storage interface should avoid coupling the rest of the application to one storage provider.

---

## 15. Database Migrations

All schema changes must use Alembic.

Do not make undocumented manual schema changes in the development database and assume they are part of the project.

Expected workflow:

```text
Change SQLAlchemy model
        |
        v
Create Alembic migration
        |
        v
Review migration
        |
        v
Apply migration
```

---

## 16. Deployment Direction

The MVP should be deployable as a small set of services:

```text
Frontend
Backend
PostgreSQL
```

Docker Compose is sufficient for local development.

Production deployment details should be decided later based on the selected hosting provider.

---

## 17. Explicitly Out of Scope for MVP

The following are intentionally not part of the initial architecture:

- Microservices
- Kubernetes
- Kafka
- Celery
- Redis
- Elasticsearch
- Vector database
- LLM-based matching
- AI recommendation system
- Advanced analytics pipeline
- Real-time chat
- Complex notification infrastructure

These may be considered later only when there is a concrete product or technical requirement.
