const pool = require('../config/db');

class ClasificacionEmprendimientoModel {
  // Obtener todas las clasificaciones
  static async getAll() {
    const result = await pool.query('SELECT * FROM clasificacion_emprendimiento ORDER BY id_clasificacion');
    return result.rows;
  }

  // Obtener clasificación por ID
  static async getById(id_clasificacion) {
    const result = await pool.query('SELECT * FROM clasificacion_emprendimiento WHERE id_clasificacion = $1', [id_clasificacion]);
    return result.rows[0];
  }

  // Crear nueva clasificación
  static async create(data) {
    const { sector, actividad, n_ins_asig } = data;

    const result = await pool.query(
      `INSERT INTO clasificacion_emprendimiento (sector, actividad, n_ins_asig)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sector, actividad, n_ins_asig]
    );
    return result.rows[0];
  }

  // Actualizar clasificación
  static async update(id_clasificacion, data) {
    const { sector, actividad, n_ins_asig } = data;

    const result = await pool.query(
      `UPDATE clasificacion_emprendimiento SET
        sector = COALESCE($1, sector),
        actividad = COALESCE($2, actividad),
        n_ins_asig = COALESCE($3, n_ins_asig),
        updated_at = CURRENT_TIMESTAMP
      WHERE id_clasificacion = $4
      RETURNING *`,
      [sector, actividad, n_ins_asig, id_clasificacion]
    );
    return result.rows[0];
  }

  // Eliminar clasificación
  static async delete(id_clasificacion) {
    const result = await pool.query('DELETE FROM clasificacion_emprendimiento WHERE id_clasificacion = $1 RETURNING *', [id_clasificacion]);
    return result.rows[0];
  }
}

module.exports = ClasificacionEmprendimientoModel;