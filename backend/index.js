const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS para aceptar peticiones de Vercel
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'El servidor está corriendo correctamente',
    entorno: process.env.NODE_ENV || 'development'
  });
});

// Ruta de health check (útil para Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS permitido: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});