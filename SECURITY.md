# Remote IT Job Platform — Security

## 1. Purpose

This document defines the security rules for the Remote IT Job Platform.

The application handles personal and recruitment-related information. Security is therefore part of the initial architecture, not a later feature.

---

## 2. Security Principles

1. Authentication and authorization are separate concerns.
2. The backend is the security boundary.
3. Never trust client-provided roles or permissions.
4. Collect only information required by the application.
5. Never store passwords belonging to external OAuth providers.
6. Secrets must never be committed to Git.
7. Private files must not be publicly accessible by default.
8. Validate all untrusted input.
9. Avoid leaking sensitive information through errors or logs.
10. Security-sensitive changes require tests.

---

## 3. Google Authentication

The application uses Google OAuth 2.0 / OpenID Connect.

The application must:

- Redirect users through Google's authorization flow.
- Validate the authentication result according to the chosen OAuth/OIDC library.
- Associate the external Google identity with an internal application user.
- Store only the identity information required by the application.
- Never request or store a Google account password.

Sensitive OAuth configuration must be supplied through environment variables.

Examples:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

These values must never be committed to Git.

---

## 4. Session / Token Security

The implementation must use a well-established authentication mechanism supported by the selected FastAPI authentication libraries.

General requirements:

- Do not put long-lived secrets in frontend source code.
- Do not expose access tokens through logs.
- Use secure cookie attributes if cookies are used.
- Use appropriate expiration for application sessions/tokens.
- Validate authentication on every protected backend operation.

The exact session strategy should be finalized during authentication implementation.

---

## 5. Authorization

Every protected resource must verify that the authenticated user is allowed to access it.

Examples:

```text
Candidate A
    |
    +-- can edit Candidate A profile
    +-- cannot edit Candidate B profile

Employer A
    |
    +-- can edit jobs belonging to authorized companies
    +-- cannot edit Employer B's jobs
```

Frontend checks such as:

```text
if user.role === "employer"
```

are only UI behavior.

They are never a substitute for backend authorization.

---

## 6. Personal Data

Potentially sensitive application data includes:

- Email address
- Candidate profile
- Resume
- Application history
- Cover letters
- Contact information
- Company/recruiter information

Access to this information must follow the application's authorization rules.

Do not expose complete user objects through generic API responses if the client does not need all fields.

---

## 7. Resume and File Upload Security

Resume files must not be publicly accessible by default.

The upload process should include:

- File size limits
- File type validation
- MIME/type verification where practical
- Safe generated storage names/keys
- Storage outside the frontend public directory
- Authorization checks before download

Never use an uploaded filename directly as a trusted storage path.

Do not allow a user-controlled path to determine where a file is written.

---

## 8. Input Validation

All client input is untrusted.

Validate:

- Request bodies
- Query parameters
- Path parameters
- Uploaded files
- Search/filter parameters

Pydantic schemas should define API contracts.

Database constraints should provide an additional layer of integrity.

---

## 9. SQL Injection

Database access must use SQLAlchemy parameterized operations.

Do not construct SQL queries by concatenating untrusted user input.

Avoid raw SQL unless there is a concrete requirement and the query is safely parameterized.

---

## 10. XSS and Content Handling

User-generated content such as:

- Job descriptions
- Candidate biographies
- Cover letters
- Company descriptions

must be treated as untrusted content.

The frontend must not render arbitrary user content as executable HTML unless there is an explicit, reviewed sanitization strategy.

---

## 11. CSRF

The authentication/session design must consider CSRF protection when browser cookies are used.

If authentication uses cookies, appropriate:

- SameSite settings
- Secure settings
- CSRF protection where required

must be implemented.

The final strategy must be documented when authentication is implemented.

---

## 12. CORS

CORS must not use unrestricted origins in production.

Development may use explicitly configured local origins.

Example concept:

```text
Development:
http://localhost:<frontend-port>

Production:
https://<production-domain>
```

Never use a wildcard origin for authenticated production APIs unless the security model explicitly supports it.

---

## 13. Rate Limiting

The MVP should identify endpoints that may require rate limiting, especially:

- Authentication endpoints
- OAuth initiation/callback endpoints
- Job application endpoints
- File upload endpoints

A rate-limiting dependency or infrastructure component should only be introduced when needed.

Do not add Redis solely because rate limiting may be useful in the future.

---

## 14. Secrets

Secrets must be supplied through environment variables or a production secret-management mechanism.

Examples:

```text
DATABASE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
JWT_SECRET
```

The repository may contain:

```text
.env.example
```

but must not contain:

```text
.env
```

or real credentials.

Never paste production credentials into source code, documentation, Git commits, or AI prompts.

---

## 15. Logging

Logs must not contain:

- Passwords
- OAuth client secrets
- Access tokens
- Refresh tokens
- Session secrets
- Full private resume contents
- Unnecessary personal data

Errors returned to users should not expose stack traces, SQL statements, filesystem paths, or secrets in production.

---

## 16. Database Security

The application database user should have only the permissions required by the application.

Production database credentials must not be committed to Git.

Backups should be considered before production launch.

---

## 17. Dependency Security

Dependencies should be:

- Explicitly declared
- Kept reasonably current
- Reviewed before introducing new packages

Do not install a package simply because an AI coding agent suggests it.

Prefer established libraries for authentication, cryptography, and security-sensitive functionality.

Never implement cryptography manually when a standard library or established package exists.

---

## 18. AI Coding Security Rules

AI coding agents must not:

- Read or expose production secrets
- Commit `.env` files
- Invent authentication cryptography
- Disable authentication checks to make tests pass
- Remove authorization checks to fix UI/API errors
- Make private files public for convenience
- Log sensitive credentials
- Introduce insecure shortcuts without documenting them

Security-sensitive changes must be reviewed before being considered complete.

---

## 19. Security Review Checklist

Before an MVP release:

- [ ] Google OAuth flow reviewed
- [ ] Authorization checks implemented for protected resources
- [ ] Secrets excluded from Git
- [ ] CORS configured for production
- [ ] File uploads restricted
- [ ] Private resumes protected
- [ ] Input validation implemented
- [ ] Error responses reviewed
- [ ] Sensitive logging reviewed
- [ ] Authentication tests exist
- [ ] Authorization tests exist
- [ ] Dependency vulnerabilities reviewed
