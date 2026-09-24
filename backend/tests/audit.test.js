import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import jwt from "jsonwebtoken";

import { createApp } from "../src/app.js";

function useTempAuditFile() {
  const file = path.join(os.tmpdir(), `securedesk-audit-${Date.now()}.log`);
  process.env.AUDIT_LOG_FILE = file;
  return file;
}

function readEvents(file) {
  return fs
    .readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

test("Un 403 queda registrado como ACCESS_DENIED sin exponer el token", async () => {
  const file = useTempAuditFile();
  process.env.JWT_SECRET = process.env.JWT_SECRET || "secreto-de-prueba";

  const token = jwt.sign(
    { id: 2, email: "analista@securedesk.com", role: "ANALISTA" },
    process.env.JWT_SECRET,
  );

  const app = createApp("http://localhost:5173");
  await request(app)
    .get("/admin/stats")
    .set("Authorization", `Bearer ${token}`);

  const [event] = readEvents(file);
  assert.equal(event.event, "ACCESS_DENIED");
  assert.equal(event.userId, 2);
  assert.equal(event.role, "ANALISTA");
  assert.equal(event.path, "/admin/stats");
  assert.ok(!fs.readFileSync(file, "utf8").includes(token));
});

test("Una peticion sin token queda registrada como AUTH_REJECTED", async () => {
  const file = useTempAuditFile();

  const app = createApp("http://localhost:5173");
  await request(app).get("/incidents");

  const [event] = readEvents(file);
  assert.equal(event.event, "AUTH_REJECTED");
  assert.equal(event.reason, "token ausente");
});
