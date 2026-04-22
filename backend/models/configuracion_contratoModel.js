const pool = require('../config/db');

class ConfiguracionContratoModel {
  // Obtener la configuración actual (la más reciente)
  static async getCurrent() {
    const result = await pool.query(
      'SELECT * FROM configuracion_contrato ORDER BY id_configuracion DESC LIMIT 1'
    );
    return result.rows[0];
  }

  // Obtener configuración por ID
  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM configuracion_contrato WHERE id_configuracion = $1',
      [id]
    );
    return result.rows[0];
  }

  // Obtener todas las configuraciones (historial)
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM configuracion_contrato ORDER BY id_configuracion DESC'
    );
    return result.rows;
  }

  // Crear nueva configuración
  static async create(data) {
    const {
      interes_porcentaje,
      morosidad_porcentaje,
      flat_porcentaje,
      cuotas_obligatorias,
      cuotas_gracia,
      frecuencia_pago,
      cedula_pago,
      banco_pago,
      cuenta_pago,
      created_by
    } = data;

    const result = await pool.query(
      `INSERT INTO configuracion_contrato (
        interes_porcentaje,
        morosidad_porcentaje,
        flat_porcentaje,
        cuotas_obligatorias,
        cuotas_gracia,
        frecuencia_pago,
        cedula_pago,
        banco_pago,
        cuenta_pago,
        created_by,
        updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        interes_porcentaje,
        morosidad_porcentaje,
        flat_porcentaje,
        cuotas_obligatorias,
        cuotas_gracia,
        frecuencia_pago,
        cedula_pago,
        banco_pago,
        cuenta_pago,
        created_by,
        created_by
      ]
    );
    return result.rows[0];
  }

  // Actualizar configuración (crea un nuevo registro en lugar de actualizar)
  static async update(id, data) {
    const {
      interes_porcentaje,
      morosidad_porcentaje,
      flat_porcentaje,
      cuotas_obligatorias,
      cuotas_gracia,
      frecuencia_pago,
      cedula_pago,
      banco_pago,
      cuenta_pago,
      updated_by
    } = data;

    const result = await pool.query(
      `UPDATE configuracion_contrato SET
        interes_porcentaje = $1,
        morosidad_porcentaje = $2,
        flat_porcentaje = $3,
        cuotas_obligatorias = $4,
        cuotas_gracia = $5,
        frecuencia_pago = $6,
        cedula_pago = $7,
        banco_pago = $8,
        cuenta_pago = $9,
        updated_by = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_configuracion = $11 
      RETURNING *`,
      [
        interes_porcentaje,
        morosidad_porcentaje,
        flat_porcentaje,
        cuotas_obligatorias,
        cuotas_gracia,
        frecuencia_pago,
        cedula_pago,
        banco_pago,
        cuenta_pago,
        updated_by,
        id
      ]
    );
    return result.rows[0];
  }

  // Eliminar configuración
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM configuracion_contrato WHERE id_configuracion = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Obtener historial de cambios
  static async getHistorial(id_configuracion = null) {
    let query = 'SELECT * FROM configuracion_contrato_historial';
    let params = [];
    
    if (id_configuracion) {
      query += ' WHERE id_configuracion = $1';
      params.push(id_configuracion);
    }
    
    query += ' ORDER BY fecha_cambio DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  // Registrar cambio en historial
  static async createHistorial(data) {
    const {
      id_configuracion,
      campo_modificado,
      valor_anterior,
      valor_nuevo,
      usuario,
      motivo
    } = data;

    const result = await pool.query(
      `INSERT INTO configuracion_contrato_historial (
        id_configuracion,
        campo_modificado,
        valor_anterior,
        valor_nuevo,
        usuario,
        motivo
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [id_configuracion, campo_modificado, valor_anterior, valor_nuevo, usuario, motivo]
    );
    return result.rows[0];
  }
}

module.exports = ConfiguracionContratoModel;