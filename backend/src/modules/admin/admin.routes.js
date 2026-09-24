import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/roles.middleware.js";
import {
  getStats,
  deactivateUser,
  activateUser,
  getAuditLog,
} from "./admin.controller.js";

const router = Router();

router.get("/stats", authMiddleware, authorizeRoles("ADMIN"), getStats);

router.patch(
  "/users/:id/deactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deactivateUser,
);

router.patch(
  "/users/:id/activate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  activateUser,
);

router.get("/audit", authMiddleware, authorizeRoles("ADMIN"), getAuditLog);

export default router;
