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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', personaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clasificacion_emprendimiento', clasifEmprendimientoRoutes);
app.use('/api/solicitud', solicitudRoutes);
app.use('/api/emprendimiento', emprendimientoRoutes);
app.use('/api/requisitos', requisitosRoutes)

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});