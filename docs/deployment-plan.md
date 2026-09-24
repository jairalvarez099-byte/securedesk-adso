# Plan de Implantación Segura - SecureDesk

## 1. Objetivo
Implantar SecureDesk de forma controlada, reproducible, verificable
y reversible, manteniendo autenticación JWT, RBAC, validación de
entradas, protección de datos y continuidad operativa.

## 2. Alcance
Incluye:
- backend Express;
- frontend React + Vite;
- PostgreSQL;
- módulos auth, admin, incidents y meta;
- configuración por variables de entorno;
- migraciones Prisma;
- tests preproducción;
- backup previo;
- verificación posterior.

## 3. Fuera de alcance
- alta disponibilidad multi-región;
- SIEM empresarial;
- balanceador productivo;
- gestión externa de secretos;
- observabilidad distribuida.

## 4. Responsabilidades
### Responsable técnico
Ejecuta despliegue, migraciones y rollback.
### Responsable QA
Valida tests y checklist.
### Responsable de datos
Valida backup y recuperación.
### Responsable funcional
Confirma operación esperada.

## 5. Riesgos priorizados
### R1 - Base de datos no disponible
Mitigación: healthcheck, backup y rollback.
### R2 - Configuración incorrecta
Mitigación: variables separadas por ambiente.
### R3 - Acceso no autorizado
Mitigación: JWT + RBAC.
### R4 - Entrada maliciosa
Mitigación: Zod + sanitización.
### R5 - Regresión de código
Mitigación: node:test + Supertest.
### R6 - Pérdida de datos
Mitigación: backup previo y restore validado.

## 6. Controles activos
- Helmet; CORS restringido; JWT; RBAC; Rate limiting en /auth;
- Zod; sanitize-html; errorHandler centralizado;
- selección explícita de campos Prisma; backups PostgreSQL cifrados (AES-256 + SHA-256);
- registro de eventos de seguridad (logs/security.log, GET /admin/audit);
- tests automatizados.

## 7. Secuencia de implantación
1. Confirmar repositorio limpio.
2. Ejecutar npm run verify:preprod.
3. Ejecutar backup.
4. Confirmar variables de entorno.
5. Aplicar migraciones.
6. Desplegar backend y frontend.
7. Verificar /health.
8. Verificar /meta/version.
9. Verificar login.
10. Verificar RBAC.
11. Verificar incidents.
12. Registrar evidencias.

## 8. Rollback
Aplicar docs/contingency-plan.md.
No restaurar la base de datos salvo impacto real sobre los datos.

## 9. Evidencias
- salida de tests; nombre del backup; commit desplegado;
- respuesta /health; respuesta /meta/version;
- checklist firmado; resultado final.
