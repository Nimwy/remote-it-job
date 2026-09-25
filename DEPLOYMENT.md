# Triển khai & vận hành (DEPLOYMENT) — Remote IT Job

Production chạy trên **VPS Ubuntu 24.04** (không Docker), domain **https://devremote.cc**.
`docker-compose.yml` và `backend/Dockerfile` chỉ dùng cho dev local và e2e trong CI.

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

**Không sửa tay `.env` trên VPS.** Cấu hình production của backend nằm ở **`deploy/.env.deploy`** (được commit, cùng danh sách key với `backend/.env.example`). Mỗi lần deploy, `deploy.yml` sinh lại `backend/.env` từ file này.

**Key để trống trong `deploy/.env.deploy` là secret**, lấy từ GitHub Secret cùng tên (Settings → Environments → `production`):

| Secret | Ghi chú |
|---|---|
| `DB_PASSWORD` | Mật khẩu user `remoteit` của Postgres |
| `SECRET_KEY` | `openssl rand -hex 32` (≥ 32 ký tự). Đổi = đăng xuất toàn bộ người dùng |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Tài khoản admin do `seed.py` tạo |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Tuỳ chọn — trống thì endpoint Google trả 501 |

Tuỳ chọn thêm Variable `APP_DIR` (mặc định `/home/deploy/remoteit`).

- Đổi giá trị không bí mật (domain, CORS, log level...): sửa `deploy/.env.deploy` → PR → merge.
- Thêm key mới: thêm vào `backend/.env.example` **và** `deploy/.env.deploy` (hai file phải cùng danh sách key). Nếu là secret, thêm cả vào `env:` của step *Create .env* trong `deploy.yml`.
- `deploy/deploy.sh` (bước *Kiểm tra backend config*) nạp cấu hình mới **trước** khi migrate/restart: thiếu biến, `SECRET_KEY` < 32 ký tự hay `COOKIE_SECURE` khác `true` ở production → deploy dừng, service đang chạy giữ nguyên.
- Giá trị **không được chứa** dấu `'`, dấu `\` hoặc chuỗi `${` (python-dotenv sẽ đọc sai).
- Frontend không cần `.env` ở production: SSR gọi backend qua default `http://localhost:8000` (cùng VPS).

### Locale prefix (URL)

Frontend dùng next-intl với **`localePrefix: "always"`** (`frontend/src/i18n/routing.ts`): mọi URL có tiền tố locale `/vi/...` (mặc định) hoặc `/en/...`; `/` **redirect 307 → `/vi`**. Điều này cũng để tránh lỗi Next 16 khi bind hostname (xem mục bên dưới), cho phép PM2 chạy `next start -H 127.0.0.1`.

**Vì sao bind `-H 127.0.0.1`:** Next 16, khi bind hostname cụ thể + `X-Forwarded-Proto: https`, sẽ sinh middleware-rewrite **tuyệt đối** (`https://localhost:3000/...`) và tự proxy HTTPS tới server HTTP → `500`. Với `localePrefix: "always"`, `/` **redirect** (không rewrite) nên tránh được; khi đó bind `127.0.0.1` an toàn (2 lớp bảo vệ: bind localhost + `ufw`).

> Khi đổi `deploy/pm2/ecosystem.config.js`, `pm2 restart` **không** tự áp args mới — cần `pm2 delete remoteit-frontend && pm2 start deploy/pm2/ecosystem.config.js && pm2 save`.

## Cài đặt server (lần đầu / khi đổi hạ tầng)

Cấu hình server nằm trong repo (lấy từ VPS ngày 2026-09-22), cài **bằng tay** — deploy tự động không đụng vào `/etc`:

| File trong repo | Trên VPS |
|---|---|
| `deploy/services/remoteit-backend.service` | `/etc/systemd/system/remoteit-backend.service` — uvicorn `127.0.0.1:8000` |
| `deploy/pm2/ecosystem.config.js` | PM2 của user `deploy` (`~/.pm2/dump.pm2`, tự khởi động qua `pm2-deploy.service`) |
| `deploy/nginx/devremote.cc.conf` | `/etc/nginx/sites-available/remoteit` |
| `deploy/sudoers/remoteit-deploy` | `/etc/sudoers.d/remoteit-deploy` |

```bash
cd /home/deploy/remoteit

# Backend (systemd)
sudo install -m 644 deploy/services/remoteit-backend.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl restart remoteit-backend

# Frontend (PM2, user deploy)
pm2 delete remoteit-frontend
pm2 start deploy/pm2/ecosystem.config.js && pm2 save

# Sudoers cho runner (kiểm tra cú pháp trước — sudoers hỏng là mất quyền sudo)
sudo visudo -cf deploy/sudoers/remoteit-deploy \
  && sudo install -m 440 deploy/sudoers/remoteit-deploy /etc/sudoers.d/remoteit-deploy

# Nginx
sudo install -m 644 deploy/nginx/devremote.cc.conf /etc/nginx/sites-available/remoteit
sudo nginx -t && sudo systemctl reload nginx     # KHÔNG reload nếu nginx -t lỗi

# Backup hằng đêm (user deploy)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/deploy/remoteit/deploy/backup.sh >> /home/deploy/backups/backup.log 2>&1") | crontab -
```

- **HTTPS:** cert cấp bằng `sudo certbot --nginx -d devremote.cc` (renewal dùng plugin nginx, tự gia hạn qua `certbot.timer`). Các dòng `# managed by Certbot` trong file Nginx phải giữ nguyên. Kiểm tra: `sudo certbot renew --dry-run`.
- Port 8000/3000 và tên `remoteit-backend` / `remoteit-frontend` được dùng cố định trong `deploy.yml`; đổi thì sửa cả hai nơi.
- Sửa file trên VPS mà không sửa repo = lần cài sau sẽ mất. Luôn sửa trong repo trước.

## CI/CD (GitHub Actions)

Repo **public** → dùng **CI trên GitHub-hosted**, **CD trên self-hosted runner** (chỉ deploy khi push `main`).

| Workflow | Trigger | Việc làm |
|----------|---------|----------|
| `.github/workflows/ci.yml` | `pull_request` → `main` | backend `ruff` + kiểm tra migration + `pytest`, frontend `lint`+`vitest`+`build`, e2e Playwright (bản build) |
| `.github/workflows/deploy.yml` | `push` → `main` (+ `workflow_dispatch`) | `build-test` (không e2e, có kiểm tra migration) → `deploy` trên self-hosted runner |

**Branch protection `main`:** require PR + 1 approval + status check `build-test` (admin được phép bypass).

**Self-hosted runner** (trên VPS, user `deploy`):
- Label: `self-hosted, linux, x64`.
- Cài service: `sudo ./svc.sh install deploy && sudo ./svc.sh start`.

**Sudoers tối thiểu:** `deploy/sudoers/remoteit-deploy` — runner chỉ được `systemctl restart remoteit-backend`.

### Quy trình deploy

Job `deploy` trong `.github/workflows/deploy.yml`:

1. Checkout **đúng commit đã qua `build-test`** (`$GITHUB_SHA`, detached HEAD). Mọi sửa tay trong mã nguồn trên VPS sẽ bị ghi đè (file untracked như `.env` được giữ).
2. Tạo `backend/.env` từ `deploy/.env.deploy` + GitHub Secrets.
3. Chạy **`deploy/deploy.sh`**: `pip install` → kiểm tra config → `deploy/backup.sh` → `alembic upgrade head` → `npm ci` + `npm run build` → `pm2 restart` + `sudo -n systemctl restart` → health check `http://127.0.0.1:8000/api/health` → `http://127.0.0.1:3000/` → `https://devremote.cc/api/health` (mỗi URL thử tối đa 60s; lỗi thì in log backend/frontend).

Chạy tay trên VPS khi cần (user `deploy`, code và `backend/.env` đã đúng): `cd /home/deploy/remoteit && bash deploy/deploy.sh`.

- `workflow_dispatch` chỉ deploy khi chạy trên `main`.

**Lần đầu chuyển sang workflow này:** tạo đủ Secrets ở trên trước khi merge, và đảm bảo systemd unit `remoteit-backend` chạy với `WorkingDirectory=/home/deploy/remoteit/backend` (app đọc `backend/.env` theo đường dẫn tuyệt đối, nhưng seed/alembic chạy tay vẫn cần đúng thư mục).

## Migration

```bash
cd /home/deploy/remoteit/backend
source .venv/bin/activate
alembic upgrade head
```

- Alembic dùng cùng cấu hình DB với app (`DB_*` trong `backend/.env`, xem `migrations/env.py`).
- Migration chạy **tự động mỗi lần deploy**, sau khi backup DB.
- CI chạy `alembic upgrade head` → `alembic check` → `downgrade base` → `upgrade head` trên DB trống, nên migration lỗi bị chặn trước khi tới production.
- Migration chạy **trước** khi restart và **không** tự rollback, nên mọi migration phải **backward-compatible** (expand/contract): code cũ phải chạy được trên schema mới.

## Seed

```bash
cd /home/deploy/remoteit/backend && source .venv/bin/activate
python seed.py        # tạo admin (ADMIN_EMAIL/ADMIN_PASSWORD) + categories + tags
```

- **Không** tích hợp vào CI/CD (chạy tay 1 lần khi cần). `ADMIN_EMAIL`/`ADMIN_PASSWORD` là bắt buộc — thiếu thì `seed.py` báo lỗi thay vì tạo admin mặc định.

## Sao lưu DB

`deploy/backup.sh`: `pg_dump -Fc` vào `BACKUP_DIR` (mặc định `~/backups`), giữ `BACKUP_KEEP` bản (mặc định 7), file chỉ owner đọc được (600). Dump được kiểm tra bằng `pg_restore -l` trước khi tính là bản hợp lệ. Deploy tự chạy backup trước migrate.

Cron hằng đêm (user `deploy`, `crontab -e`):
```
0 3 * * * /home/deploy/remoteit/deploy/backup.sh >> /home/deploy/backups/backup.log 2>&1
```

- Backup chỉ nằm trên VPS — nên copy thêm ra ngoài (rclone/S3/máy khác).
- Định kỳ thử khôi phục vào một DB tạm để chắc bản dump dùng được.

### Khôi phục

```bash
sudo systemctl stop remoteit-backend
/home/deploy/remoteit/deploy/backup.sh                     # giữ lại trạng thái hiện tại trước khi ghi đè
read -rsp "DB password: " PGPASSWORD && export PGPASSWORD  # không để mật khẩu trong lệnh / history
pg_restore --clean --if-exists --no-owner --single-transaction \
  -h 127.0.0.1 -U remoteit -d remoteit \
  /home/deploy/backups/remoteit_YYYY-MM-DD_HHMMSS.dump     # lỗi -> rollback toàn bộ
unset PGPASSWORD
sudo systemctl start remoteit-backend
```

## Log

```bash
journalctl -u remoteit-backend -f      # FastAPI
pm2 logs remoteit-frontend             # Next.js
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

- Mỗi request được log kèm `request_id`; response lỗi cũng trả `request_id` để đối chiếu với log.

## Rollback

- Cách chuẩn: `git revert <commit>` → PR → merge → deploy tự chạy lại.
- **Không** dùng `git reset --hard` trên VPS: lần deploy sau sẽ checkout lại commit của `main`.
- Rollback code **không** rollback schema. Nếu commit bị revert có migration: backup DB, chạy `alembic downgrade <revision-trước>` (trong `backend/`, dùng `.venv/bin/alembic`), rồi mới deploy code cũ.
- Cần chữa cháy ngay (chưa kịp PR): chạy **Actions → Deploy → Run workflow** trên `main` sau khi đã revert.

## Ghi chú bảo mật

- **Không** commit `.env` hay credential thật; admin credential lưu ở file cục bộ.
- `SECRET_KEY` production phải mạnh; cookie `Secure` + `HttpOnly` + `SameSite=Lax`.
- Ẩn tài liệu API ở production (`ENV=production`).
- Firewall `ufw`: chỉ mở 22/80/443.
