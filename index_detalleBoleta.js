// index_detalleBoleta.js
const express = require("express");
const cors = require("cors");
const pool = require("./db"); // mismo pool
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT_DETALLE_BOLETA || 4004;

// ============ CONFIGURACIÓN SWAGGER ============
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '📄 API Detalle Boleta - Sistema E-commerce',
      version: '1.0.0',
      description: 'API especializada para consulta detallada de boletas y transacciones',
      contact: {
        name: 'Soporte',
        email: 'soporte@ecommerce.com'
      }
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Servidor local' },
      { url: 'http://TU_IP_AWS:4004', description: 'Servidor AWS' }
    ],
    tags: [
      { name: 'DetalleBoleta', description: 'Operaciones de consulta de boletas' }
    ]
  },
  apis: ['./index_detalleBoleta.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ===============================================

app.use(express.json());
app.use(cors());


// ============================
// CREAR TABLA BOLETA SI NO EXISTE (MISMA QUE LA OTRA API)
// ============================
(async () => {
  try {
    await pool.query(`CREATE SEQUENCE IF NOT EXISTS seq_numero_compra START 1;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS boleta (
        id SERIAL PRIMARY KEY,
        numero_compra BIGINT UNIQUE DEFAULT nextval('seq_numero_compra'),
        fecha TIMESTAMP,
        comprador JSONB,
        productos JSONB,
        total NUMERIC,
        user_id INT
      );
    `);

    console.log("Tabla 'boleta' verificada/creada para DetalleBoleta API.");
  } catch (err) {
    console.error("Error asegurando tabla boleta en DetalleBoleta API:", err.stack || err);
  }
})();



/**
 * @swagger
 * /detalle/{numeroCompra}:
 *   get:
 *     tags: [DetalleBoleta]
 *     summary: Obtener detalle completo de boleta
 *     description: Consulta todos los detalles de una boleta por su número de compra
 *     parameters:
 *       - in: path
 *         name: numeroCompra
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de compra de la boleta
 *         example: "1001"
 *     responses:
 *       200:
 *         description: Detalle de boleta encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 numero_compra:
 *                   type: integer
 *                   example: 1001
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-14T10:30:00.000Z"
 *                 comprador:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     correo:
 *                       type: string
 *                       example: "juan@ejemplo.com"
 *                     direccion:
 *                       type: string
 *                       example: "Calle Principal 123"
 *                 productos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 15
 *                       nombre:
 *                         type: string
 *                         example: "Laptop Gamer"
 *                       precio:
 *                         type: number
 *                         example: 1299.99
 *                       cantidad:
 *                         type: integer
 *                         example: 1
 *                 total:
 *                   type: number
 *                   example: 125990
 *                 user_id:
 *                   type: integer
 *                   example: 5
 *       404:
 *         description: Boleta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Boleta no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
// ============================
// OBTENER DETALLE POR NUMERO_COMPRA
// ============================
app.get("/detalle/:numeroCompra", async (req, res) => {
  try {
    const { numeroCompra } = req.params;

    // Permite string o número (igual que la otra API)
    const num = Number(numeroCompra);

    const result = await pool.query(
      "SELECT * FROM boleta WHERE numero_compra=$1",
      [Number.isNaN(num) ? numeroCompra : num]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Boleta no encontrada" });
    }

    const boleta = result.rows[0];
    boleta.total = Number(boleta.total) || 0;

    res.json(boleta);
  } catch (err) {
    console.error("Error GET /detalle/:numeroCompra", err.stack || err);
    res.status(500).json({ message: "Error al obtener detalle de la boleta" });
  }
});


/**
 * @swagger
 * /detalle:
 *   get:
 *     tags: [DetalleBoleta]
 *     summary: Obtener todas las boletas
 *     description: Lista completa de todas las boletas del sistema (para administración)
 *     responses:
 *       200:
 *         description: Lista de boletas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   numero_compra:
 *                     type: integer
 *                     example: 1001
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-14T10:30:00.000Z"
 *                   comprador:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       correo:
 *                         type: string
 *                         example: "juan@ejemplo.com"
 *                   productos:
 *                     type: array
 *                     items:
 *                       type: object
 *                   total:
 *                     type: number
 *                     example: 125990
 *                   user_id:
 *                     type: integer
 *                     example: 5
 *             example:
 *               - id: 1
 *                 numero_compra: 1001
 *                 fecha: "2024-12-14T10:30:00.000Z"
 *                 comprador:
 *                   nombre: "Juan Pérez"
 *                   correo: "juan@ejemplo.com"
 *                   direccion: "Calle Principal 123"
 *                 productos:
 *                   - id: 15
 *                     nombre: "Laptop Gamer"
 *                     precio: 1299.99
 *                     cantidad: 1
 *                   - id: 22
 *                     nombre: "Mouse Gaming"
 *                     precio: 49.99
 *                     cantidad: 2
 *                 total: 1399.97
 *                 user_id: 5
 *               - id: 2
 *                 numero_compra: 1002
 *                 fecha: "2024-12-14T11:15:00.000Z"
 *                 comprador:
 *                   nombre: "María García"
 *                   correo: "maria@ejemplo.com"
 *                   direccion: "Avenida Central 456"
 *                 productos:
 *                   - id: 8
 *                     nombre: "Smartphone"
 *                     precio: 799.99
 *                     cantidad: 1
 *                 total: 799.99
 *                 user_id: 8
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener todas las boletas"
 */
// ============================
// GET TODAS LAS BOLETAS (ADMIN)
// ============================
app.get("/detalle", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM boleta ORDER BY fecha DESC");

    const rows = result.rows.map(r => ({
      ...r,
      total: Number(r.total) || 0,
      numero_compra: r.numero_compra || null
    }));

    res.json(rows);
  } catch (err) {
    console.error("Error GET /detalle", err.stack || err);
    res.status(500).json({ message: "Error al obtener todas las boletas" });
  }
});

// ============================
// INICIAR SERVIDOR
// ============================
app.listen(PORT, "0.0.0.0", () =>
  console.log(`DetalleBoleta API corriendo en puerto ${PORT}`)
);
