# Triển khai & vận hành (DEPLOYMENT) — Remote IT Job

Production chạy trên **VPS Ubuntu 24.04** (không Docker), domain **https://devremote.cc**.

## Kiến trúc production

```
Internet → Nginx :443 (TLS Certbot)
             ├── /            → Next.js :3000   (PM2: remoteit-frontend)
             └── /api         → FastAPI :8000   (systemd: remoteit-backend)
PostgreSQL 16 (local) — database `remoteit`
```

- Mã nguồn đặt tại `/home/deploy/remoteit` (user `deploy`).
- Backend: venv `backend/.venv`, chạy `uvicorn`, quản lý bằng **systemd**.
- Frontend: build `next build`, chạy `next start` qua **PM2**.
- Nginx làm reverse proxy + HTTPS.

## Biến môi trường

### Backend — `/home/deploy/remoteit/backend/.env` (không commit, `chmod 600`)

| Biến | Ghi chú |
|------|---------|
| `DATABASE_URL` | `postgresql+psycopg2://remoteit:<pass>@127.0.0.1:5432/remoteit` |
| `SECRET_KEY` | Chuỗi mạnh (`openssl rand -hex 32`) |
| `CORS_ORIGINS` | `["https://devremote.cc"]` |
| `FRONTEND_URL` | `https://devremote.cc` |
| `COOKIE_SECURE` | `true` (bắt buộc khi HTTPS) |
| `ENV` | `production` (ẩn `/docs`, `/openapi.json`, `/redoc`) |
| `RATE_LIMIT_ENABLED` | `true` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Để trống nếu chưa dùng Google OAuth (endpoint trả 501) |
| `GOOGLE_REDIRECT_URI` | `https://devremote.cc/api/auth/google/callback` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Tài khoản admin do `seed.py` tạo — **không lưu trong repo** |

### Frontend — `/home/deploy/remoteit/frontend/.env.production`

| Biến | Ghi chú |
|------|---------|
| `BACKEND_URL` | `http://127.0.0.1:8000` (SSR gọi backend nội bộ) |

## HTTPS (Certbot)

```bash
sudo certbot --nginx -d devremote.cc
sudo certbot renew --dry-run        # kiểm tra gia hạn tự động
sudo systemctl list-timers | grep certbot
```

- Cert: `/etc/letsencrypt/live/devremote.cc/fullchain.pem`; tự gia hạn qua `certbot.timer`.

## CI/CD (GitHub Actions)

Repo **public** → dùng **CI trên GitHub-hosted**, **CD trên self-hosted runner** (chỉ deploy khi push `main`).

| Workflow | Trigger | Việc làm |
|----------|---------|----------|
| `.github/workflows/ci.yml` | `pull_request` → `main` | backend `ruff`+`pytest` (Postgres service), frontend `lint`+`vitest`+`build`, e2e Playwright |
| `.github/workflows/deploy.yml` | `push` → `main` (+ `workflow_dispatch`) | `build-test` (không e2e) → `deploy` trên self-hosted runner |

**Branch protection `main`:** require PR + 1 approval + status check `build-test` (admin được phép bypass).

**Self-hosted runner** (trên VPS, user `deploy`):
- Label: `self-hosted, linux, x64`.
- Cài service: `sudo ./svc.sh install deploy && sudo ./svc.sh start`.

**Sudoers tối thiểu** (`/etc/sudoers.d/remoteit-deploy`):
```
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart remoteit-backend
```

### Quy trình deploy
`deploy/deploy.sh` (chạy bởi job deploy): `pip install` → `alembic upgrade head` → `npm ci` + `npm run build` → `pm2 restart` + `systemctl restart` → health check (retry ~60s).

## Migration

```bash
cd /home/deploy/remoteit/backend
source .venv/bin/activate
alembic upgrade head
```

- Alembic đọc `DATABASE_URL` từ `.env` (xem `migrations/env.py`).
- Migration chạy **tự động mỗi lần deploy** (trong `deploy.sh`).

## Seed

```bash
cd /home/deploy/remoteit/backend && source .venv/bin/activate
python seed.py        # tạo admin (ADMIN_EMAIL/ADMIN_PASSWORD) + categories + tags
```

- **Không** tích hợp vào CI/CD (chạy tay 1 lần khi cần).

## Sao lưu DB

```bash
/home/deploy/remoteit/deploy/backup.sh    # pg_dump -Fc, giữ 7 bản gần nhất ở /home/deploy/backups
```

Cron (user `deploy`, `crontab -e`):
```
0 3 * * * /home/deploy/remoteit/deploy/backup.sh >> /home/deploy/backups/backup.log 2>&1
```

Khôi phục:
```bash
pg_restore -d "postgresql://remoteit:<pass>@127.0.0.1:5432/remoteit" --clean /home/deploy/backups/remoteit_YYYY-MM-DD_HHMMSS.dump
```

## Log

```bash
journalctl -u remoteit-backend -f      # FastAPI
pm2 logs remoteit-frontend             # Next.js
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

## Rollback

- Chưa cần cơ chế release/tag. Khi cần: `git revert <commit>` → merge → deploy tự chạy lại; hoặc `git reset --hard <commit-cũ>` trên VPS rồi chạy `deploy/deploy.sh`.

## Ghi chú bảo mật

- **Không** commit `.env` hay credential thật; admin credential lưu ở file cục bộ.
- `SECRET_KEY` production phải mạnh; cookie `Secure` + `HttpOnly` + `SameSite=Lax`.
- Ẩn tài liệu API ở production (`ENV=production`).
- Firewall `ufw`: chỉ mở 22/80/443.
