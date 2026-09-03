# Security — Remote IT Job

## 1. Nguyên tắc bảo mật

- Backend là nguồn xác thực cuối cùng cho authentication và authorization.
- Không tin frontend checks.
- Không lưu plaintext password.
- Không tiết lộ session secrets.
- Giảm thiểu dữ liệu cá nhân được lưu trữ.
- Không log password, OAuth token hoặc session token.

## 2. Password

Sử dụng Argon2id để hash password.

Không:
- lưu plaintext password
- log password
- trả password hash qua API
- so sánh password thủ công bằng custom hashing không an toàn

Yêu cầu password phải hợp lý và được ghi nhận trong validation schemas.

## 3. Session

Xác thực bằng **access token (JWT, 15 phút)** + **refresh token (opaque, lưu hash SHA-256 trong `sessions`)** qua cookie HTTP-only.

Cookie phải:
- HttpOnly
- Secure trong production
- SameSite được cấu hình phù hợp
- giới hạn trong domain/path ứng dụng

Khi logout:
- hủy bản ghi refresh token phía server
- xóa cookie trình duyệt

Phiên phải có thời hạn; refresh token xoay vòng khi dùng và có thể thu hồi (điều này cho phép nhiều phiên/thiết bị cùng lúc).

**Ghi chú (S-04):** tài liệu API tự sinh (Swagger `/docs`, OpenAPI `/openapi.json`, ReDoc `/redoc`) **bị tắt ở production** (`ENV=production`) để không lộ đặc tả API/credential public.

## 4. Authorization

Backend kiểm tra:
1. authentication
2. trạng thái tài khoản
3. role
4. quyền sở hữu tài nguyên

Ví dụ:
- pending HR không được đăng/submit job.
- blocked HR không được sử dụng chức năng HR.
- HR không được sửa job của HR khác.
- chỉ Admin được duyệt/từ chối job.
- chỉ Admin được khóa/mở khóa HR.

## 5. Google OAuth

Sử dụng OAuth authorization code flow qua backend implementation tin cậy.

Validate:
- OAuth state
- callback
- dữ liệu issuer/provider
- intended client/application
- thông tin Google identity

Không chấp nhận Google email do browser gửi trực tiếp làm bằng chứng danh tính.

Google authentication không bypass HR approval.

## 6. CSRF

Vì authentication sử dụng cookie, các request thay đổi trạng thái cần CSRF protection phù hợp với kiến trúc đã chọn.

Tối thiểu:
- sử dụng SameSite policy phù hợp
- triển khai CSRF token protection cho unsafe cross-site requests khi cần
- xác minh Origin/Referer khi thích hợp trong production

Không coi CORS là CSRF protection.

## 7. CORS

Development có thể cho phép origin local frontend đã cấu hình.

Production phải dùng allowlist tường minh các origin frontend đáng tin cậy.

Không dùng wildcard origin cùng với credentialed cookies.

## 8. Input validation

Validate tất cả input với Pydantic/backend rules.

Validate:
- độ dài
- enum values
- phạm vi số
- quan hệ salary
- định dạng URL/contact khi áp dụng
- IDs và quyền sở hữu

Không xây SQL query bằng string concatenation.

Phải dùng SQLAlchemy parameterization.

## 9. XSS

Job description và requirements là nội dung do người dùng tạo.

Nếu sau này hỗ trợ rich HTML, phải sanitize bằng sanitizer đã được đánh giá.

Trong MVP, ưu tiên plain text hoặc markdown giới hạn có chủ đích.

Không render trực tiếp HTML tùy ý của người dùng.

## 10. Security headers

Production nên cấu hình các header phù hợp, bao gồm:
- Strict-Transport-Security (HSTS)
- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- frame protection qua CSP `frame-ancestors` và/hoặc cơ chế tương đương

Không sao chép mù quáng CSP mà không kiểm tra frontend assets thực tế.

## 11. Rate limiting

MVP nên bảo vệ các endpoint nhạy cảm khỏi abuse, đặc biệt:
- login
- registration
- Google OAuth initiation/callback
- password changes
- admin authentication
- public job detail/view counting

Một chiến lược đơn giản ở application/proxy level là đủ ban đầu.

Không thêm Redis chỉ để rate limiting trừ khi quy mô yêu cầu.

## 12. Dữ liệu cá nhân

Thông tin có thể là dữ liệu cá nhân:
- tên HR
- email
- phone
- Zalo
- Telegram
- LinkedIn
- avatar

Chỉ tiết lộ thông tin liên hệ được HR cố ý công khai.

Không tiết lộ các trường nội bộ như:
- password_hash
- google_id khi không cần thiết
- session data
- admin/security metadata

## 13. Khóa HR

Khóa HR không phải là hard delete.

Khi HR bị khóa:
- từ chối thao tác HR
- ngăn job của họ xuất hiện công khai
- giữ lại bản ghi cần thiết phục vụ kiểm duyệt

## 14. Secrets

Không commit:
- Google OAuth client secret
- database password
- application secret key
- session secrets
- production credentials

Sử dụng environment variables/secrets management.

Cung cấp `.env.example` không có credentials thật.

## 15. Logging

Log các sự kiện vận hành hữu ích nhưng không chứa secrets.

Không log:
- password
- raw session token
- OAuth authorization code
- dữ liệu cá nhân nhạy cảm không cần thiết

Sử dụng Python standard library `logging` cho application logging. Có thể dùng structured log formatting khi hữu ích, nhưng không thêm external logging framework chỉ vì phức tạp hóa.

## 16. Database

Sử dụng database credentials với quyền tối thiểu khi khả thi.

Sử dụng migrations cho thay đổi schema.

Sử dụng transactions cho các thao tác thay đổi trạng thái cần tính nguyên tử.

## 17. Dependency security

Giữ dependencies được cập nhật hợp lý.

Không thêm package không có lý do.

Trước khi thêm package, kiểm tra:
- license compatibility
- trạng thái bảo trì
- liệu standard library/dependency hiện có đã giải quyết được vấn đề chưa

## 18. Ràng buộc free/open-source

MVP nên tránh third-party services có phí.

Điều này không có nghĩa sao chép font/assets tùy tiện.

Sử dụng:
- system fonts
- font/assets có license tương thích rõ ràng
- assets thuộc sở hữu dự án
- open-source dependencies có license tương thích

Không tải asset chỉ vì nó có sẵn miễn phí trực tuyến; xác minh license khi phân phối lại là vấn đề quan trọng.
