# Project State — Remote IT Job

## Giai đoạn hiện tại

**Đã triển khai xong MVP — chờ review (branch `feat/nextjs-migration`)**

Toàn bộ backend, frontend, test và tài liệu đã hoàn thành theo yêu cầu review của người hướng dẫn.

## Quyết định đã chốt

### Sản phẩm
- Website đăng tin tuyển dụng IT remote.
- Đối tượng chính: người dùng Việt Nam.
- Ngôn ngữ UI: tiếng Việt + tiếng Anh (i18n next-intl).
- Nội dung job có thể là tiếng Việt hoặc tiếng Anh.
- Job seeker không cần tài khoản.
- Không nộp/upload CV qua nền tảng.
- URL dùng slug cho SEO (job `/jobs/{slug}-{id}`, category `/category/{slug}`, tag `/tag/{slug}`).

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
- Alembic (mỗi bảng 1 file migration riêng).

### Triển khai / runtime
- Backend chạy trong Docker.
- PostgreSQL chạy qua Docker Compose.
- Frontend Next.js chạy trực tiếp bằng Node.js/npm trong WSL2.
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

## Đã triển khai

- Backend FastAPI (auth, jobs, HR, admin) — chạy Docker.
- 8 file migration (mỗi bảng 1 file).
- Repository layer tách khỏi services.
- Frontend Next.js (SSR) — public, HR, Admin.
- i18n EN/VI (next-intl) + slug URL cho SEO.
- Trang category + tag + thời gian tương đối.
- Unit test (pytest 81, Vitest 17) + e2e (Playwright 10).
- Tài liệu: API_REFERENCE.md, DIAGRAMS.md.

## Chưa triển khai / tồn đọng

- Google OAuth cần config credentials thật (hiện trả 501 khi chưa cấu hình).
- Deploy production (domain/hosting).
- Email verification / password reset (ngoài MVP).

## Bước tiếp theo

1. Review branch `feat/nextjs-migration`, tạo PR để người hướng dẫn kiểm tra.
2. Merge PR vào `main` sau khi review OK.
3. Config Google OAuth credentials thật.
4. Cân nhắc deploy thử lên hosting.

## Ràng buộc quan trọng

Không coi file này là changelog.

Chỉ cập nhật khi trạng thái triển khai hiện tại hoặc quyết định kiến trúc đã chốt thay đổi đáng kể.

## Thời điểm triển khai Stitch UI

Output `stitch_remote_it_job_board/` là tham chiếu UI dùng trong quá trình triển khai frontend. Đây không phải là giai đoạn cuối riêng biệt phải chờ đến cuối cùng; các React page/component nên chuyển đổi thiết kế Stitch ngay khi triển khai các tính năng frontend tương ứng.
