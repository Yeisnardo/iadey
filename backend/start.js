const { testConnection, closePool } = require('./config/conexion');

const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Iniciar servidor
    const app = require('./index');
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS permitido: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
    
    // Manejar cierre graceful
    const gracefulShutdown = async () => {
      console.log('🛑 Recibida señal de terminación, cerrando servidor...');
      server.close(async () => {
        console.log('✅ Servidor HTTP cerrado');
        await closePool();
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();