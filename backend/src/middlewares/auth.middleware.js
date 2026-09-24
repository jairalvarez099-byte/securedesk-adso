import jwt from "jsonwebtoken";

import { auditLog } from "../utils/audit.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    auditLog("AUTH_REJECTED", req, { reason: "token ausente" });
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    return next();
  } catch {
    auditLog("AUTH_REJECTED", req, { reason: "token invalido o expirado" });
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
}
