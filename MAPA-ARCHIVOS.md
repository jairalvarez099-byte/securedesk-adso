# Mapa de archivos por clase — SecureDesk ADSO

Guia para entregar o subir los archivos uno a uno. Las rutas son exactas y
relativas a la raiz del proyecto (`~/Desktop/frontend`).

Leyenda: **N** = archivo nuevo en esa clase · **M** = archivo modificado en esa clase.

---

## Clase 01 — Montaje base full stack

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `backend/package.json` | Dependencias y scripts (`"type": "module"`) |
| N | `backend/src/index.js` | Servidor Express con `GET /health` |
| N | `frontend/package.json` | Proyecto React + Vite |
| N | `frontend/index.html` | Documento raiz del SPA |
| N | `frontend/vite.config.js` | Configuracion de Vite |
| N | `frontend/src/main.jsx` | Punto de montaje de React |
| N | `.gitignore` | Exclusiones del monorepo |

## Clase 02 — Autenticacion real con JWT, bcrypt y Prisma

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `backend/prisma.config.ts` | Configuracion de Prisma |
| N | `backend/prisma/schema.prisma` | Modelo `User` |
| N | `backend/prisma/seed.js` | Usuarios ADMIN / ANALISTA / CONSULTA |
| N | `backend/prisma/migrations/20260806154934_init_auth/migration.sql` | Migracion inicial |
| N | `backend/src/lib/prisma.js` | Cliente Prisma compartido |
| N | `backend/src/middlewares/auth.middleware.js` | Verificacion del JWT |
| N | `backend/src/modules/auth/auth.controller.js` | `login()` y `me()` |
| N | `backend/src/modules/auth/auth.routes.js` | `POST /login`, `GET /me` |
| M | `backend/src/index.js` | Monta `app.use("/auth", authRoutes)` |
| N | `frontend/src/pages/Login.jsx` | Formulario de autenticacion |

## Clase 03 — Control de acceso por rol (RBAC)

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `backend/src/middlewares/roles.middleware.js` | `authorizeRoles(...allowedRoles)` |
| N | `backend/src/modules/admin/admin.routes.js` | `GET /admin/stats` restringido a ADMIN |
| M | `backend/src/index.js` | Monta `app.use("/admin", adminRoutes)` |
| M | `frontend/src/App.jsx` | UI condicional segun el rol |

## Clase 04 — Controles preventivos, detectivos y correctivos

Instalar antes: `npm i express-rate-limit morgan zod`

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `backend/src/middlewares/error.middleware.js` | `notFoundHandler` y `errorHandler` |
| N | `backend/src/middlewares/rate-limit.middleware.js` | `authLimiter` (30 / 15 min) |
| M | `backend/src/modules/auth/auth.controller.js` | Validacion con Zod y `next(error)` |
| M | `backend/src/index.js` | Helmet, CORS, Morgan, limite de 1mb y handlers |

## Clase 05 — Ambientes, configuracion y datos

Instalar antes: `npm i sanitize-html`

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `backend/.env.example` | Plantilla publica de variables |
| M | `backend/.env` | Variables reales (NO se versiona) |
| M | `backend/.gitignore` | `.env`, `.env.*`, `!.env.example` |
| M | `backend/prisma/schema.prisma` | `Incident`, enum `IncidentSeverity`, relacion 1:N |
| N | `backend/prisma/migrations/20260910115803_add_incidents/migration.sql` | Migracion `add_incidents` |
| N | `backend/src/utils/sanitize.js` | `sanitizeText()` con sanitize-html |
| N | `backend/src/modules/incidents/incidents.controller.js` | Zod, `maskEmail()`, `createIncident`, `listIncidents` |
| N | `backend/src/modules/incidents/incidents.routes.js` | `POST /` y `GET /` con `authMiddleware` |
| M | `backend/src/middlewares/error.middleware.js` | `ZodError` devuelve 400 |
| M | `backend/src/index.js` | Monta `app.use("/incidents", incidentsRoutes)` |

## Clase 06 — Gestion segura de usuarios, backups y continuidad

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `backend/src/modules/admin/admin.controller.js` | `getStats`, `deactivateUser`, `activateUser`, `safeUserSelect` |
| M | `backend/src/modules/admin/admin.routes.js` | Tres rutas con `authMiddleware` + `authorizeRoles("ADMIN")` |
| N | `backend/scripts/backup.sh` | `pg_dump` con timestamp |
| N | `backend/scripts/restore.sh` | `psql` con backup previo de seguridad |
| M | `backend/.gitignore` | Agrega `backups/` |
| N | `docs/contingency-plan.md` | Plan de contingencia (6 secciones) |

## Clase 07 — Pruebas minimas de seguridad y verificacion preproduccion

Instalar antes: `npm i -D supertest`

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `backend/src/app.js` | `createApp()`: configura Express, NO escucha |
| M | `backend/src/index.js` | Solo carga el entorno y llama `app.listen()` |
| N | `backend/tests/health.test.js` | `/health` + Helmet |
| N | `backend/tests/security.test.js` | CORS, Zod 400, 401 y 403 |
| N | `backend/tests/routes.test.js` | 404 centralizado |
| M | `backend/package.json` | Scripts `test` y `verify:preprod` |

## Clase 08 — Documentacion formal del plan de implantacion

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| M | `backend/.env.example` | Agrega `APP_VERSION` y `BUILD_ID` |
| M | `backend/.env` | Agrega `APP_VERSION` y `BUILD_ID` (NO se versiona) |
| N | `backend/src/modules/meta/meta.routes.js` | `GET /meta/version` |
| M | `backend/src/app.js` | Monta `app.use("/meta", metaRoutes)` antes de `notFoundHandler` |
| N | `backend/tests/meta.test.js` | Prueba de trazabilidad de version |
| N | `docs/deployment-plan.md` | Plan de implantacion segura (9 secciones) |
| N | `docs/preprod-checklist.md` | Checklist preproduccion para firmar |

## Clase 09 — Caso integrador y despliegue controlado (Docker Compose)

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `.env.docker.example` | Plantilla de variables Docker (SI se versiona) |
| N | `.env.docker` | Variables reales Docker (NO se versiona) |
| M | `.gitignore` | Agrega `.env.docker` |
| N | `docker-compose.yml` | Servicios `db`, `backend`, `frontend` y volumen `pgdata` |
| N | `backend/Dockerfile` | Imagen del backend (pg_dump 16 desde PGDG, `migrate deploy`) |
| N | `backend/.dockerignore` | Excluye `.env`, `backups`, `tests`, `node_modules` |
| M | `backend/package.json` | `prisma` pasa a `dependencies` (lo usa `migrate deploy` en el contenedor) |
| M | `backend/scripts/backup.sh` | Borra el archivo si `pg_dump` falla (no deja backups vacios) |
| N | `frontend/Dockerfile` | Build multi-etapa Node -> Nginx |
| N | `frontend/.dockerignore` | Excluye `node_modules`, `dist`, `.env*` |
| N | `frontend/nginx.conf` | `try_files` para la SPA |
| M | `frontend/src/services/api.js` | `API_URL` unica y `apiFetch()` |
| M | `frontend/src/pages/Login.jsx` | Usa `apiFetch` (sin URL hardcodeada) |
| M | `frontend/src/App.jsx` | Usa `apiFetch` |

Comando: `docker compose --env-file .env.docker up -d --build`
(el puerto 3000 debe estar libre: detener antes `lab-juiceshop`).

## Plan de mejoramiento

| | Ruta exacta | Contenido |
| - | ----------- | --------- |
| N | `backend/src/utils/audit.js` | `auditLog()` y `readAuditLog()` en JSON Lines |
| M | `backend/src/modules/auth/auth.controller.js` | Registra `LOGIN_SUCCESS` y `LOGIN_FAILED` |
| M | `backend/src/middlewares/auth.middleware.js` | Registra `AUTH_REJECTED` |
| M | `backend/src/middlewares/roles.middleware.js` | Registra `ACCESS_DENIED` |
| M | `backend/src/middlewares/rate-limit.middleware.js` | Registra `RATE_LIMIT_EXCEEDED` |
| M | `backend/src/modules/admin/admin.controller.js` | Registra activacion/desactivacion y `getAuditLog` |
| M | `backend/src/modules/admin/admin.routes.js` | `GET /admin/audit` solo ADMIN |
| M | `backend/src/modules/incidents/incidents.controller.js` | Registra `INCIDENT_CREATED` |
| N | `backend/tests/audit.test.js` | 403 y 401 quedan registrados sin exponer el token |
| M | `backend/scripts/backup.sh` | Cifrado AES-256, SHA-256, prefijo y copia externa |
| M | `backend/scripts/restore.sh` | Verifica SHA-256, descifra y usa prefijo `pre-restore` |
| M | `backend/.env.example`, `.env.docker.example` | `BACKUP_PASSPHRASE`, `BACKUP_OFFSITE_DIR` |
| M | `docker-compose.yml` | Volumenes `backups` y `logs` |
| M | `frontend/src/App.jsx`, `pages/Login.jsx` | Sesion sin recargar y boton Cerrar sesion |
| M | `docs/contingency-plan.md` | Seccion 7: respaldo, RTO/RPO y reversa |
| M | `README.md` | Instalacion, usuarios, controles, pruebas y enlaces |

---

## Orden recomendado si hay que subir archivo por archivo

1. `backend/package.json`
2. `backend/prisma.config.ts`
3. `backend/prisma/schema.prisma`
4. `backend/prisma/seed.js`
5. `backend/.env.example`
6. `backend/.gitignore`
7. `backend/src/lib/prisma.js`
8. `backend/src/utils/sanitize.js`
9. `backend/src/middlewares/auth.middleware.js`
10. `backend/src/middlewares/roles.middleware.js`
11. `backend/src/middlewares/rate-limit.middleware.js`
12. `backend/src/middlewares/error.middleware.js`
13. `backend/src/modules/auth/auth.controller.js`
14. `backend/src/modules/auth/auth.routes.js`
15. `backend/src/modules/admin/admin.controller.js`
16. `backend/src/modules/admin/admin.routes.js`
17. `backend/src/modules/incidents/incidents.controller.js`
18. `backend/src/modules/incidents/incidents.routes.js`
19. `backend/src/app.js`
20. `backend/src/index.js`
21. `backend/tests/health.test.js`
22. `backend/tests/security.test.js`
23. `backend/tests/routes.test.js`
24. `backend/scripts/backup.sh`
25. `backend/scripts/restore.sh`
26. `docs/contingency-plan.md`
27. `frontend/src/services/api.js`
28. `frontend/src/pages/Login.jsx`
29. `frontend/src/App.jsx`
30. `frontend/.env.example`

**No subir nunca:** `backend/.env`, `backend/backups/*.sql`, `node_modules/`, `dist/`.
