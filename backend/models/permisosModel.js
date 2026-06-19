// models/permisosModel.js - Versión actualizada para tu estructura

const pool = require('../config/db');

class PermisosModel {
  // Obtener todos los permisos del sistema
  static async getAllPermisos() {
    const result = await pool.query(`
      SELECT 
        p.id_permisos,
        p.menu_item_id,
        p.acciones,
        r.id_rol,
        r.nombre_rol
      FROM Permisos p
      JOIN roles r ON p.id_roles = r.id_rol
      ORDER BY p.menu_item_id
    `);
    return result.rows;
  }

  // Obtener permisos agrupados por rol
  static async getPermisosAgrupadosPorRol() {
    const rows = await this.getAllPermisos();
    const rolesAgrupados = {};
    
    rows.forEach(row => {
      if (!rolesAgrupados[row.id_rol]) {
        rolesAgrupados[row.id_rol] = {
          id_rol: row.id_rol,
          nombre_rol: row.nombre_rol,
          permisos: []
        };
      }
      rolesAgrupados[row.id_rol].permisos.push({
        id_permisos: row.id_permisos,
        menu_item_id: row.menu_item_id,
        acciones: row.acciones
      });
    });
    
    return Object.values(rolesAgrupados);
  }

  // Obtener permisos de un rol específico
  static async getPermisosByRol(idRol) {
    const result = await pool.query(`
      SELECT 
        p.id_permisos,
        p.menu_item_id,
        p.acciones,
        r.nombre_rol
      FROM Permisos p
      JOIN roles r ON p.id_roles = r.id_rol
      WHERE p.id_roles = $1
      ORDER BY p.menu_item_id
    `, [idRol]);
    return result.rows;
  }

  // Obtener permisos de un usuario (a través de su rol)
  static async getPermisosByUsuario(idUsuario) {
    const result = await pool.query(`
      SELECT 
        p.menu_item_id,
        p.acciones
      FROM usuario u
      JOIN Permisos p ON p.id_roles = u.id_rol_usu
      WHERE u.id = $1
      ORDER BY p.menu_item_id
    `, [idUsuario]);
    return result.rows;
  }

  // Asignar permisos a un rol (reemplaza todos los permisos existentes)
  static async asignarPermisosRol(idRol, permisos) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Eliminar permisos existentes del rol
      await client.query('DELETE FROM Permisos WHERE id_roles = $1', [idRol]);
      
      // Insertar nuevos permisos
      if (permisos && permisos.length > 0) {
        for (const permiso of permisos) {
          await client.query(
            `INSERT INTO Permisos (id_roles, menu_item_id, acciones) 
             VALUES ($1, $2, $3)`,
            [idRol, permiso.menu_item_id, permiso.acciones]
          );
        }
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Verificar si un usuario tiene un permiso específico
  static async verificarPermiso(idUsuario, menuItemId, accion) {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM usuario u
        JOIN Permisos p ON p.id_roles = u.id_rol_usu
        WHERE u.id = $1 
          AND p.menu_item_id = $2 
          AND (
            p.acciones = '*' 
            OR p.acciones ILIKE '%' || $3 || '%'
          )
      ) as tiene_permiso
    `, [idUsuario, menuItemId, accion]);
    return result.rows[0].tiene_permiso;
  }

  // Crear un nuevo rol
  static async createRol(nombreRol) {
    const result = await pool.query(
      `INSERT INTO roles (nombre_rol) VALUES ($1) RETURNING *`,
      [nombreRol]
    );
    return result.rows[0];
  }

  // Actualizar un rol
  static async updateRol(idRol, nombreRol) {
    const result = await pool.query(
      `UPDATE roles 
       SET nombre_rol = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id_rol = $2 
       RETURNING *`,
      [nombreRol, idRol]
    );
    return result.rows[0];
  }

  // Eliminar un rol
  static async deleteRol(idRol) {
    const result = await pool.query(
      `DELETE FROM roles WHERE id_rol = $1 RETURNING *`,
      [idRol]
    );
    return result.rows[0];
  }

  // Obtener todos los roles
  static async getAllRoles() {
    const result = await pool.query(
      `SELECT * FROM roles ORDER BY nombre_rol`
    );
    return result.rows;
  }
}

module.exports = PermisosModel;