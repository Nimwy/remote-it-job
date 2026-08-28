# Triển khai & vận hành (DEPLOYMENT) — Remote IT Job

> **Lưu ý (D-03):** Deploy production nằm ngoài phạm vi MVP hiện tại. README chỉ hướng dẫn chạy local. Tài liệu này ghi lại **biến môi trường**, **cách chạy migration khi deploy**, **nơi xem log** và **sao lưu DB** để khi bước sang giai đoạn deploy có sẵn quyết định `không bỏ quên`.

## Biến môi trường production

### Backend (`backend/app/core/config.py`)

| Biến | Mặc định | Mô tả / yêu cầu production |
|------|----------|-------|
| `DATABASE_URL` | — | `postgresql+psycopg2://user:pass@host:5432/db` (bắt buộc, không có mặc định hợp lệ). |
| `SECRET_KEY` | — | Bắt buộc set giá trị ngẫu nhiên mạnh; không dùng `dev-secret-key-not-for-production`. |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Liệt kê origin frontend production, vd `["https://jobs.example.vn"]`. |
| `FRONTEND_URL` | `http://localhost:3000` | URL frontend production, dùng cho OAuth redirect/session. |
| `COOKIE_SECURE` | `true` | Yêu cầu bật (HTTPS) ở production; tắt khi dev qua HTTP. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Bắt buộc để bật Google OAuth; thiếu thì endpoint trả 501. |
| `RATE_LIMIT_ENABLED` | `true` | Có thể tắt (vd khi test). |

### Frontend (`frontend/`)
- `BACKEND_URL` — mặc định `http://localhost:8000`. Khi deploy đặt về URL backend production (dùng chung cho SSR và rewrite `/api`).

## Chạy migration khi deploy

```bash
# Khởi tạo/migrate schema trước khi mở traffic
docker compose run --rm backend alembic upgrade head
```

- Migration do Alembic quản lý (`backend/alembic/`), mỗi bảng một file.
- Chạy migration **trước** khi khởi động bản backend mới để tránh lệch schema.
- Seed admin/categories/tags nếu cần: `docker compose run --rm backend python seed.py`.

## Xem log

```bash
# Log container backend (ví dụ)
docker compose logs -f backend
```

- Backend có middleware ghi mỗi request (method, path, status, duration, request_id, user_id) — xem `app/main.py`.
- Lỗi không xử lý được ghi kèm `request_id` để truy vết; trả về `{error:{code,message,request_id}}`.

## Sao lưu DB

```bash
# Dump toàn bộ database
docker compose exec db pg_dump -U remoteit remoteit > backup_$(date +%F).sql

# Khôi phục
cat backup_2026-01-01.sql | docker compose exec -T db psql -U remoteit remoteit
```

- Volume Postgres bền qua container: `pgdata` (xem `docker-compose.yml`).
- Nên lên lịch sao lưu định kỳ và kiểm thử khôi phục trước khi dùng production.

## Build production

- Backend có `backend/Dockerfile` cho môi trường runtime; dev dùng volume mount `./backend:/app` và `--reload`.
- Frontend build static: `cd frontend && npm run build`.

## Kiến trúc khuyến nghị khi deploy (ngoài MVP)
- Đặt một reverse proxy (Nginx/Traefik) trước backend để xử lý HTTPS, CORS và rate limit tầng edge — quyết định này được chốt có chủ đích (P2 trong review), không bỏ quên.
- Tách DB production khỏi DB dev; dùng secret quản lý (không commit).
