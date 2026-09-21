#!/usr/bin/env bash
#
# Script deploy chạy trên VPS bởi self-hosted runner (workflow .github/workflows/deploy.yml).
# Giả định code tại $APP_DIR đã được cập nhật về đúng revision trước khi gọi script này.
#
set -euo pipefail

APP_DIR="/home/deploy/remoteit"

echo "==> Backend deps + migrate"
cd "$APP_DIR/backend"
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt
alembic upgrade head

echo "==> Frontend build"
cd "$APP_DIR/frontend"
npm ci
npm run build

echo "==> Restart services"
pm2 restart remoteit-frontend
sudo systemctl restart remoteit-backend

echo "==> Health check"
# Backend vừa restart có thể cần vài giây mới sẵn sàng -> thử lại tối đa ~60s
for i in $(seq 1 30); do
  if curl -fsS https://devremote.cc/api/jobs >/dev/null 2>&1; then
    echo "Deploy OK"
    exit 0
  fi
  echo "  chưa sẵn sàng (lần $i/30), thử lại sau 2s..."
  sleep 2
done
echo "Health check thất bại sau 60s"
exit 1
