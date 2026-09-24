import { auditLog } from "../utils/audit.js";

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      auditLog("ACCESS_DENIED", req, { requiredRoles: allowedRoles });
      return res
        .status(403)
        .json({ message: "No autorizado para este recurso" });
    }

    next();
  };
}
