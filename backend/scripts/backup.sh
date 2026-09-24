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

mkdir -p backups
TS="$(date +%Y%m%d_%H%M%S)"
FILE="backups/securedesk_${TS}.sql"

# Si pg_dump falla no debe quedar un archivo vacio que aparente ser un backup.
trap 'rm -f "$FILE"' ERR

pg_dump \
  --dbname="$PG_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "$FILE"

echo "Backup generado: $FILE"
