import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import incidentsRoutes from "./modules/incidents/incidents.routes.js";
import metaRoutes from "./modules/meta/meta.routes.js";
import { authLimiter } from "./middlewares/rate-limit.middleware.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/error.middleware.js";

export function createApp(frontendOrigin = "http://localhost:5173") {
  const app = express();

  app.use(helmet());
  // Lista blanca: con un array el paquete cors compara el header Origin y solo
  // expone Access-Control-Allow-Origin cuando el origen esta autorizado.
  app.use(cors({ origin: [frontendOrigin] }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("combined"));

  app.get("/health", (req, res) => {
    return res.json({
      ok: true,
      message: "Backend funcionando correctamente",
    });
  });

  app.use("/auth", authLimiter, authRoutes);
  app.use("/admin", adminRoutes);
  app.use("/incidents", incidentsRoutes);
  app.use("/meta", metaRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
