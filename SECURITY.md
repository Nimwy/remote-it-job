# Security Policy

## 1. Mục tiêu

Bảo vệ:
- Account HR/Admin.
- Email và identity data.
- Password.
- OAuth credentials.
- Session.
- Contact information.
- Job management actions.

Project không lưu CV/application của job seeker ở MVP.

## 2. Password

- Không bao giờ lưu plaintext password.
- Dùng password hashing hiện đại, ưu tiên Argon2id.
- Không log password.
- Không trả password hash về frontend.
- Login error không tiết lộ account nào tồn tại nếu không cần.

## 3. Google OAuth

- Dùng OAuth/OpenID Connect flow chuẩn.
- Validate state để chống CSRF.
- Validate issuer, audience, signature/claims theo flow sử dụng.
- Không tin email từ client.
- Dùng Google `sub` làm identity identifier.
- Không tự tạo account thứ hai nếu Google email đã liên kết với account hiện có mà việc liên kết có thể được xác thực an toàn.
- Không lưu Google access token nếu application không cần gọi Google API sau authentication.

## 4. Sessions

Ưu tiên cookie-based server-side session:
- Cookie `HttpOnly`.
- `Secure` trong production.
- `SameSite` phù hợp.
- Session expiration.
- Session rotation sau authentication.
- Logout phải invalidate session.
- Không lưu session secret/token nhạy cảm trong localStorage.

CSRF protection phải được thiết kế phù hợp nếu dùng cookie authentication cho state-changing requests.

## 5. Authorization

Backend phải kiểm tra:
- identity
- role
- status
- ownership

Ví dụ:
`PUT /jobs/123` không được chỉ dựa vào frontend gửi `hr_id`.

Backend phải xác định owner từ authenticated session.

## 6. HR approval

Google/email authentication chỉ chứng minh identity.

Không đồng nghĩa account được phép đăng job.

```text
authenticated + pending
=> login có thể thành công
=> HR management actions bị từ chối
```

## 7. Admin security

- Không có public admin registration.
- Admin account phải được tạo bằng controlled process.
- Admin endpoints phải kiểm tra role server-side.
- Không để frontend tự xác định user là admin.

## 8. Input validation

Validate ở backend:
- Email.
- URL/contact fields.
- Salary.
- Job type.
- Category/tag IDs.
- Text length.
- Expiration.
- Status transitions.

Không trust:
- hidden form fields.
- client-side validation.
- query parameters.
- JSON fields từ frontend.

## 9. XSS

Job description và requirements là dữ liệu do HR nhập.

Nếu hỗ trợ rich text/HTML:
- sanitize HTML ở backend.
- whitelist tags/attributes.

Nếu MVP dùng plain text/Markdown giới hạn:
- ưu tiên render an toàn.
- Không dùng `dangerouslySetInnerHTML` nếu không cần.

## 10. SQL Injection

Không xây SQL bằng string concatenation từ input.

Dùng SQLAlchemy parameterized queries.

## 11. Rate limiting

Có thể áp dụng cho:
- Login.
- OAuth initiation/callback.
- Password reset nếu có.
- Public endpoints dễ bị abuse.

Không cần triển khai hệ thống rate-limit phức tạp trước khi có nhu cầu, nhưng kiến trúc phải cho phép bổ sung.

## 12. Personal data

Dữ liệu nhạy cảm ở phạm vi project:
- Email.
- Phone.
- Zalo.
- Telegram.
- LinkedIn.
- Google identity.

Chỉ hiển thị contact của HR trên public job detail theo đúng business requirement.

Không log contact/password/token vào application logs.

## 13. Dependencies

Mọi dependency mới phải:
- Có license rõ ràng.
- Không có điều khoản buộc trả phí cho use case hiện tại.
- Không gửi dữ liệu người dùng đến third party nếu không cần.

## 14. Secrets

Không commit:
- Google OAuth client secret.
- Session secret.
- Database password.
- API keys.
- Production credentials.

Dùng environment variables/secrets management.

`.env` phải nằm trong `.gitignore`.

## 15. Cost/license

Không sử dụng font, package, API hoặc SaaS có license thương mại/usage fee nếu chưa được phê duyệt.

Font hiện tại của Stitch:
- Geist
- Inter

Phải giữ license/copyright notice phù hợp nếu bundle font vào project.
