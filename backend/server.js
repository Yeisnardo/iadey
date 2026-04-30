const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


// Importaciones de las rutas
const personaRoutes = require('../backend/routes/personaRoutes');
const usuarioRoutes = require('../backend/routes/usuarioRoutes');
const clasifEmprendimientoRoutes = require('../backend/routes/clasifEmprenRoutes');
const solicitudRoutes = require('../backend/routes/solicitudRoutes');
const emprendimientoRoutes = require('../backend/routes/emprendimientoRoutes');
const requisitosRoutes = require('../backend/routes/requisitosRoutes');
const expedienteRoutes = require('../backend/routes/expedienteRoutes');
const configuracion_contratoRoutes = require('../backend/routes/configuracion_contratoRoutes');
const inspeccionRoutes = require('../backend/routes/inspeccionRoutes');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ AUMENTAR LÍMITE DE TAMAÑO PARA JSON Y URLENCODED
app.use(cors());
app.use(express.json({ limit: '50mb' }));  // Aumentado a 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' }));  // Aumentado a 50MB

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', personaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clasificacion_emprendimiento', clasifEmprendimientoRoutes);
app.use('/api/solicitud', solicitudRoutes);
app.use('/api/emprendimiento', emprendimientoRoutes);
app.use('/api/requisitos', requisitosRoutes);
app.use('/api/expediente', expedienteRoutes);
app.use('/api/configuracion_contrato', configuracion_contratoRoutes);
app.use('/api/inspeccion', inspeccionRoutes);
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});