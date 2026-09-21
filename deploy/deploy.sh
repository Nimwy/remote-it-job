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
sleep 2
curl -fsS https://devremote.cc/api/jobs >/dev/null
echo "Deploy OK"
