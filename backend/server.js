const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Render asigna el puerto automáticamente

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://iadey.vercel.app', // Cambia esto después
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
//const usuariosRoutes = require('./routes/usuarios');
//const productosRoutes = require('./routes/productos');

// Usar rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
//app.get('/', (req, res) => {
  //res.json({ 
    //message: 'API funcionando correctamente',
    //endpoints: {
      //health: '/api/health',
      //usuarios: '/api/usuarios',
      //productos: '/api/productos'
    //}
  //});
//});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
});