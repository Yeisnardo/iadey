const pool = require('../config/db');

class RequisitosModel {
  // Obtener todos los requisitos
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM requisitos ORDER BY id_requisitos ASC'
    );
    return result.rows;
  }

  // Obtener requisito por ID
  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM requisitos WHERE id_requisitos = $1',
      [id]
    );
    return result.rows[0];
  }

  // Obtener requisito por nombre
  static async getByNombre(nombre_requisito) {
    const result = await pool.query(
      'SELECT * FROM requisitos WHERE nombre_requisito ILIKE $1',
      [nombre_requisito]
    );
    return result.rows[0];
  }

  // Crear requisito
  static async create(data) {
    const { nombre_requisito } = data;
    
    const result = await pool.query(
      `INSERT INTO requisitos (nombre_requisito) 
       VALUES ($1) 
       RETURNING *`,
      [nombre_requisito.trim()]
    );
    return result.rows[0];
  }

  // Actualizar requisito
  static async update(id, data) {
    const { nombre_requisito } = data;
    
    const result = await pool.query(
      `UPDATE requisitos 
       SET nombre_requisito = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id_requisitos = $2 
       RETURNING *`,
      [nombre_requisito.trim(), id]
    );
    return result.rows[0];
  }

  // Eliminar requisito
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM requisitos WHERE id_requisitos = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = RequisitosModel;