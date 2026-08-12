# Project State — Remote IT Job

## Giai đoạn hiện tại

**Tài liệu / tiền triển khai**

Yêu cầu dự án và kiến trúc cốt lõi đã được quyết định. Chưa bắt đầu triển khai code.

## Quyết định đã chốt

### Sản phẩm
- Website đăng tin tuyển dụng IT remote.
- Đối tượng chính: người dùng Việt Nam.
- Ngôn ngữ UI: tiếng Việt.
- Nội dung job có thể là tiếng Việt hoặc tiếng Anh.
- Job seeker không cần tài khoản.
- Không nộp/upload CV qua nền tảng.

### Vai trò
- Job seeker: truy cập công khai.
- HR: quản lý job của mình.
- Admin: kiểm duyệt và quản lý catalog.

### Xác thực
- Đăng ký/đăng nhập bằng email/password.
- Đăng nhập Google OAuth.
- Tài khoản HR mới cần Admin duyệt.
- Session phía server.
- Session lưu trong PostgreSQL.
- Cookie HTTP-only.
- Hash password bằng Argon2id.
- Tài khoản Admin được tạo bằng seed/CLI.
- Google OAuth không dùng cho Admin trong MVP.

### Database
- PostgreSQL.
- SQLAlchemy 2.x.
- Alembic.

### Triển khai / runtime
- Backend chạy trong Docker.
- PostgreSQL chạy qua Docker Compose.
- Frontend chạy trực tiếp bằng Node.js/npm trong WSL2.
- Domain/hosting được xử lý riêng và nằm ngoài phạm vi triển khai hiện tại.

### Vòng đời job
```text
draft
  ↓
pending
  ├── approved
  └── rejected
         ↓
       pending

approved
  ├── closed
  ├── hidden
  └── expired
```

Sửa substantive content trên job đã approved yêu cầu re-approval.

### Vòng đời HR
```text
pending → active → blocked
```

HR bị blocked không bị hard-delete và job của họ không hiển thị công khai.

### Tìm kiếm
- Search/filter dựa trên PostgreSQL.
- Từ khóa.
- Category.
- Tags.
- Loại job.
- Lương.
- Currency.
- Địa điểm.
- Múi giờ.
- Offset pagination.
- Mặc định 20 items/page.

### Category và tag
- Được quản lý bởi hệ thống/Admin.
- HR chọn từ category/tag có sẵn.
- Không cho phép HR tự do tạo tag trong MVP.

### Lượt xem
- Một server-side session chỉ được tính view cho cùng một job tối đa một lần trong 24 giờ.
- Backend kiểm soát việc đếm, không phải frontend.

## Chưa triển khai

- Frontend source code.
- Backend source code.
- Database migrations.
- Authentication implementation.
- Google OAuth configuration.
- API implementation.
- Admin UI.
- HR UI.
- Public job UI.
- Automated tests.

## Bước tiếp theo

1. Kiểm tra tính nhất quán của bộ tài liệu.
2. Tạo cấu trúc source code.
3. Thiết lập môi trường backend Docker.
4. Thiết lập PostgreSQL.
5. Thiết lập React/Vite frontend.
6. Triển khai database models và Alembic migrations.
7. Triển khai authentication/session.
8. Triển khai public jobs.
9. Triển khai tính năng HR.
10. Triển khai Admin moderation.
11. Thêm tests.
12. Tích hợp UI từ Stitch.

## Ràng buộc quan trọng

Không coi file này là changelog.

Chỉ cập nhật khi trạng thái triển khai hiện tại hoặc quyết định kiến trúc đã chốt thay đổi đáng kể.

## Thời điểm triển khai Stitch UI

Output `stitch_remote_it_job_board/` là tham chiếu UI dùng trong quá trình triển khai frontend. Đây không phải là giai đoạn cuối riêng biệt phải chờ đến cuối cùng; các React page/component nên chuyển đổi thiết kế Stitch ngay khi triển khai các tính năng frontend tương ứng.
