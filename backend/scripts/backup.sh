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
# El prefijo distingue los backups programados de los previos a una restauracion.
PREFIX="${BACKUP_PREFIX:-securedesk}"

if [ -n "${BACKUP_PASSPHRASE:-}" ]; then
  FILE="backups/${PREFIX}_${TS}.sql.gz.enc"
else
  FILE="backups/${PREFIX}_${TS}.sql"
  echo "ADVERTENCIA: BACKUP_PASSPHRASE no definida, el backup queda SIN cifrar." >&2
fi

# Si pg_dump falla no debe quedar un archivo vacio que aparente ser un backup.
trap 'rm -f "$FILE" "$FILE.sha256"' ERR

if [ -n "${BACKUP_PASSPHRASE:-}" ]; then
  # Comprimido y cifrado con AES-256; la clave se deriva de la frase con PBKDF2.
  pg_dump \
    --dbname="$PG_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    | gzip \
    | openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt \
      -pass env:BACKUP_PASSPHRASE -out "$FILE"
else
  pg_dump \
    --dbname="$PG_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    > "$FILE"
fi

# Huella SHA-256 para verificar la integridad antes de restaurar.
openssl dgst -sha256 -r "$FILE" | cut -d' ' -f1 > "$FILE.sha256"

# Copia fuera del servidor (regla 3-2-1): otro disco, carpeta sincronizada, etc.
if [ -n "${BACKUP_OFFSITE_DIR:-}" ]; then
  mkdir -p "$BACKUP_OFFSITE_DIR"
  cp "$FILE" "$FILE.sha256" "$BACKUP_OFFSITE_DIR/"
  echo "Copia externa: $BACKUP_OFFSITE_DIR/$(basename "$FILE")"
fi

echo "Backup generado: $FILE"
