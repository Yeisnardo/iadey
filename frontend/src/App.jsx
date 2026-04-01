// App.js
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importación de páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Solicitud from "./pages/Solicitud.jsx";
import Expediente from "./pages/Expediente.jsx";
import Inspeccion from "./pages/Inspeccion.jsx";
import Aprobacion from "./pages/Aprobacion.jsx";
import Bancarios from "./pages/Bancarios.jsx";
import Contrato from "./pages/Contrato.jsx";
import RegistroEmprendedor from "./pages/Registro-emprendedor.jsx";
import Cartera from "./pages/Cartera.jsx";

//Configuaciones de sistema
import Usuario from "./pages/Usuario.jsx";
import Clasificacion_emprendimiento from "./pages/Clasificacion_emprendimiento.jsx";



// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('usuario'));
  
  if (!user) {
    return <Navigate to="/Login" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  // Verificar si hay usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Solicitud" element={<Solicitud />} />
        <Route path="/Expediente" element={<Expediente />} />
        <Route path="/Inspeccion" element={<Inspeccion />} />
        <Route path="/Aprobacion" element={<Aprobacion />} />
        <Route path="/Bancarios" element={<Bancarios />} />
        <Route path="/Contrato" element={<Contrato />} />
        <Route path="/Registro-emprendedor" element={<RegistroEmprendedor />} />
        <Route path="/Cartera" element={<Cartera />} />

        {/*Configuarion del sistema */}
        <Route path="/Usuario" element={<Usuario />} />
        <Route path="/Clasificacion_emprendimiento" element={<Clasificacion_emprendimiento />} />
      </Routes>
    </Router>
  );
}

export default App;