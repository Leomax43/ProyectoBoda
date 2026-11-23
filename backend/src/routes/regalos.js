import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/regalos — Lista de regalos activos ordenados por precio
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, titulo, descripcion, precio, imagen_url
       FROM regalos
       WHERE activo = TRUE
       ORDER BY precio ASC, id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener regalos:", err);
    res.status(500).json({ error: "Error al cargar los regalos" });
  }
});

export default router;