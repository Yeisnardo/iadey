// models/UsuarioModel.js
const pool = require('../config/db');

class UsuarioModel {
  // Obtener todos los usuarios con datos de persona y rol
  static async getAll() {
  const result = await pool.query(`
    SELECT u.*, 
           p.nacionalidad, p.nombres, p.apellidos, p.fecha_nacimiento, 
           p.telefono, p.correo, p.estado_civil, p.direccion, p.estado as estado_persona, 
           p.municipio, p.parroquia, p.tipo_persona, p.email,
           r.id_rol, r.nombre_rol, r.descripcion as rol_descripcion,
           CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
    FROM usuario u
    LEFT JOIN persona p ON u.cedula_usuario = p.cedula
    LEFT JOIN roles r ON u.id_rol_usu = r.id_rol
    ORDER BY u.id
  `);
  return result.rows;
}

// MODIFICAR: Obtener usuario por ID (agregar r.id_rol)
static async getById(id) {
  const result = await pool.query(`
    SELECT u.*, 
           p.nacionalidad, p.nombres, p.apellidos, p.fecha_nacimiento, 
           p.telefono, p.correo, p.estado_civil, p.direccion, p.estado as estado_persona, 
           p.municipio, p.parroquia, p.tipo_persona, p.email,
           r.id_rol, r.nombre_rol, r.descripcion as rol_descripcion,
           CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
    FROM usuario u
    LEFT JOIN persona p ON u.cedula_usuario = p.cedula
    LEFT JOIN roles r ON u.id_rol_usu = r.id_rol
    WHERE u.id = $1
  `, [id]);
  return result.rows[0];
}


  // Obtener usuario por cédula con datos de persona y rol
  // models/UsuarioModel.js - Método getByCedula modificado

static async getByCedula(cedula_usuario) {
  const result = await pool.query(`
    SELECT 
      u.id, u.cedula_usuario, u.clave, u.id_rol_usu, u.estatus, 
      u.created_at, u.updated_at, u.ultimo_acceso,
      p.nombres, p.apellidos, p.nacionalidad, p.fecha_nacimiento, 
      p.telefono, p.correo, p.estado_civil, p.direccion, p.estado as estado_persona, 
      p.municipio, p.parroquia, p.tipo_persona, p.email,
      r.nombre_rol, r.descripcion as rol_descripcion,
      CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
    FROM usuario u
    LEFT JOIN persona p ON u.cedula_usuario = p.cedula
    LEFT JOIN roles r ON u.id_rol_usu = r.id_rol
    WHERE u.cedula_usuario = $1
  `, [cedula_usuario]);
  
  const user = result.rows[0];
  
  if (!user) return null;
  
  // Formatear la respuesta con rol incluido
  return {
    id: user.id,
    cedula_usuario: user.cedula_usuario,
    clave: user.clave,
    id_rol_usu: user.id_rol_usu,
    rol: user.nombre_rol, // Añadir rol directamente
    nombre_rol: user.nombre_rol, // Mantener por compatibilidad
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

  // Crear usuario (con id_rol_usu)
  static async create(data) {
    const { cedula_usuario, clave, id_rol_usu, estatus } = data;
    
    const result = await pool.query(
      `INSERT INTO usuario (cedula_usuario, clave, id_rol_usu, estatus)
       VALUES ($1, $2, $3, $4)
       RETURNING id, cedula_usuario, id_rol_usu, estatus, created_at`,
      [cedula_usuario, clave, id_rol_usu || 1, estatus || 'activo']
    );
    return result.rows[0];
  }

  // Actualizar usuario
  static async update(id, data) {
  const { id_rol_usu, estatus } = data;
  
  let query = 'UPDATE usuario SET updated_at = CURRENT_TIMESTAMP';
  const params = [];
  let paramCount = 1;

  if (id_rol_usu !== undefined) {
    query += `, id_rol_usu = $${paramCount}`;
    params.push(id_rol_usu);
    paramCount++;
  }

  if (estatus !== undefined) {
    query += `, estatus = $${paramCount}`;
    params.push(estatus);
    paramCount++;
  }

  // Si no hay campos para actualizar, retornar error
  if (params.length === 0) {
    throw new Error('No se proporcionaron campos para actualizar');
  }

  query += ` WHERE id = $${paramCount} RETURNING id, cedula_usuario, id_rol_usu, estatus, created_at, updated_at`;
  params.push(id);

  const result = await pool.query(query, params);
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
  static async getByRol(id_rol) {
    const result = await pool.query(`
      SELECT u.*, 
             p.nacionalidad, p.nombres, p.apellidos, p.fecha_nacimiento, 
             p.telefono, p.correo, p.estado_civil, p.direccion, p.estado as estado_persona, 
             p.municipio, p.parroquia, p.tipo_persona, p.email,
             r.nombre_rol, r.descripcion as rol_descripcion,
             CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
      LEFT JOIN roles r ON u.id_rol_usu = r.id_rol
      WHERE u.id_rol_usu = $1
      ORDER BY u.id
    `, [id_rol]);
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

      // Insertar usuario con id_rol_usu
      const usuarioResult = await client.query(`
        INSERT INTO usuario (cedula_usuario, clave, id_rol_usu, estatus)
        VALUES ($1, $2, $3, $4)
        RETURNING id, cedula_usuario, id_rol_usu, estatus, created_at
      `, [
        personaData.cedula,
        usuarioData.clave,
        usuarioData.id_rol_usu || 1, // Por defecto rol 1 (Emprendedor)
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

  static async getRoles() {
  const result = await pool.query('SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY id_rol');
  return result.rows;
}

}

module.exports = UsuarioModel;