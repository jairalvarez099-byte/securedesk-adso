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
