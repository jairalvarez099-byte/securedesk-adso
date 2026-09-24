import dotenv from "dotenv";

import { createApp } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const app = createApp(FRONTEND_ORIGIN);

app.listen(PORT, () => {
  console.log(`Servidor backend activo en http://localhost:${PORT}`);
});
