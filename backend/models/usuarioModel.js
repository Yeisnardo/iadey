const pool = require('../config/db');

class UsuarioModel {
  // Obtener todos los usuarios
  static async getAll() {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id');
    return result.rows;
  }

  // Obtener usuario por ID
  static async getById(id) {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Obtener usuario por email
  static async getByEmail(email) {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0];
  }

  // Obtener usuario por cédula
  static async getByCedula(cedula_usuario) {
    const result = await pool.query('SELECT * FROM usuarios WHERE cedula_usuario = $1', [cedula_usuario]);
    return result.rows[0];
  }

  // Crear usuario
  static async create(data) {
    const { cedula_usuario, email, clave, rol, estatus } = data;
    
    const result = await pool.query(
      `INSERT INTO usuarios (cedula_usuario, email, clave, rol, estatus)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, cedula_usuario, email, rol, estatus, created_at`,
      [cedula_usuario, email, clave, rol, estatus || 'activo']
    );
    return result.rows[0];
  }

  // Actualizar usuario
  static async update(id, data) {
    const { email, rol, estatus } = data;
    
    const result = await pool.query(
      `UPDATE usuarios SET
        email = $1, rol = $2, estatus = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING id, cedula_usuario, email, rol, estatus, created_at`,
      [email, rol, estatus, id]
    );
    return result.rows[0];
  }

  // Actualizar contraseña
  static async updatePassword(id, nuevaClave) {
    const result = await pool.query(
      `UPDATE usuarios SET clave = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING id, email`,
      [nuevaClave, id]
    );
    return result.rows[0];
  }

  // Actualizar último acceso
  static async updateUltimoAcceso(email) {
    const result = await pool.query(
      `UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP
       WHERE email = $1 RETURNING *`,
      [email]
    );
    return result.rows[0];
  }

  // Eliminar usuario
  static async delete(id) {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Cambiar estatus del usuario
  static async cambiarEstatus(id, estatus) {
    const result = await pool.query(
      `UPDATE usuarios SET estatus = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [estatus, id]
    );
    return result.rows[0];
  }

  // Obtener usuarios por rol
  static async getByRol(rol) {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE rol = $1 ORDER BY id',
      [rol]
    );
    return result.rows;
  }
}

module.exports = UsuarioModel;