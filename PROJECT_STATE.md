# Project State — Remote IT Job

## Giai đoạn hiện tại

**Đã triển khai production lên VPS + thiết lập CI/CD (GitHub Actions).**

MVP đã hoàn thành và đang chạy thật tại **https://devremote.cc** (VPS Ubuntu 24.04, không Docker). CI chạy trên PR, CD tự động deploy khi merge vào `main` (self-hosted runner trên VPS).

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
- Xác thực bằng access token (JWT) + refresh token (opaque) lưu hash trong PostgreSQL.
- Cookie HTTP-only.
- Hash password bằng Argon2id.
- Tài khoản Admin được tạo bằng seed/CLI.
- Google OAuth không dùng cho Admin trong MVP.

### Database
- PostgreSQL.
- SQLAlchemy 2.x.
- Alembic (mỗi bảng 1 file migration riêng).

### Triển khai / runtime
- **Production:** VPS Ubuntu 24.04, **không Docker** — PostgreSQL + FastAPI (systemd) + Next.js (PM2) + Nginx + Certbot.
- Domain: `https://devremote.cc` (Nginx proxy `/` → Next :3000, `/api` → FastAPI :8000).
- **CI/CD:** GitHub Actions — CI (build-test) trên PR; CD (deploy) trên self-hosted runner khi push `main`.
- Local dev: backend + PostgreSQL qua Docker Compose; frontend chạy bằng Node/npm trong WSL2.

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
- Test backend/frontend/e2e (số lượng lấy từ lệnh chạy test — xem `TESTING.md`; không ghi con số cố định ở đây để tránh đóng băng theo ngày).
- Tài liệu: API_REFERENCE.md, DIAGRAMS.md, SCREENS.md, TESTING.md, DEPLOYMENT.md.
- Production trên VPS + HTTPS (Certbot) + CI/CD (GitHub Actions, self-hosted runner) — xem `DEPLOYMENT.md`.

## Chưa triển khai / tồn đọng

- Google OAuth cần config credentials thật (hiện trả 501 khi chưa cấu hình).
- Email verification / password reset (ngoài MVP).

## Bước tiếp theo

1. Bật required reviewers cho GitHub Environment `production` khi có người duyệt thứ 2.
2. Config Google OAuth credentials thật (nếu cần).
3. Theo dõi/ bảo trì: backup DB định kỳ, gia hạn cert (tự động), xem log.

## Ràng buộc quan trọng

Không coi file này là changelog.

Chỉ cập nhật khi trạng thái triển khai hiện tại hoặc quyết định kiến trúc đã chốt thay đổi đáng kể.

**Ghi chú (S-09):** `version="0.1.0"` của FastAPI (`backend/app/main.py`) là hardcode — khi bump version API, cập nhật phối hợp tại đây và các tài liệu liên quan.

## Thời điểm triển khai Stitch UI

Output `stitch_remote_it_job_board/` là tham chiếu UI dùng trong quá trình triển khai frontend. Đây không phải là giai đoạn cuối riêng biệt phải chờ đến cuối cùng; các React page/component nên chuyển đổi thiết kế Stitch ngay khi triển khai các tính năng frontend tương ứng.
