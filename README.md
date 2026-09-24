# SecureDesk ADSO

Sistema web para **registrar y consultar incidentes de seguridad** dentro de una
organización, construido de forma incremental en la competencia de Seguridad
Informática (SENA — ADSO) y usado como proyecto del **plan de mejoramiento**.

| Enlace | |
| --- | --- |
| Repositorio | https://github.com/jairalvarez099-byte/securedesk-adso |
| Etiqueta y rama de entrega | `plan-mejoramiento` |
| Video técnico (YouTube) | _pendiente de publicar_ |
| Documento técnico (PDF) | `docs/plan-mejoramiento/` |

Autor: Jair Álvarez — Análisis y Desarrollo de Software (ADSO), SENA.

---

## 1. Arquitectura

```
Navegador ──► frontend (React 19 + Vite, servido por Nginx)  :5173
                 │  fetch con VITE_API_URL + JWT en Authorization: Bearer
                 ▼
             backend (Node 20 + Express 5 + Prisma 7)          :3000
                 │  helmet · cors · rate-limit · JWT · RBAC · Zod · sanitize-html
                 │  registro de eventos (logs/security.log)
                 ▼
             db (PostgreSQL 16)          red interna de Docker, puerto NO publicado
```

| Componente | Carpeta | Responsabilidad |
| --- | --- | --- |
| API REST | `backend/src` | Autenticación, autorización por rol, incidentes, auditoría |
| Base de datos | `backend/prisma` | Modelos `User` e `Incident`, migraciones versionadas |
| Scripts | `backend/scripts` | `backup.sh` (cifrado) y `restore.sh` (con verificación) |
| SPA | `frontend/src` | Login y panel según el rol |
| Documentación | `docs/` | Plan de implantación, checklist, contingencia, evidencias |

## 2. Instalación

### Opción A — Docker Compose (recomendada)

Requisitos: Docker y Docker Compose. Los puertos 3000 y 5173 deben estar libres.

```bash
cp .env.docker.example .env.docker
# Editar .env.docker y reemplazar los valores CAMBIAR_...:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # JWT_SECRET

docker compose --env-file .env.docker up -d --build
docker compose --env-file .env.docker exec backend node prisma/seed.js    # usuarios de prueba
```

Abrir http://localhost:5173. Las migraciones se aplican solas al arrancar
(`prisma migrate deploy`).

### Opción B — Local (desarrollo)

Requisitos: Node 20+ y PostgreSQL 16.

```bash
cd backend
cp .env.example .env        # completar DATABASE_URL, JWT_SECRET y BACKUP_PASSPHRASE
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev                 # http://localhost:3000

cd ../frontend
npm install
npm run dev                 # http://localhost:5173
```

## 3. Variables de entorno

Los archivos reales (`.env`, `.env.docker`) **no se versionan**. Las plantillas
`backend/.env.example` y `.env.docker.example` no contienen secretos.

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Firma de los tokens (mínimo 64 caracteres aleatorios) |
| `FRONTEND_ORIGIN` | Único origen autorizado por CORS |
| `APP_VERSION`, `BUILD_ID` | Trazabilidad expuesta en `/meta/version` |
| `BACKUP_PASSPHRASE` | Frase para cifrar los backups con AES-256 |
| `BACKUP_OFFSITE_DIR` | (Opcional) carpeta en otro disco para la copia externa |
| `AUDIT_LOG_FILE` | (Opcional) ruta del registro de eventos, por defecto `logs/security.log` |

## 4. Usuarios y roles de prueba

Solo para ambientes de desarrollo y pruebas.

| Correo | Contraseña | Rol | Puede |
| --- | --- | --- | --- |
| admin@securedesk.com | `Admin123*` | ADMIN | Todo: estadísticas, activar/desactivar usuarios, auditoría, ver correos completos |
| analista@securedesk.com | `Analista123*` | ANALISTA | Registrar y consultar incidentes (correos enmascarados) |
| consulta@securedesk.com | `Consulta123*` | CONSULTA | Consultar incidentes (correos enmascarados) |

## 5. Endpoints

No se usa prefijo `/api`.

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/health` | Público | Estado del servicio |
| GET | `/meta/version` | Público | Versión y build desplegados |
| POST | `/auth/login` | Público, 30 intentos / 15 min | Devuelve un JWT (1 h) |
| GET | `/auth/me` | JWT | Datos del token |
| GET | `/admin/stats` | JWT + ADMIN | Usuarios activos e incidentes |
| PATCH | `/admin/users/:id/deactivate` | JWT + ADMIN | Desactiva un usuario (borrado lógico) |
| PATCH | `/admin/users/:id/activate` | JWT + ADMIN | Reactiva un usuario |
| GET | `/admin/audit` | JWT + ADMIN | Últimos 50 eventos de seguridad |
| POST | `/incidents` | JWT | Registra un incidente (validado y sanitizado) |
| GET | `/incidents` | JWT | Últimos 20 incidentes |

## 6. Controles de seguridad

| Tipo | Control | Dónde |
| --- | --- | --- |
| Preventivo | Contraseñas con hash bcrypt (costo 10) | `prisma/seed.js`, `auth.controller.js` |
| Preventivo | JWT firmado con expiración de 1 h | `auth.controller.js`, `auth.middleware.js` |
| Preventivo | RBAC verificado en el servidor (401 / 403) | `roles.middleware.js`, `admin.routes.js` |
| Preventivo | Validación de entradas con Zod | controladores |
| Preventivo | Sanitización de HTML (XSS almacenado) | `utils/sanitize.js` |
| Preventivo | Consultas parametrizadas (Prisma ORM) | todo acceso a datos |
| Preventivo | Helmet, CORS con lista blanca, límite de 1 MB | `app.js` |
| Preventivo | Rate limit en `/auth` | `rate-limit.middleware.js` |
| Preventivo | Secretos fuera del código | `.env.example`, `.gitignore`, `.dockerignore` |
| Preventivo | Enmascaramiento de correos según rol | `incidents.controller.js` |
| Detectivo | Registro de eventos de seguridad (JSON Lines) | `utils/audit.js` |
| Detectivo | Log HTTP (morgan) y `/health` con healthcheck | `app.js`, `docker-compose.yml` |
| Detectivo | Suite de pruebas de seguridad | `backend/tests` |
| Correctivo | Manejo centralizado de errores sin trazas | `error.middleware.js` |
| Correctivo | Backup cifrado + SHA-256 + restauración verificada | `scripts/` |
| Correctivo | Plan de contingencia y reversa | `docs/contingency-plan.md` |

### Registro de eventos

Cada evento queda en `backend/logs/security.log` (un JSON por línea) y se
consulta con `GET /admin/audit`. Eventos: `LOGIN_SUCCESS`, `LOGIN_FAILED`,
`AUTH_REJECTED`, `ACCESS_DENIED`, `RATE_LIMIT_EXCEEDED`, `USER_ACTIVATED`,
`USER_DEACTIVATED`, `INCIDENT_CREATED`. Nunca se registran contraseñas ni tokens.

## 7. Pruebas

```bash
cd backend
npm run verify:preprod      # 11 pruebas, criterio de salida: fail 0
```

| Archivo | Qué comprueba |
| --- | --- |
| `health.test.js` | `/health` responde 200 con cabeceras de Helmet |
| `routes.test.js` | Ruta inexistente responde 404 en JSON |
| `security.test.js` | CORS permitido y bloqueado, Zod 400, 401 sin token, 403 por rol |
| `meta.test.js` | `/meta/version` devuelve versión y build |
| `audit.test.js` | 403 y 401 quedan registrados, sin exponer el token |

## 8. Backup y restauración

```bash
cd backend
./scripts/backup.sh
# -> backups/securedesk_<fecha>.sql.gz.enc  (+ .sha256)

./scripts/restore.sh backups/securedesk_<fecha>.sql.gz.enc
# 1. verifica la huella SHA-256   2. crea backups/pre-restore_<fecha>...
# 3. descifra, descomprime y restaura con psql
```

En Docker: `docker compose --env-file .env.docker exec backend ./scripts/backup.sh`.
Los backups y el registro de eventos viven en los volúmenes `backups` y `logs`,
así que sobreviven a la recreación del contenedor.

Objetivos de continuidad: **RTO 1 hora**, **RPO 24 horas** con backup diario
(ver `docs/contingency-plan.md`).

## 9. Evidencias y documentación

| Documento | Ruta |
| --- | --- |
| Plan de implantación | `docs/deployment-plan.md` |
| Checklist preproducción | `docs/preprod-checklist.md` |
| Plan de contingencia y reversa | `docs/contingency-plan.md` |
| Evidencias clase 08 | `docs/evidencias-clase08/` |
| Evidencias clase 09 (Docker) | `docs/evidencias-clase09/` |
| Evidencias del plan de mejoramiento | `docs/evidencias-plan-mejoramiento/` |
| Mapa de archivos por clase | `MAPA-ARCHIVOS.md` |

## 10. Riesgos pendientes (aceptados y documentados)

- El JWT se guarda en `localStorage`. Lo mitigan la sanitización y la CSP de
  Helmet; la mejora es una cookie `HttpOnly; Secure; SameSite=Strict`.
- Si se desactiva un usuario, su token sigue siendo válido hasta que expira (máximo 1 h).
- El frontend se sirve por HTTP; en producción debe ir detrás de HTTPS/TLS.
