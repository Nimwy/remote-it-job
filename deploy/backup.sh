#!/usr/bin/env bash
#
# Sao lưu database production. deploy.yml gọi trước khi migrate; cron chạy hằng đêm (user deploy):
#   0 3 * * * /home/deploy/remoteit/deploy/backup.sh >> /home/deploy/backups/backup.log 2>&1
#
set -euo pipefail
umask 077  # dump chứa dữ liệu người dùng -> chỉ owner đọc được

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Đọc 1 key từ file KEY=value. KHÔNG `source`: secret có thể chứa $ ; ` và bị thực thi.
get() {
  { grep -E "^$2=" "$1" || true; } | tail -n 1 | cut -d= -f2- | sed -e "s/^[\"']//" -e "s/[\"']$//"
}
ENV_FILE="$APP_DIR/backend/.env"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
BACKUP_KEEP="${BACKUP_KEEP:-7}"

# Mật khẩu qua biến môi trường, không nằm trên command line (`ps` không thấy)
PGPASSWORD="$(get "$ENV_FILE" DB_PASSWORD)"
export PGPASSWORD

mkdir -p "$BACKUP_DIR"
out="$BACKUP_DIR/remoteit_$(date +%F_%H%M%S).dump"

# Ghi file tạm, kiểm tra đọc lại được rồi mới đổi tên -> dump hỏng không bao giờ
# chiếm chỗ trong BACKUP_KEEP bản được giữ.
trap 'rm -f "$out.part"' EXIT
pg_dump -h "$(get "$ENV_FILE" DB_HOST)" -p "$(get "$ENV_FILE" DB_PORT)" \
  -U "$(get "$ENV_FILE" DB_USER)" -d "$(get "$ENV_FILE" DB_NAME)" -Fc -f "$out.part"
pg_restore -l "$out.part" > /dev/null
mv "$out.part" "$out"

# Chỉ giữ BACKUP_KEEP bản mới nhất
# shellcheck disable=SC2012
ls -1t "$BACKUP_DIR"/remoteit_*.dump | tail -n +$((BACKUP_KEEP + 1)) | xargs -r rm -f

echo "Backup OK: $out"
