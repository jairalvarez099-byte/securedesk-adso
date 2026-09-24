import { Router } from "express";

const router = Router();

router.get(
  "/version",
  (req, res) => {
    return res.json({
      app: "securedesk-backend",
      version: process.env.APP_VERSION || "1.0.0",
      build: process.env.BUILD_ID || "local",
      generatedAt: new Date().toISOString(),
    });
  }
);

export default router;
