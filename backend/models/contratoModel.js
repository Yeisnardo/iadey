const pool = require('../config/db');

class ContratoModel {
  // Obtener aprobaciones con seleccion_manejo = 'Interno'
  static async getAll() {
    const query = `
      SELECT 
        a.id_aprobacion,
        a.id_inspeccion,
        a.id_expediente,
        a.verificacion_requisitos,
        a.estatus_aprobacion,
        a.seleccion_manejo,
        a.created_at as aprobacion_created_at,
        a.updated_at as aprobacion_updated_at,
        c.id_contrato,
        c.numero_contrato,
        c.moneda,
        c.monto_moneda,
        c.cambio,
        c.flat,
        c.interes,
        c.devolvimiento,
        c.numero_cuotas,
        c.inicio,
        c.cierre,
        c.estatus,
        c.created_at as contrato_created_at,
        c.updated_at as contrato_updated_at,
        d.id_desembolso,
        d.monto_pagado,
        d.fecha_desembolso,
        d.referecia_bancaria,
        d.estatus as estatus_desembolso,
        d.fecha_confirmacion,
        d.observaciones_pago,
        d.referencia_pago
      FROM aprobacion a
      LEFT JOIN contrato c ON a.id_aprobacion = c.id_aprob
      LEFT JOIN desembolso d ON c.id_contrato = d.id_cont
      WHERE a.seleccion_manejo = 'Interno'
      ORDER BY a.id_aprobacion DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Registrar un nuevo contrato
  static async create(contratoData) {
    const {
      id_aprob,
      id_config,
      numero_contrato,
      moneda,
      monto_moneda,
      cambio,
      flat,
      interes,
      devolvimiento,
      numero_cuotas,
      inicio,
      cierre,
      estatus
    } = contratoData;

    const query = `
      INSERT INTO contrato (
        id_aprob,
        id_config,
        numero_contrato,
        moneda,
        monto_moneda,
        cambio,
        flat,
        interes,
        devolvimiento,
        numero_cuotas,
        inicio,
        cierre,
        estatus
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const values = [
      id_aprob,
      id_config,
      numero_contrato,
      moneda,
      monto_moneda,
      cambio,
      flat,
      interes,
      devolvimiento,
      numero_cuotas,
      inicio,
      cierre,
      estatus
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener el último número de contrato
  static async getLastContractNumber() {
    const currentYear = new Date().getFullYear();
    const query = `
      SELECT numero_contrato 
      FROM contrato 
      WHERE numero_contrato LIKE 'IADEY-${currentYear}-%'
      ORDER BY numero_contrato DESC 
      LIMIT 1
    `;
    const result = await pool.query(query);
    return result.rows[0] || { numero_contrato: `IADEY-${currentYear}-000` };
  }

  // Obtener un contrato por ID de aprobación
  static async getById(id) {
    const query = `
      SELECT 
        c.id_contrato,
        c.id_aprob,
        c.id_config,
        c.numero_contrato,
        c.moneda,
        c.monto_moneda,
        c.cambio,
        c.flat,
        c.interes,
        c.devolvimiento,
        c.numero_cuotas,
        c.inicio,
        c.cierre,
        c.estatus,
        c.created_at,
        c.updated_at,
        a.id_aprobacion,
        a.id_inspeccion,
        a.id_expediente,
        a.verificacion_requisitos,
        a.estatus_aprobacion,
        a.seleccion_manejo,
        d.id_desembolso,
        d.monto_pagado,
        d.fecha_desembolso,
        d.referecia_bancaria,
        d.estatus as estatus_desembolso,
        d.fecha_confirmacion,
        d.observaciones_pago,
        d.referencia_pago
      FROM contrato c
      JOIN aprobacion a ON c.id_aprob = a.id_aprobacion
      LEFT JOIN desembolso d ON c.id_contrato = d.id_cont
      WHERE c.id_aprob = $1
      ORDER BY d.fecha_desembolso DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar estatus del contrato
  static async updateStatus(id_aprob, estatus) {
    const query = `
      UPDATE contrato 
      SET estatus = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id_aprob = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [estatus, id_aprob]);
    return result.rows[0];
  }

  // Crear registro de desembolso
  static async crearDesembolso(desembolsoData) {
    const {
      id_aprob,
      referencia_bancaria,
      monto_pagado,
      fecha_desembolso,
      observaciones,
      estatus
    } = desembolsoData;

    const contratoQuery = `
      SELECT id_contrato FROM contrato 
      WHERE id_aprob = $1
    `;
    const contratoResult = await pool.query(contratoQuery, [id_aprob]);
    
    if (!contratoResult.rows[0]) {
      throw new Error('Contrato no encontrado');
    }

    const id_contrato = contratoResult.rows[0].id_contrato;

    const query = `
      INSERT INTO desembolso (
        id_cont,
        fecha_desembolso,
        referecia_bancaria,
        monto_pagado,
        estatus,
        observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      id_contrato,
      fecha_desembolso,
      referencia_bancaria,
      monto_pagado,
      estatus || 'Pendiente',
      observaciones || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener desembolso por ID (NUEVO MÉTODO)
  static async getDesembolsoById(id_desembolso) {
    const query = `
      SELECT * FROM desembolso 
      WHERE id_desembolso = $1
    `;
    const result = await pool.query(query, [id_desembolso]);
    return result.rows[0];
  }

  // Confirmar pago de desembolso (NUEVO MÉTODO)
  static async confirmarPagoDesembolso(id_desembolso, pagoData) {
    const {
      fecha_confirmacion,
      observaciones_pago,
      referencia_pago,
      estatus
    } = pagoData;

    const query = `
      UPDATE desembolso 
      SET 
        fecha_confirmacion = $1,
        observaciones_pago = $2,
        referencia_pago = $3,
        estatus = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_desembolso = $5
      RETURNING *
    `;

    const values = [
      fecha_confirmacion,
      observaciones_pago,
      referencia_pago,
      estatus,
      id_desembolso
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener desembolsos por contrato (NUEVO MÉTODO)
  static async getDesembolsosByContrato(id_aprob) {
    const query = `
      SELECT 
        d.*,
        c.numero_contrato,
        c.moneda
      FROM desembolso d
      JOIN contrato c ON d.id_cont = c.id_contrato
      WHERE c.id_aprob = $1
      ORDER BY d.fecha_desembolso DESC
    `;
    const result = await pool.query(query, [id_aprob]);
    return result.rows;
  }
}

module.exports = ContratoModel;