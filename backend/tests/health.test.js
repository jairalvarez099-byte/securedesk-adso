import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { createApp } from "../src/app.js";

test("GET /health responde 200 y Helmet activo", async () => {
  const app = createApp("http://localhost:5173");
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
});
