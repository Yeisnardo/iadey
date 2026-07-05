// models/permisosModel.js - Completo

const pool = require('../config/db');

class PermisosModel {
  // ========== PERMISOS POR USUARIO ==========

  static async getPermisosByUsuario(idUsuario) {
    const query = `
      SELECT p.id_permisos, p.menu_item_id, p.acciones, p.created_at, p.updated_at
      FROM Permisos p
      WHERE p.id_usu = $1
      ORDER BY p.menu_item_id
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows;
  }

  static async asignarPermisosUsuario(idUsuario, permisos) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM Permisos WHERE id_usu = $1', [idUsuario]);
      
      if (permisos?.length > 0) {
        const insertQuery = `
          INSERT INTO Permisos (id_usu, menu_item_id, acciones, created_at, updated_at) 
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        for (const permiso of permisos) {
          await client.query(insertQuery, [idUsuario, permiso.menu_item_id, permiso.acciones]);
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

  static async eliminarPermisosUsuario(idUsuario) {
    const result = await pool.query('DELETE FROM Permisos WHERE id_usu = $1', [idUsuario]);
    return result.rowCount > 0;
  }

  static async copiarPermisosUsuario(idUsuarioOrigen, idUsuarioDestino) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const permisosOrigen = await client.query(
        'SELECT menu_item_id, acciones FROM Permisos WHERE id_usu = $1',
        [idUsuarioOrigen]
      );
      
      await client.query('DELETE FROM Permisos WHERE id_usu = $1', [idUsuarioDestino]);
      
      if (permisosOrigen.rows.length > 0) {
        const insertQuery = `
          INSERT INTO Permisos (id_usu, menu_item_id, acciones, created_at, updated_at) 
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        for (const permiso of permisosOrigen.rows) {
          await client.query(insertQuery, [idUsuarioDestino, permiso.menu_item_id, permiso.acciones]);
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

  // ========== PERMISOS POR ROL ==========

  static async getPermisosByRol(idRol) {
    const query = `
      SELECT DISTINCT p.menu_item_id, p.acciones
      FROM usuario u
      INNER JOIN Permisos p ON p.id_usu = u.id
      WHERE u.id_rol_usu = $1
      ORDER BY p.menu_item_id
    `;
    const result = await pool.query(query, [idRol]);
    return result.rows;
  }

  static async asignarPermisosRol(idRol, permisos) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const usuarios = await client.query('SELECT id FROM usuario WHERE id_rol_usu = $1', [idRol]);
      
      if (usuarios.rows.length > 0) {
        const usuarioIds = usuarios.rows.map(u => u.id);
        await client.query('DELETE FROM Permisos WHERE id_usu = ANY($1::int[])', [usuarioIds]);
        
        if (permisos?.length > 0) {
          const insertQuery = `
            INSERT INTO Permisos (id_usu, menu_item_id, acciones, created_at, updated_at) 
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `;
          for (const usuario of usuarios.rows) {
            for (const permiso of permisos) {
              await client.query(insertQuery, [usuario.id, permiso.menu_item_id, permiso.acciones]);
            }
          }
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

  static async eliminarPermisosRol(idRol) {
    const result = await pool.query(
      `DELETE FROM Permisos WHERE id_usu IN (SELECT id FROM usuario WHERE id_rol_usu = $1)`,
      [idRol]
    );
    return result.rowCount > 0;
  }

  // ========== GENERALES ==========

  static async getAllPermisos() {
    const query = `
      SELECT p.*, u.cedula_usuario, u.estatus, r.nombre_rol
      FROM Permisos p
      INNER JOIN usuario u ON p.id_usu = u.id
      INNER JOIN roles r ON u.id_rol_usu = r.id_rol
      ORDER BY r.nombre_rol, u.cedula_usuario, p.menu_item_id
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async verificarPermiso(idUsuario, menuItemId, accion) {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM usuario u
        INNER JOIN Permisos p ON p.id_usu = u.id
        WHERE u.id = $1 AND u.estatus = 'activo'
          AND p.menu_item_id = $2
          AND (p.acciones = '*' OR p.acciones ILIKE '%' || $3 || '%')
      ) as tiene_permiso
    `;
    const result = await pool.query(query, [idUsuario, menuItemId, accion]);
    return result.rows[0].tiene_permiso;
  }

  // ========== ROLES ==========

  static async getAllRoles() {
    const query = `
      SELECT r.*, COUNT(DISTINCT u.id) as total_usuarios
      FROM roles r
      LEFT JOIN usuario u ON u.id_rol_usu = r.id_rol
      GROUP BY r.id_rol
      ORDER BY r.nombre_rol
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getRolById(idRol) {
    const query = 'SELECT * FROM roles WHERE id_rol = $1';
    const result = await pool.query(query, [idRol]);
    return result.rows[0] || null;
  }

  static async getRolByNombre(nombreRol) {
    const query = 'SELECT * FROM roles WHERE LOWER(nombre_rol) = LOWER($1)';
    const result = await pool.query(query, [nombreRol]);
    return result.rows[0] || null;
  }

  static async createRol(nombreRol, descripcion = '') {
    const query = `
      INSERT INTO roles (nombre_rol, descripcion, created_at, updated_at) 
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING *
    `;
    const result = await pool.query(query, [nombreRol, descripcion]);
    return result.rows[0];
  }

  static async updateRol(idRol, nombreRol, descripcion = '') {
    const query = `
      UPDATE roles SET nombre_rol = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id_rol = $3 RETURNING *
    `;
    const result = await pool.query(query, [nombreRol, descripcion, idRol]);
    return result.rows[0];
  }

  static async deleteRol(idRol) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM Permisos WHERE id_usu IN (SELECT id FROM usuario WHERE id_rol_usu = $1)', [idRol]);
      const result = await client.query('DELETE FROM roles WHERE id_rol = $1 RETURNING *', [idRol]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUsuariosByRol(idRol) {
    const query = `
      SELECT u.id, u.cedula_usuario, u.estatus, u.created_at, u.ultimo_acceso,
             p.nombres, p.apellidos, p.correo as email, p.telefono
      FROM usuario u
      INNER JOIN persona p ON p.cedula = u.cedula_usuario
      WHERE u.id_rol_usu = $1
      ORDER BY p.nombres, p.apellidos
    `;
    const result = await pool.query(query, [idRol]);
    return result.rows;
  }
}

module.exports = PermisosModel;