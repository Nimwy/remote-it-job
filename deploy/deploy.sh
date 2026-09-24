#!/usr/bin/env bash
#
# Deploy trên VPS: cài deps -> kiểm tra config -> backup + migrate -> build frontend
# -> restart -> health check.
#
# Chạy bởi .github/workflows/deploy.yml, SAU khi workflow đã checkout đúng commit đã qua CI
# và tạo backend/.env từ deploy/.env.deploy + GitHub Secrets.
# Chạy tay trên VPS (user deploy): cd /home/deploy/remoteit && bash deploy/deploy.sh
#
# Lỗi ở bất kỳ bước nào -> dừng (exit 1). Không rollback tự động: xem DEPLOYMENT.md § Rollback.
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Nhóm log theo bước (thu gọn được trên GitHub Actions)
step() {
  if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
    [ "${in_group:-0}" = 1 ] && echo "::endgroup::"
    echo "::group::$*"
    in_group=1
  else
    printf '\n==> %s\n' "$*"
  fi
}

step "Backend deps"
cd "$APP_DIR/backend"
.venv/bin/pip install -q -r requirements.txt

# Nạp Settings với .env mới TRƯỚC khi migrate/restart: thiếu biến hoặc sai (vd SECRET_KEY quá
# ngắn ở production) -> dừng ở đây, service đang chạy giữ nguyên.
step "Kiểm tra backend config"
.venv/bin/python - << 'PY'
from pydantic import ValidationError
from app.core.config import Settings
try:
    Settings()
except ValidationError as e:
    for err in e.errors():  # không in giá trị (có thể là secret)
        print("❌", ".".join(map(str, err["loc"])) or "config", "-", err["msg"])
    raise SystemExit(1)
print("✅ backend config hợp lệ")
PY

# Backup trước, rồi migrate. Migration lỗi -> dừng, code mới không chạy trên schema cũ.
step "Backup DB + migrate"
"$APP_DIR/deploy/backup.sh"
.venv/bin/alembic upgrade head

step "Frontend build"
cd "$APP_DIR/frontend"
npm ci
npm run build
[ -f .next/BUILD_ID ] || { echo "❌ Frontend build failed"; exit 1; }

step "Restart services"
pm2 restart remoteit-frontend
# -n: sudoers sai thì lỗi ngay thay vì treo chờ mật khẩu (deploy/sudoers/remoteit-deploy)
sudo -n systemctl restart remoteit-backend

step "Health check"
check() {
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null "$1"; then
      echo "✅ $1"
      return 0
    fi
    sleep 2
  done
  echo "❌ $1 (sau 60s)"
  return 1
}
# Local trước (port theo deploy/services, deploy/pm2), public sau (Nginx/TLS/DNS)
public_url="$(grep -m1 '^FRONTEND_URL=' "$APP_DIR/deploy/.env.deploy" | cut -d= -f2-)"
if check "http://127.0.0.1:8000/api/health" \
  && check "http://127.0.0.1:3000/" \
  && check "${public_url}/api/health"; then
  echo "✅ Deploy OK: $(git -C "$APP_DIR" rev-parse --short HEAD)"
  exit 0
fi

journalctl -u remoteit-backend --no-pager -n 30 || true
pm2 logs remoteit-frontend --nostream --lines 30 || true
echo "Rollback: xem DEPLOYMENT.md § Rollback"
exit 1
