import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import regalosRoutes from "./routes/regalos.js";
import aportesRoutes from "./routes/aportes.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Origen no permitido por CORS"));
    },
  })
);

app.use(express.json());

// Health check (útil para probar Neon y para mantener despierto a Render)
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("Health check falló:", err);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.use("/api/regalos", regalosRoutes);
app.use("/api/aportes", aportesRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});