import rateLimit from "express-rate-limit";

import { auditLog } from "../utils/audit.js";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    auditLog("RATE_LIMIT_EXCEEDED", req);
    return res.status(options.statusCode).json({
      message: "Demasiados intentos, intente mas tarde",
    });
  },
});
