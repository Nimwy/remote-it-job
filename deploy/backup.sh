#!/usr/bin/env bash
#
# Sao lưu database production (chạy định kỳ bằng cron trên VPS).
# Đọc DATABASE_URL từ backend/.env để không hardcode mật khẩu.
#
# Cài cron (user deploy):
#   0 3 * * * /home/deploy/remoteit/deploy/backup.sh >> /home/deploy/backups/backup.log 2>&1
#
set -euo pipefail

ENV_FILE="/home/deploy/remoteit/backend/.env"
BACKUP_DIR="/home/deploy/backups"
KEEP=7  # giữ 7 bản gần nhất

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# pg_dump không hiểu driver "+psycopg2" -> bỏ đi
PGURL="${DATABASE_URL/+psycopg2/}"

mkdir -p "$BACKUP_DIR"
ts="$(date +%F_%H%M%S)"
out="$BACKUP_DIR/remoteit_$ts.dump"

pg_dump "$PGURL" -Fc -f "$out"

# Xoá các bản cũ, chỉ giữ $KEEP bản mới nhất
ls -1t "$BACKUP_DIR"/remoteit_*.dump | tail -n +$((KEEP + 1)) | xargs -r rm -f

echo "Backup OK: $out"
