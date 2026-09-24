import { ZodError } from "zod";

export function notFoundHandler(req, res) {
  return res.status(404).json({
    message: "Ruta no encontrada",
  });
}

// eslint-disable-next-line no-unused-vars -- Express identifica el handler de errores por su aridad.
export function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Datos de entrada invalidos",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  return res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Error interno del servidor"
        : err.message || "Solicitud invalida",
  });
}
