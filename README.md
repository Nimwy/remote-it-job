# Remote IT Job Board

Website tuyển dụng việc làm remote, tập trung vào thị trường người dùng Việt Nam.

## Mục tiêu

- Job seeker có thể tìm kiếm và xem việc làm remote mà không cần tạo tài khoản.
- HR có thể đăng và quản lý tin tuyển dụng.
- Admin kiểm duyệt HR và tin tuyển dụng trước khi công khai.
- Job seeker liên hệ trực tiếp với HR qua các kênh được HR cung cấp.
- Không có chức năng nộp CV/application trong hệ thống ở phiên bản hiện tại.

## Công nghệ

- Frontend: React + TypeScript
- Backend: FastAPI + Python
- Database: PostgreSQL
- ORM: SQLAlchemy
- Migration: Alembic
- Authentication:
  - Email + password
  - Google OAuth / OpenID Connect
- UI: triển khai dựa trên thiết kế được tạo bằng Google Stitch.

## Phạm vi người dùng

### Job seeker

Không cần đăng nhập.

Có thể:
- Tìm kiếm job.
- Lọc theo category, tag, mức lương, loại công việc, location, timezone.
- Xem danh sách job.
- Xem chi tiết job.
- Xem thông tin liên hệ của HR.
- Tự liên hệ HR.

### HR

Có thể đăng nhập bằng:
- Email + password.
- Google.

Một tài khoản có thể liên kết cả hai phương thức.

HR mới đăng ký phải được admin duyệt trước khi đăng tin.

Có thể:
- Tạo draft job.
- Gửi job để duyệt.
- Sửa job thuộc quyền sở hữu.
- Đóng job.
- Xóa job theo business rules.
- Quản lý thông tin công ty.
- Quản lý các kênh liên hệ.

### Admin

Có thể:
- Duyệt / từ chối HR.
- Khóa / mở khóa HR.
- Xem và quản lý toàn bộ job.
- Duyệt / từ chối job.
- Ẩn / xóa job vi phạm.
- Xem thống kê cơ bản.

## Nguyên tắc quan trọng

1. Không thêm hệ thống application/CV nếu chưa có yêu cầu mới.
2. Job seeker không cần account.
3. Contact là dữ liệu của HR, không phải dữ liệu riêng của từng job.
4. Category và tag do hệ thống quản lý; HR chỉ chọn từ danh sách có sẵn.
5. Authentication thành công không đồng nghĩa HR đã được admin duyệt.
6. Không tự ý thêm dịch vụ trả phí.
7. UI không được tự quyết định business logic.
8. Không tự ý thay đổi database schema hoặc trạng thái nghiệp vụ mà không cập nhật tài liệu.

## Deployment

Domain, hosting và production infrastructure nằm ngoài phạm vi phát triển hiện tại và sẽ được xử lý riêng.

Ứng dụng nên giữ portable, không phụ thuộc không cần thiết vào một nhà cung cấp hosting cụ thể.
