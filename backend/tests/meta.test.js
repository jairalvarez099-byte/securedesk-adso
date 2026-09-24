import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

test("GET /meta/version responde datos de version", async () => {
  process.env.APP_VERSION = "1.0.0";
  process.env.BUILD_ID = "test-build";

  const app = createApp("http://localhost:5173");
  const response = await request(app).get("/meta/version");

  assert.equal(response.status, 200);
  assert.equal(response.body.app, "securedesk-backend");
  assert.equal(response.body.version, "1.0.0");
  assert.equal(response.body.build, "test-build");
  assert.ok(response.body.generatedAt);
});
