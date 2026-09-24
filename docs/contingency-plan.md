# Plan de Contingencia - SecureDesk

## 1. Objetivo
Definir el procedimiento técnico para responder ante fallos críticos,
pérdida o corrupción de datos y errores de despliegue en SecureDesk.

## 2. Activos prioritarios
1. Base de datos PostgreSQL.
2. Código fuente versionado.
3. Variables de entorno y secretos.
4. Disponibilidad del backend.
5. Historial de incidentes.

## 3. Clasificación

### Baja
Error funcional sin pérdida de datos.

### Media
Degradación parcial o riesgo de pérdida de datos.

### Alta
Sistema no disponible, corrupción de información,
acceso no autorizado o pérdida confirmada de datos.

## 4. Procedimiento
1. Detectar y clasificar el incidente.
2. Suspender cambios adicionales.
3. Informar al responsable técnico.
4. Ejecutar backup del estado actual si la BD sigue accesible.
5. Identificar el último commit estable.
6. Determinar si se requiere restore.
7. Ejecutar rollback de código cuando corresponda.
8. Restaurar la base de datos únicamente desde un backup validado.
9. Levantar nuevamente SecureDesk.
10. Verificar /health, login, rutas por rol e incidents.
11. Documentar causa raíz, acciones y resultado.

## 5. Criterio de recuperación
La recuperación se considera exitosa únicamente si:
- GET /health responde 200;
- POST /auth/login funciona;
- un token ADMIN accede a /admin/stats;
- un token no ADMIN recibe 403 en /admin;
- GET /incidents exige autenticación;
- los datos esperados están presentes.

## 6. Evidencias
Conservar:
- timestamp del incidente;
- commit estable;
- nombre del backup utilizado;
- comandos ejecutados;
- resultados de verificación;
- lecciones aprendidas.

## 7. Respaldo, objetivos de recuperación y reversa

### Respaldo
- Frecuencia: backup completo diario con `./scripts/backup.sh`, y siempre antes de un despliegue.
- El archivo se comprime y se cifra con AES-256 (`BACKUP_PASSPHRASE`); se acompaña de su huella SHA-256.
- Copia externa (regla 3-2-1): `BACKUP_OFFSITE_DIR` apunta a otro disco o carpeta sincronizada.
- En Docker los backups viven en el volumen `backups`, separado del contenedor.

### Objetivos
- RTO (tiempo máximo para volver a operar): 1 hora.
- Límite de restauración: 2 horas; al cumplirse sin éxito se ejecuta la reversa.
- RPO (pérdida máxima de datos aceptada): 24 horas, determinada por el backup diario.

### Reversa (rollback)
1. Código: `git checkout <commit o etiqueta estable>` y reconstruir con
   `docker compose --env-file .env.docker up -d --build`.
2. Datos: solo si el despliegue alteró los datos, restaurar el backup tomado
   antes del despliegue con `./scripts/restore.sh <archivo>.sql.gz.enc`.
3. Verificar el criterio de recuperación de la sección 5 y `/meta/version`.

### Prueba de restauración
Mensual, en un ambiente aislado. Un backup que no se ha restaurado no se
considera válido.
