const { query } = require('../config/conexion');

class Persona {
  // Crear persona completa
  static async create(personaData) {
    const {
      cedula, primer_nombre, segundo_nombre, primer_apellido,
      segundo_apellido, email, telefono, direccion, fecha_nacimiento, genero
    } = personaData;
    
    const sql = `
      INSERT INTO personas (
        cedula, primer_nombre, segundo_nombre, primer_apellido,
        segundo_apellido, email, telefono, direccion, fecha_nacimiento, 
        genero, creado_en, actualizado_en
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING cedula, primer_nombre, primer_apellido, email, creado_en
    `;
    
    const result = await query(sql, [
      cedula, primer_nombre, segundo_nombre || null, primer_apellido,
      segundo_apellido || null, email, telefono || null, direccion || null,
      fecha_nacimiento || null, genero || null
    ]);
    
    return result.rows[0];
  }
  
  // Crear persona básica (solo campos obligatorios)
  static async createBasica({ cedula, primer_nombre, primer_apellido, email }) {
    const sql = `
      INSERT INTO personas (
        cedula, primer_nombre, primer_apellido, email, creado_en, actualizado_en
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING cedula, primer_nombre, primer_apellido, email
    `;
    
    const result = await query(sql, [cedula, primer_nombre, primer_apellido, email]);
    return result.rows[0];
  }
  
  // Buscar persona por cédula
  static async findByCedula(cedula) {
    const sql = `
      SELECT p.*, u.estatus as usuario_activo, u.ultimo_acceso
      FROM personas p
      LEFT JOIN usuarios u ON p.cedula = u.cedula_usuario
      WHERE p.cedula = $1
    `;
    const result = await query(sql, [cedula]);
    return result.rows[0];
  }
  
  // Buscar persona por email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM personas WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
  }
  
  // Obtener todas las personas con paginación y búsqueda
  static async findAll({ page = 1, limit = 10, search = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT p.*, u.estatus as tiene_usuario
      FROM personas p
      LEFT JOIN usuarios u ON p.cedula = u.cedula_usuario
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      sql += ` AND (
        p.cedula ILIKE $${paramIndex} OR 
        p.primer_nombre ILIKE $${paramIndex} OR 
        p.primer_apellido ILIKE $${paramIndex} OR 
        p.email ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ` ORDER BY p.primer_apellido, p.primer_nombre 
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM personas p WHERE 1=1';
    const countParams = [];
    if (search) {
      countSql += ` AND (
        p.cedula ILIKE $1 OR p.primer_nombre ILIKE $1 OR 
        p.primer_apellido ILIKE $1 OR p.email ILIKE $1
      )`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await query(countSql, countParams);
    
    return {
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page),
        pages: Math.ceil(countResult.rows[0].total / limit),
        limit: parseInt(limit)
      }
    };
  }
  
  // Actualizar persona
  static async update(cedula, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = [
      'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
      'email', 'telefono', 'direccion', 'fecha_nacimiento', 'genero'
    ];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }
    
    if (fields.length === 0) return null;
    
    fields.push(`actualizado_en = CURRENT_TIMESTAMP`);
    values.push(cedula);
    
    const sql = `
      UPDATE personas 
      SET ${fields.join(', ')}
      WHERE cedula = $${paramIndex}
      RETURNING cedula, primer_nombre, primer_apellido, email, actualizado_en
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  // Eliminar persona (verificar que no tenga usuario asociado)
  static async delete(cedula) {
    // Verificar si tiene usuario asociado
    const checkSql = 'SELECT cedula_usuario FROM usuarios WHERE cedula_usuario = $1';
    const checkResult = await query(checkSql, [cedula]);
    
    if (checkResult.rows.length > 0) {
      throw new Error('No se puede eliminar la persona porque tiene un usuario asociado');
    }
    
    const sql = 'DELETE FROM personas WHERE cedula = $1 RETURNING cedula';
    const result = await query(sql, [cedula]);
    return result.rows[0];
  }
  
  // Verificar si existe persona
  static async exists(cedula) {
    const sql = 'SELECT 1 FROM personas WHERE cedula = $1 LIMIT 1';
    const result = await query(sql, [cedula]);
    return result.rows.length > 0;
  }
}

module.exports = Persona;