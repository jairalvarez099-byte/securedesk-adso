import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { createApp } from "../src/app.js";

test("Ruta inexistente responde JSON 404", async () => {
  const app = createApp("http://localhost:5173");
  const response = await request(app).get("/ruta-inexistente");

  assert.equal(response.status, 404);
  assert.equal(response.body.message, "Ruta no encontrada");
});
