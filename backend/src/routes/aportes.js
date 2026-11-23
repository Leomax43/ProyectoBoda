import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// POST /api/aportes — Guarda la dedicatoria y los ítems elegidos
router.post("/", async (req, res) => {
  const { nombre_invitado, email_invitado, mensaje, items } = req.body;

  if (!nombre_invitado?.trim()) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Debes elegir al menos un regalo" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Obtener precios reales desde Neon
    const ids = items.map((i) => Number(i.regalo_id));
    const { rows: regalosDB } = await client.query(
      "SELECT id, precio FROM regalos WHERE id = ANY($1::int[]) AND activo = TRUE",
      [ids]
    );

    const precioPorId = new Map(regalosDB.map((r) => [r.id, r.precio]));
    let montoTotal = 0;
    const itemsValidados = [];

    for (const item of items) {
      const id = Number(item.regalo_id);
      const cantidad = Math.max(1, Math.floor(Number(item.cantidad) || 1));
      const precioUnitario = precioPorId.get(id);

      if (precioUnitario === undefined) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `El regalo #${id} no es válido` });
      }

      montoTotal += precioUnitario * cantidad;
      itemsValidados.push({ regalo_id: id, cantidad, precio_unitario: precioUnitario });
    }

    // 2. Insertar cabecera del aporte
    const { rows: aporteRows } = await client.query(
      `INSERT INTO aportes (nombre_invitado, email_invitado, mensaje, monto_total)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre_invitado, monto_total, estado, creado_en`,
      [
        nombre_invitado.trim(),
        email_invitado?.trim() || null,
        mensaje?.trim() || null,
        montoTotal,
      ]
    );

    const aporte = aporteRows[0];

    // 3. Insertar detalle de cada ítem
    for (const item of itemsValidados) {
      await client.query(
        `INSERT INTO aporte_items (aporte_id, regalo_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [aporte.id, item.regalo_id, item.cantidad, item.precio_unitario]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ ok: true, aporte });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al registrar aporte:", err);
    res.status(500).json({ error: "No se pudo registrar el regalo" });
  } finally {
    client.release();
  }
});

export default router;