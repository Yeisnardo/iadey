const pool = require('../config/db');

class RolModel {
  // Obtener todos los roles
  static async getAll() {
    const result = await pool.query(
      'SELECT id_rol, nombre_rol, created_at, updated_at FROM roles ORDER BY nombre_rol ASC'
    );
    return result.rows;
  }

  // Obtener rol por ID
  static async getById(id) {
    const result = await pool.query(
      'SELECT id_rol, nombre_rol, created_at, updated_at FROM roles WHERE id_rol = $1',
      [id]
    );
    return result.rows[0];
  }

  // Obtener rol por nombre
  static async getByNombre(nombre_rol) {
    const result = await pool.query(
      'SELECT id_rol, nombre_rol FROM roles WHERE nombre_rol ILIKE $1',
      [nombre_rol]
    );
    return result.rows[0];
  }

  // Crear rol
  static async create(data) {
    const { nombre_rol, descripcion } = data;
    
    const result = await pool.query(
      `INSERT INTO roles (nombre_rol) 
       VALUES ($1) 
       RETURNING id_rol, nombre_rol, created_at`,
      [nombre_rol.trim()]
    );
    return result.rows[0];
  }

  // Actualizar rol
  static async update(id, data) {
    const { nombre_rol } = data;
    
    const result = await pool.query(
      `UPDATE roles 
       SET nombre_rol = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id_rol = $2 
       RETURNING id_rol, nombre_rol, updated_at`,
      [nombre_rol.trim(), id]
    );
    return result.rows[0];
  }

  // Eliminar rol - CORREGIDO
  static async delete(id) {
    // Verificar si el rol existe
    const rol = await this.getById(id);
    if (!rol) {
      throw new Error('Rol no encontrado');
    }

    // Verificar si hay usuarios con este rol (asumiendo que tienes una tabla usuarios con id_rol)
    const checkUsers = await pool.query(
      'SELECT COUNT(*) FROM usuario WHERE id_rol_usu = $1',
      [id]
    );
    
    if (parseInt(checkUsers.rows[0].count) > 0) {
      throw new Error(`No se puede eliminar el rol "${rol.nombre_rol}" porque tiene ${parseInt(checkUsers.rows[0].count)} usuario(s) asignado(s)`);
    }
    
    const result = await pool.query(
      'DELETE FROM roles WHERE id_rol = $1 RETURNING id_rol',
      [id]
    );
    return result.rows[0];
  }

  // Verificar si un rol tiene usuarios asignados - CORREGIDO
  static async tieneUsuarios(id) {
    // Asumiendo que tienes una tabla 'usuarios' con una columna 'id_rol'
    const result = await pool.query(
      'SELECT COUNT(*) FROM usuario WHERE id_rol_usu = $1',
      [id]
    );
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = RolModel;