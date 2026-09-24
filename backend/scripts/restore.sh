#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$BACKEND_DIR"

if [ -f ".env" ]; then
  set -a
  source ".env"
  set +a
fi

: "${DATABASE_URL:?DATABASE_URL no definida}"

# pg_dump y psql no aceptan el parametro "schema" que Prisma incluye en DATABASE_URL.
PG_URL="$(printf '%s' "$DATABASE_URL" | sed -E 's/[?&]schema=[^&]*//')"
case "$PG_URL" in
  *\?*) ;;
  *\&*) PG_URL="$(printf '%s' "$PG_URL" | sed -E 's/&/?/')" ;;
esac

if [ -z "${1:-}" ]; then
  echo "Uso: ./scripts/restore.sh backups/archivo.sql"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Archivo no encontrado: $BACKUP_FILE"
  exit 1
fi

echo "Generando backup de seguridad antes del restore..."
"$SCRIPT_DIR/backup.sh"

echo "Restaurando desde: $BACKUP_FILE"
psql \
  --set ON_ERROR_STOP=on \
  "$PG_URL" \
  < "$BACKUP_FILE"

echo "Restore completado: $BACKUP_FILE"
