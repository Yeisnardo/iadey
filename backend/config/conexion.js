const { Pool } = require('pg');

// Solo cargar dotenv en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Configuración del pool de conexiones
let pool;
let connectionConfig;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL (producción en Render)
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false  // Necesario para Render
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Aumentar timeout para producción
  };
  console.log('📡 Usando conexión con DATABASE_URL');
} else {
  // Usar variables separadas (desarrollo local)
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'iadey',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Yeisnardo06.',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
  console.log('📡 Usando conexión con variables separadas');
}

// Crear el pool después de configurar
pool = new Pool(connectionConfig);

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err.message);
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
    
    // Verificar la base de datos actual
    const dbResult = await client.query('SELECT current_database()');
    console.log(`📡 Base de datos actual: ${dbResult.rows[0].current_database}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    console.error('📋 Detalles de la conexión:');
    if (process.env.DATABASE_URL) {
      // No mostrar la URL completa por seguridad
      const dbUrlMasked = process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      console.error(`   - Usando DATABASE_URL: ${dbUrlMasked.substring(0, 50)}...`);
      console.error('   - Verifica que la base de datos esté activa en Render');
      console.error('   - Asegúrate de usar la Internal Database URL (no la externa)');
    } else {
      console.error(`   - Host: ${connectionConfig.host}`);
      console.error(`   - Puerto: ${connectionConfig.port}`);
      console.error(`   - Base de datos: ${connectionConfig.database}`);
      console.error(`   - Usuario: ${connectionConfig.user}`);
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