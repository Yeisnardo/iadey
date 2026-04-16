const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


// Importaciones de las rutas
const personaRoutes = require('../backend/routes/personaRoutes');
const usuarioRoutes = require('../backend/routes/usuarioRoutes');
const clasifEmprendimientoRoutes = require('../backend/routes/clasifEmprenRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', personaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clasificacion_emprendimiento', clasifEmprendimientoRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});