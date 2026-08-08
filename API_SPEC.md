# API Specification

## 1. General

Base prefix:

```text
/api/v1
```

JSON API unless endpoint explicitly uses OAuth redirect.

Authentication should normally use secure session cookies.

## 2. Public jobs

### GET /jobs

Search and filter public jobs.

Query parameters:

```text
q
category
tags
job_type
location
timezone
salary_min
salary_max
currency
page
page_size
sort
```

Only public jobs are returned.

Recommended sort:
- newest
- relevant when search query exists

Response should contain:
- items
- pagination metadata
- total or equivalent metadata if implemented

### GET /jobs/{job_id}

Return public job detail.

Must:
- Verify job is publicly visible.
- Increment view counter according to view policy.
- Return HR/company contact data required by the public page.

Do not expose private account fields.

## 3. Authentication

### POST /auth/register

Create HR account with email/password.

Input:
- name
- email
- password
- company_name

Result:
- account created with `pending` status.

### POST /auth/login

Email/password login.

Checks:
- account exists.
- password valid.
- account status allowed.

Creates authenticated session.

### GET /auth/google/start

Start Google OAuth flow.

### GET /auth/google/callback

Handle Google OAuth callback.

Must:
- Validate OAuth response.
- Identify Google subject.
- Resolve/link account safely.
- Create session.

### POST /auth/logout

Invalidate current session.

### GET /auth/me

Return current authenticated user summary.

Never return password hash or session token.

## 4. HR profile

### GET /hr/profile

Return current HR profile.

### PATCH /hr/profile

Update allowed HR profile fields.

### GET /hr/contacts

Return current HR contacts.

### PUT /hr/contacts/{channel}

Create/update one contact channel.

Allowed channels:
- zalo
- telegram
- linkedin
- phone
- email

### DELETE /hr/contacts/{channel}

Remove contact.

## 5. HR jobs

### GET /hr/jobs

Return current HR's jobs.

Filters:
- status
- search
- pagination

### POST /hr/jobs

Create draft job.

Requires:
- authenticated
- role = hr
- status = active

### GET /hr/jobs/{job_id}

Return own job.

### PATCH /hr/jobs/{job_id}

Update own job if allowed by lifecycle.

### DELETE /hr/jobs/{job_id}

Controlled removal of own job.

### POST /hr/jobs/{job_id}/submit

Move draft/rejected job to pending review.

### POST /hr/jobs/{job_id}/close

Close own approved job.

## 6. Admin HR

### GET /admin/hr

List HR accounts.

Filters:
- search
- status
- pagination

### POST /admin/hr/{user_id}/approve

Set pending HR to active.

### POST /admin/hr/{user_id}/block

Block HR.

### POST /admin/hr/{user_id}/unblock

Unblock HR.

### DELETE /admin/hr/{user_id}

Controlled deletion/deactivation according to data-retention policy.

## 7. Admin jobs

### GET /admin/jobs

List all jobs.

Filters:
- status
- search
- HR
- category
- pagination

### POST /admin/jobs/{job_id}/approve

Move pending job to approved.

### POST /admin/jobs/{job_id}/reject

Move pending job to rejected.

### POST /admin/jobs/{job_id}/hide

Hide job.

### POST /admin/jobs/{job_id}/unhide

Unhide according to valid lifecycle rules.

### DELETE /admin/jobs/{job_id}

Remove job according to deletion policy.

## 8. Categories/tags

### GET /categories

Public list of categories.

### GET /tags

Public list of tags.

Admin management endpoints can be added when catalog management is implemented.

## 9. Pagination

Backend owns pagination.

Preferred query:

```text
?page=1&page_size=20
```

Constraints:
- enforce maximum page size.
- reject or normalize invalid values.
- do not fetch unlimited rows.

Example response:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0,
  "total_pages": 0
}
```

Exact response shape can be refined during implementation but must remain consistent across endpoints.

## 10. Error format

Use consistent JSON error responses.

Example:

```json
{
  "detail": "Human-readable message"
}
```

Validation errors should follow FastAPI's established validation format unless a project-wide error envelope is deliberately adopted.

## 11. Authorization

Protected endpoints must derive identity from the authenticated session.

Never accept:
- `user_id`
- `hr_id`
- `role`
- `is_admin`

from the client as authority.

## 12. API design rules

- Keep routes thin.
- Put business rules in services.
- Use schemas for validation and serialization.
- Use transactions for multi-step mutations.
- Avoid returning database models directly when it leaks fields.
- Do not expose internal exception details in production.
