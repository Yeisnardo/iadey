const pool = require('../config/db');

class UsuarioModel {
  // Obtener todos los usuario
  static async getAll() {
    const result = await pool.query('SELECT * FROM usuario ORDER BY id');
    return result.rows;
  }

  // Obtener usuario por ID
  static async getById(id) {
    const result = await pool.query('SELECT * FROM usuario WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Obtener usuario por cédula
  static async getByCedula(cedula_usuario) {
    const result = await pool.query('SELECT * FROM usuario WHERE cedula_usuario = $1', [cedula_usuario]);
    return result.rows[0];
  }

  // Crear usuario
  static async create(data) {
    const { cedula_usuario, clave, rol, estatus } = data;
    
    const result = await pool.query(
      `INSERT INTO usuario (cedula_usuario, clave, rol, estatus)
       VALUES ($1, $2, $3, $4)
       RETURNING id, cedula_usuario, rol, estatus, created_at`,
      [cedula_usuario, clave, rol, estatus || 'activo']
    );
    return result.rows[0];
  }

  // Actualizar usuario
  static async update(id, data) {
    const { rol, estatus } = data;
    
    const result = await pool.query(
      `UPDATE usuario SET
        rol = $1, estatus = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 RETURNING id, cedula_usuario, rol, estatus, created_at`,
      [rol, estatus, id]
    );
    return result.rows[0];
  }

  // Actualizar contraseña
  static async updatePassword(id, nuevaClave) {
    const result = await pool.query(
      `UPDATE usuario SET clave = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING id, cedula_usuario`,
      [nuevaClave, id]
    );
    return result.rows[0];
  }

  // Actualizar último acceso
  static async updateUltimoAcceso(cedula_usuario) {
    const result = await pool.query(
      `UPDATE usuario SET ultimo_acceso = CURRENT_TIMESTAMP
       WHERE cedula_usuario = $1 RETURNING *`,
      [cedula_usuario]
    );
    return result.rows[0];
  }

  // Eliminar usuario
  static async delete(id) {
    const result = await pool.query('DELETE FROM usuario WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Cambiar estatus del usuario
  static async cambiarEstatus(id, estatus) {
    const result = await pool.query(
      `UPDATE usuario SET estatus = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [estatus, id]
    );
    return result.rows[0];
  }

  // Obtener usuario por rol
  static async getByRol(rol) {
    const result = await pool.query(
      'SELECT * FROM usuario WHERE rol = $1 ORDER BY id',
      [rol]
    );
    return result.rows;
  }
}

module.exports = UsuarioModel;