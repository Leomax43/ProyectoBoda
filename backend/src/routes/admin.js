import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// POST /api/admin/login — Verifica la contraseña
router.post("/login", (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }
  res.json({ ok: true });
});

// Todas las rutas siguientes requieren el header x-admin-password
router.use(requireAdmin);

// GET /api/admin/regalos — Todos los regalos (activos e inactivos)
router.get("/regalos", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM regalos ORDER BY activo DESC, precio ASC, id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar regalos" });
  }
});

// POST /api/admin/regalos — Crear regalo
router.post("/regalos", async (req, res) => {
  const { titulo, descripcion, precio, imagen_url } = req.body;
  if (!titulo?.trim() || !Number.isInteger(Number(precio)) || Number(precio) <= 0) {
    return res.status(400).json({ error: "Título y precio válido son obligatorios" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO regalos (titulo, descripcion, precio, imagen_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [titulo.trim(), descripcion?.trim() || null, Number(precio), imagen_url?.trim() || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear regalo" });
  }
});

// PUT /api/admin/regalos/:id — Editar regalo
router.put("/regalos/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, precio, imagen_url, activo } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE regalos
       SET titulo = COALESCE($1, titulo),
           descripcion = $2,
           precio = COALESCE($3, precio),
           imagen_url = $4,
           activo = COALESCE($5, activo)
       WHERE id = $6
       RETURNING *`,
      [
        titulo?.trim() || null,
        descripcion?.trim() || null,
        precio ? Number(precio) : null,
        imagen_url?.trim() || null,
        typeof activo === "boolean" ? activo : null,
        id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Regalo no encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar regalo" });
  }
});

// DELETE /api/admin/regalos/:id — Borra si no tiene aportes; si ya lo regalaron, solo lo desactiva
router.delete("/regalos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows: usados } = await pool.query(
      "SELECT 1 FROM aporte_items WHERE regalo_id = $1 LIMIT 1",
      [id]
    );

    if (usados.length > 0) {
      await pool.query("UPDATE regalos SET activo = FALSE WHERE id = $1", [id]);
      return res.json({ ok: true, archivado: true });
    }

    await pool.query("DELETE FROM regalos WHERE id = $1", [id]);
    res.json({ ok: true, archivado: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar regalo" });
  }
});

// GET /api/admin/aportes — Quién regaló qué, dedicatorias y estado de transferencia
router.get("/aportes", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.nombre_invitado,
        a.email_invitado,
        a.mensaje,
        a.monto_total,
        a.estado,
        a.creado_en,
        COALESCE(
          json_agg(
            json_build_object(
              'titulo', r.titulo,
              'cantidad', ai.cantidad,
              'precio_unitario', ai.precio_unitario
            )
          ) FILTER (WHERE ai.id IS NOT NULL),
          '[]'
        ) AS items
      FROM aportes a
      LEFT JOIN aporte_items ai ON ai.aporte_id = a.id
      LEFT JOIN regalos r ON r.id = ai.regalo_id
      GROUP BY a.id
      ORDER BY a.creado_en DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar aportes" });
  }
});

// PATCH /api/admin/aportes/:id/estado — Marcar transferencia como 'recibido' o 'pendiente'
router.patch("/aportes/:id/estado", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["pendiente", "recibido"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  try {
    const { rows } = await pool.query(
      "UPDATE aportes SET estado = $1 WHERE id = $2 RETURNING id, estado",
      [estado, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Aporte no encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

export default router;