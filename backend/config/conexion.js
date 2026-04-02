const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Probar conexión
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Verificar versión de PostgreSQL
    const result = await client.query('SELECT version()');
    console.log(`📡 PostgreSQL versión: ${result.rows[0].version.split(',')[0]}`);
    
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
};

testConnection();

// Ejecutar consultas con manejo de errores
const query = async (text, params) => {
  const start = Date.now();
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Consulta ejecutada:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error en consulta:', { text, error: error.message });
    throw error;
  } finally {
    if (client) client.release();
  }
};

module.exports = { pool, query };