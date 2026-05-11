// models/UsuarioModel.js
const pool = require('../config/db');

class UsuarioModel {
  // Obtener todos los usuarios con datos de persona
  static async getAll() {
    const result = await pool.query(`
      SELECT u.*, 
             p.nacionalidad, p.nombres, p.apellidos, p.fecha_nacimiento, 
             p.telefono, p.correo, p.estado_civil, p.direccion, p.estado, 
             p.municipio, p.parroquia, p.tipo_persona, p.email,
             CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
      ORDER BY u.id
    `);
    return result.rows;
  }

  // Obtener usuario por ID con datos de persona
  static async getById(id) {
    const result = await pool.query(`
      SELECT u.*, 
             p.nacionalidad, p.nombres, p.apellidos, p.fecha_nacimiento, 
             p.telefono, p.correo, p.estado_civil, p.direccion, p.estado, 
             p.municipio, p.parroquia, p.tipo_persona, p.email,
             CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
      WHERE u.id = $1
    `, [id]);
    return result.rows[0];
  }

  // Obtener usuario por cédula con datos de persona formateados
  static async getByCedula(cedula_usuario) {
    const result = await pool.query(`
      SELECT 
        u.id, u.cedula_usuario, u.clave, u.rol, u.estatus, 
        u.created_at, u.updated_at, u.ultimo_acceso,
        p.nombres, p.apellidos, p.nacionalidad, p.fecha_nacimiento, 
        p.telefono, p.correo, p.estado_civil, p.direccion, p.estado as estado_persona, 
        p.municipio, p.parroquia, p.tipo_persona, p.email,
        CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
      WHERE u.cedula_usuario = $1
    `, [cedula_usuario]);
    
    const user = result.rows[0];
    
    if (!user) return null;
    
    // Formatear la respuesta con la estructura que espera el frontend
    return {
      id: user.id,
      cedula_usuario: user.cedula_usuario,
      clave: user.clave, // Incluir clave para comparación en login
      rol: user.rol,
      estatus: user.estatus,
      created_at: user.created_at,
      updated_at: user.updated_at,
      ultimo_acceso: user.ultimo_acceso,
      nombre_completo: user.nombre_completo,
      nombres: user.nombres,
      apellidos: user.apellidos,
      persona: {
        nombres: user.nombres,
        apellidos: user.apellidos,
        nombre_completo: user.nombre_completo,
        nacionalidad: user.nacionalidad,
        fecha_nacimiento: user.fecha_nacimiento,
        telefono: user.telefono,
        correo: user.correo,
        estado_civil: user.estado_civil,
        direccion: user.direccion,
        estado: user.estado_persona,
        municipio: user.municipio,
        parroquia: user.parroquia,
        tipo_persona: user.tipo_persona,
        email: user.email
      }
    };
  }

  // Crear usuario (asume que la persona ya existe)
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

  // Obtener usuarios por rol con datos de persona
  static async getByRol(rol) {
    const result = await pool.query(`
      SELECT u.*, 
             p.nacionalidad, p.nombres, p.apellidos, p.fecha_nacimiento, 
             p.telefono, p.correo, p.estado_civil, p.direccion, p.estado as estado_persona, 
             p.municipio, p.parroquia, p.tipo_persona, p.email,
             CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
      WHERE u.rol = $1
      ORDER BY u.id
    `, [rol]);
    return result.rows;
  }

  // Crear persona y usuario en una transacción
  static async createPersonaYUsuario(personaData, usuarioData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar persona
      const personaResult = await client.query(`
        INSERT INTO persona (
          nacionalidad, cedula, nombres, apellidos, fecha_nacimiento, 
          telefono, correo, estado_civil, direccion, estado, municipio, 
          parroquia, tipo_persona, email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        personaData.nacionalidad,
        personaData.cedula,
        personaData.nombres,
        personaData.apellidos,
        personaData.fecha_nacimiento,
        personaData.telefono,
        personaData.correo,
        personaData.estado_civil,
        personaData.direccion,
        personaData.estado,
        personaData.municipio,
        personaData.parroquia,
        personaData.tipo_persona,
        personaData.email
      ]);

      // Insertar usuario
      const usuarioResult = await client.query(`
        INSERT INTO usuario (cedula_usuario, clave, rol, estatus)
        VALUES ($1, $2, $3, $4)
        RETURNING id, cedula_usuario, rol, estatus, created_at
      `, [
        personaData.cedula,
        usuarioData.clave,
        usuarioData.rol,
        usuarioData.estatus || 'activo'
      ]);

      await client.query('COMMIT');

      return {
        persona: personaResult.rows[0],
        usuario: usuarioResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar datos de persona asociada al usuario
  static async updatePersona(cedula, personaData) {
    const result = await pool.query(`
      UPDATE persona SET
        nombres = $1,
        apellidos = $2,
        fecha_nacimiento = $3,
        telefono = $4,
        correo = $5,
        estado_civil = $6,
        direccion = $7,
        estado = $8,
        municipio = $9,
        parroquia = $10,
        email = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE cedula = $12
      RETURNING *
    `, [
      personaData.nombres,
      personaData.apellidos,
      personaData.fecha_nacimiento,
      personaData.telefono,
      personaData.correo,
      personaData.estado_civil,
      personaData.direccion,
      personaData.estado,
      personaData.municipio,
      personaData.parroquia,
      personaData.email,
      cedula
    ]);
    return result.rows[0];
  }
}

module.exports = UsuarioModel;