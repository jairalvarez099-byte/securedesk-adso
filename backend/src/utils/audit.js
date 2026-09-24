import fs from "node:fs";
import path from "node:path";

// Registro de eventos de seguridad en formato JSON Lines (un evento por linea).
// Nunca se registran contrasenas, tokens ni el cuerpo de la peticion.
export function auditLog(event, req, details = {}) {
  const entry = {
    time: new Date().toISOString(),
    event,
    userId: req?.user?.id ?? null,
    role: req?.user?.role ?? null,
    ip: req?.ip ?? null,
    method: req?.method ?? null,
    path: req?.originalUrl ?? null,
    ...details,
  };

  // En la suite de pruebas solo se escribe si la prueba define su propio archivo.
  if (process.env.NODE_TEST_CONTEXT && !process.env.AUDIT_LOG_FILE) {
    return entry;
  }

  const file = process.env.AUDIT_LOG_FILE || "logs/security.log";

  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, `${JSON.stringify(entry)}\n`);
  } catch (error) {
    console.error("[AUDIT] No se pudo escribir el registro:", error.message);
  }

  return entry;
}

export function readAuditLog(limit = 50) {
  const file = process.env.AUDIT_LOG_FILE || "logs/security.log";

  if (!fs.existsSync(file)) {
    return [];
  }

  return fs
    .readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .slice(-limit)
    .map((line) => JSON.parse(line))
    .reverse();
}
