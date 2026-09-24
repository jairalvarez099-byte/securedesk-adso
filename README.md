# SecureDesk ADSO — Proyecto Fullstack

Proyecto incremental del curso de seguridad (Clases 01 a 07). Monorepo con dos
aplicaciones independientes.

```
.
├── backend/                        API REST (Express + Prisma + PostgreSQL)
│   ├── prisma/
│   │   ├── migrations/             Migraciones generadas por Prisma
│   │   ├── schema.prisma           Modelos User e Incident
│   │   └── seed.js                 Usuarios iniciales
│   ├── scripts/
│   │   ├── backup.sh               Copia logica de la BD con timestamp
│   │   └── restore.sh              Restauracion controlada desde un backup
│   ├── src/
│   │   ├── lib/prisma.js           Cliente Prisma compartido
│   │   ├── middlewares/            auth, roles, rate-limit y errores
│   │   ├── modules/auth/           Autenticacion (JWT + bcrypt)
│   │   ├── modules/admin/          Estadisticas y gestion de usuarios
│   │   ├── modules/incidents/      Registro y consulta de incidentes
│   │   ├── utils/sanitize.js       Sanitizacion de texto (sanitize-html)
│   │   ├── app.js                  createApp(): configura Express, no escucha
│   │   └── index.js                Punto de arranque: app.listen()
│   ├── tests/                      Suite node:test + Supertest
│   ├── .env.example
│   └── package.json
│
├── docs/contingency-plan.md        Plan de contingencia y rollback
│
└── frontend/                       SPA (React 19 + Vite)
    ├── src/
    │   ├── pages/Login.jsx         Formulario de autenticacion
    │   ├── services/api.js         Cliente HTTP hacia el backend
    │   ├── App.jsx                 Dashboard con permisos por rol
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

## Puesta en marcha

### Backend

```bash
cd backend
cp .env.example .env          # ajusta DATABASE_URL y JWT_SECRET
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev                   # http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env          # opcional, usa http://localhost:3000 por defecto
npm install
npm run dev                   # http://localhost:5173
```

## Endpoints

El proyecto **no** usa prefijo `/api`.

| Metodo | Ruta                              | Acceso              | Descripcion                          |
| ------ | --------------------------------- | ------------------- | ------------------------------------ |
| GET    | `/health`                         | Publico             | Estado del servicio                  |
| POST   | `/auth/login`                     | Publico (rate-limit)| Devuelve un JWT                      |
| GET    | `/auth/me`                        | JWT                 | Perfil del token                     |
| GET    | `/admin/stats`                    | JWT + ADMIN         | Usuarios activos e incidentes        |
| PATCH  | `/admin/users/:id/deactivate`     | JWT + ADMIN         | Desactiva un usuario                 |
| PATCH  | `/admin/users/:id/activate`       | JWT + ADMIN         | Activa un usuario                    |
| POST   | `/incidents`                      | JWT                 | Registra un incidente                |
| GET    | `/incidents`                      | JWT                 | Ultimos 20 incidentes                |

## Controles de seguridad

- **Preventivos**: Helmet, CORS con lista blanca, `express.json({ limit: "1mb" })`,
  rate-limit en `/auth` (30 peticiones / 15 min), validacion con Zod,
  sanitizacion con sanitize-html, hash bcrypt, `safeUserSelect` sin `passwordHash`.
- **Detectivos**: Morgan en formato `combined`.
- **Correctivos**: `notFoundHandler` y `errorHandler` centralizados,
  scripts de backup/restore y plan de contingencia documentado.

## Privacidad de datos

`reporterEmail` se devuelve completo solo al rol ADMIN. ANALISTA y CONSULTA
reciben el correo enmascarado (`ju***@empresa.com`).

## Pruebas

```bash
cd backend
npm run test              # node:test + Supertest
npm run verify:preprod    # verificacion previa a preproduccion (debe dar fail 0)
```

## Respaldo y continuidad

```bash
cd backend
./scripts/backup.sh                                  # genera backups/securedesk_<timestamp>.sql
./scripts/restore.sh backups/securedesk_<ts>.sql     # restaura (crea un backup previo)
```

El procedimiento completo esta en [`docs/contingency-plan.md`](docs/contingency-plan.md).

## Usuarios del seed

| Email                      | Password       | Rol      |
| -------------------------- | -------------- | -------- |
| admin@securedesk.com       | `Admin123*`    | ADMIN    |
| analista@securedesk.com    | `Analista123*` | ANALISTA |
| consulta@securedesk.com    | `Consulta123*` | CONSULTA |
