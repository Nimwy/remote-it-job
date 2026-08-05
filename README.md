# Remote IT Job Platform

A web platform for remote IT job recruitment.

The project is currently in the architecture and foundation stage.

---

## Project Goal

The initial goal is to provide a focused recruitment platform for remote IT positions.

The MVP will support two main user groups:

### Candidates

- Sign in with Google
- Create and manage a candidate profile
- Search remote IT jobs
- Filter jobs
- View job details
- Apply for jobs
- Track application status

### Employers

- Sign in with Google
- Create/manage a company profile
- Manage company members
- Create remote IT job postings
- Edit and close job postings
- View applications for their jobs
- Update application status

---

## Technology Stack

### Frontend

- React

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy

### Database

- PostgreSQL
- Alembic

### Authentication

- Google OAuth 2.0 / OpenID Connect

### Infrastructure

- Docker
- Docker Compose

---

## Architecture

```text
React
   |
   | REST / JSON
   v
FastAPI
   |
   +-- API Layer
   |
   +-- Service Layer
   |
   +-- Repository Layer
   |
   v
PostgreSQL
```

See:

- `ARCHITECTURE.md`
- `SECURITY.md`

---

## Repository Documentation

### AI_CONTEXT.md

Instructions and development rules for AI coding agents.

### ARCHITECTURE.md

Technical architecture and design decisions.

### SECURITY.md

Security and privacy requirements.

### PROJECT_MAP.md

Repository structure and responsibilities.

### PROJECT_STATE.md

Current implementation status.

### CHANGELOG.md

Project history.

---

## Development

The project is intended to be developed primarily inside WSL2.

Expected development environment:

```text
Windows
  |
  +-- WSL2 / Ubuntu
        |
        +-- Git
        +-- Python
        +-- Node.js
        +-- Docker
        +-- OpenCode
```

The repository should remain inside the WSL2 Linux filesystem when practical.

Example:

```text
~/projects/remote-it-job
```

---

## Environment Variables

Copy the example configuration:

```bash
cp .env.example .env
```

Never commit `.env`.

Required environment variables will be documented as implementation progresses.

---

## Git Workflow

Before committing:

```bash
git status
git diff
```

Then:

```bash
git add .
git commit -m "type: description"
git push
```

Use focused commits.

Examples:

```text
feat: add Google OAuth authentication
feat: add job creation API
fix: prevent unauthorized job editing
test: add application authorization tests
docs: update architecture
```

---

## MVP Scope

The project intentionally starts as a modular monolith.

The following are not part of the initial MVP:

- AI job matching
- LLM features
- Recommendation systems
- Vector databases
- Elasticsearch
- Redis
- Kafka
- Microservices
- Kubernetes
- Real-time chat
- Advanced analytics

These may be considered later when there is a concrete requirement.

---

## Security

The application handles personal and recruitment-related information.

Security requirements are defined from the beginning.

Important rules include:

- Google passwords are never stored.
- Backend authorization is mandatory.
- Secrets are never committed to Git.
- Private resumes must not be publicly accessible.
- User input must be validated.
- Sensitive credentials must not be logged.

See `SECURITY.md`.

---

## Current Status

The repository currently contains the initial project documentation and architecture.

No application implementation has been completed yet.

See `PROJECT_STATE.md` for the current state.
