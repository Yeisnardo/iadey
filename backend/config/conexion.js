const { Pool } = require('pg');

// Solo cargar dotenv en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Configuración del pool de conexiones
let pool;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL (producción en Render)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }  // Necesario para Render
      : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  console.log('📡 Usando conexión con DATABASE_URL');
} else {
  // Usar variables separadas (desarrollo local)
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'iadey',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Yeisnardo06.',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  console.log('📡 Usando conexión con variables separadas');
}

// Probar conexión
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Verificar versión de PostgreSQL
    const result = await client.query('SELECT version()');
    console.log(`📡 PostgreSQL versión: ${result.rows[0].version.split(',')[0]}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    console.error('📋 Detalles de la conexión:');
    if (process.env.DATABASE_URL) {
      console.error('   - Usando DATABASE_URL (producción)');
      console.error('   - Asegúrate de que la variable DATABASE_URL esté configurada correctamente en Render');
    } else {
      console.error(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
      console.error(`   - Puerto: ${process.env.DB_PORT || 5432}`);
      console.error(`   - Base de datos: ${process.env.DB_NAME || 'iadey'}`);
      console.error(`   - Usuario: ${process.env.DB_USER || 'postgres'}`);
      console.error('   - Asegúrate de que PostgreSQL esté corriendo localmente');
    }
    throw error;
  } finally {
    if (client) client.release();
  }
};

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

// Cerrar pool (útil para graceful shutdown)
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error al cerrar pool:', error.message);
  }
};

module.exports = { pool, query, testConnection, closePool };