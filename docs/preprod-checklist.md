# Checklist Preproducción - SecureDesk
Marcar [x] únicamente después de verificar.

## Código y pruebas
- [ ] npm run verify:preprod termina con 0 fallos.
- [ ] npm run dev inicia sin errores.
- [ ] No existen imports rotos.

## Configuración
- [ ] .env no está versionado.
- [ ] JWT_SECRET está definido.
- [ ] DATABASE_URL corresponde al ambiente.
- [ ] FRONTEND_ORIGIN corresponde al ambiente.
- [ ] APP_VERSION está definida.
- [ ] BUILD_ID está definido.

## Seguridad
- [ ] Helmet está activo.
- [ ] CORS está restringido.
- [ ] Rate limit está activo.
- [ ] Login inválido responde 400.
- [ ] Ruta protegida sin JWT responde 401.
- [ ] ANALISTA en /admin responde 403.

## Datos
- [ ] Prisma valida el schema.
- [ ] Migraciones están versionadas.
- [ ] Backup previo fue generado.
- [ ] El backup no está en Git.

## Funcional
- [ ] GET /health responde 200.
- [ ] POST /auth/login funciona.
- [ ] GET /admin/stats funciona con ADMIN.
- [ ] GET /incidents exige JWT.
- [ ] GET /meta/version responde 200.

## Documentación
- [ ] contingency-plan.md está actualizado.
- [ ] deployment-plan.md está actualizado.
- [ ] Evidencias del despliegue están guardadas.

## Aprobación
Responsable técnico: ______________________
Responsable QA: ______________________
Fecha: ______________________
