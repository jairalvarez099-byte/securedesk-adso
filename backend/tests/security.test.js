import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

import { createApp } from "../src/app.js";

const FRONTEND_ORIGIN = "http://localhost:5173";

test("CORS expone header para el origen permitido", async () => {
  const app = createApp(FRONTEND_ORIGIN);
  const response = await request(app)
    .get("/health")
    .set("Origin", FRONTEND_ORIGIN);

  assert.equal(
    response.headers["access-control-allow-origin"],
    FRONTEND_ORIGIN,
  );
});

test("CORS no expone header para otro origen", async () => {
  const app = createApp(FRONTEND_ORIGIN);
  const response = await request(app)
    .get("/health")
    .set("Origin", "https://evil.example");

  assert.equal(response.headers["access-control-allow-origin"], undefined);
});

test("POST /auth/login invalido responde 400", async () => {
  const app = createApp(FRONTEND_ORIGIN);
  const response = await request(app).post("/auth/login").send({
    email: "correo-invalido",
    password: "123",
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, "Datos de entrada invalidos");
});

test("GET /auth/me sin token responde 401", async () => {
  const app = createApp(FRONTEND_ORIGIN);
  const response = await request(app).get("/auth/me");

  assert.equal(response.status, 401);
});

test("GET /incidents sin token responde 401", async () => {
  const app = createApp(FRONTEND_ORIGIN);
  const response = await request(app).get("/incidents");

  assert.equal(response.status, 401);
});

test("ANALISTA recibe 403 en /admin/stats", async () => {
  process.env.JWT_SECRET = "test_secret_securedesk_2026";

  const token = jwt.sign(
    {
      id: 999,
      email: "analista@test.local",
      role: "ANALISTA",
    },
    process.env.JWT_SECRET,
    { expiresIn: "5m" },
  );

  const app = createApp(FRONTEND_ORIGIN);
  const response = await request(app)
    .get("/admin/stats")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 403);
});
