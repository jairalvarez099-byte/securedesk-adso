import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { createIncident, listIncidents } from "./incidents.controller.js";

const router = Router();

router.post("/", authMiddleware, createIncident);

router.get("/", authMiddleware, listIncidents);

export default router;
