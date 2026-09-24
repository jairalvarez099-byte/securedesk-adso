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
  echo "Uso: ./scripts/restore.sh backups/archivo.sql.gz.enc"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Archivo no encontrado: $BACKUP_FILE"
  exit 1
fi

if [ -f "$BACKUP_FILE.sha256" ]; then
  EXPECTED="$(cat "$BACKUP_FILE.sha256")"
  ACTUAL="$(openssl dgst -sha256 -r "$BACKUP_FILE" | cut -d' ' -f1)"
  if [ "$EXPECTED" != "$ACTUAL" ]; then
    echo "Integridad fallida: el backup fue modificado o esta danado."
    exit 1
  fi
  echo "Integridad verificada (SHA-256)."
fi

echo "Generando backup de seguridad antes del restore..."
# Prefijo propio: si se restaura en el mismo segundo en que se creo el backup,
# el respaldo de seguridad no puede sobrescribir el archivo que se va a restaurar.
BACKUP_PREFIX="pre-restore" "$SCRIPT_DIR/backup.sh"

echo "Restaurando desde: $BACKUP_FILE"
case "$BACKUP_FILE" in
  *.enc)
    : "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE no definida: no se puede descifrar}"
    openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
      -pass env:BACKUP_PASSPHRASE -in "$BACKUP_FILE" \
      | gunzip \
      | psql --set ON_ERROR_STOP=on --quiet "$PG_URL"
    ;;
  *)
    psql --set ON_ERROR_STOP=on --quiet "$PG_URL" < "$BACKUP_FILE"
    ;;
esac

echo "Restore completado: $BACKUP_FILE"
