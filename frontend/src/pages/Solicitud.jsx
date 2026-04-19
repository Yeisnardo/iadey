// pages/SolicitudesPersona.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building,
  ChevronLeft,
  X,
  Check,
} from "lucide-react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import clasidEmprendAPI from "../services/api_clasificacion_emprendimiento";
import SolicitudAPI from "../services/api_solicitud";
import EmprendimientoAPI from "../services/api_emprendimiento";
import usuarioAPI from "../services/api_usuario";

const SolicitudesPersona = () => {
  const navigate = useNavigate();
  const { personaId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Estados para los datos de la API de clasificación
  const [clasificaciones, setClasificaciones] = useState([]);
  const [loadingClasificaciones, setLoadingClasificaciones] = useState(false);
  const [sectoresUnicos, setSectoresUnicos] = useState([]);
  const [actividadesPorSector, setActividadesPorSector] = useState({});

  // Estados para solicitudes (desde API)
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estado para el usuario logueado
  const [currentUser, setCurrentUser] = useState(null);

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // ===== TABLA solicitud =====
    cedula_persona: "",
    solicitud: "",
    monto_solicitado: "",
    fecha_solicitud: "",
    
    // ===== TABLA emprendimiento =====
    nombre_emprendimiento: "",
    direccion_empredimiento: "",
    cedula_emprendimiento: "",
    anos_experiencia: "",
    id_clasificacion: "",
    sectorEconomico: "",
    subsector: "",
  });

  // Datos de la persona
  const [persona, setPersona] = useState({
    id: "",
    tipoPersona: "",
    nombreCompleto: "",
    cedula: "",
    rif: "",
    telefono: "",
    telefono2: "",
    email: "",
    email2: "",
    direccion: "",
    municipio: "",
    estado: "",
    fechaRegistro: "",
    ocupacion: "",
    estadoCivil: "",
    fechaNacimiento: "",
    nacionalidad: "",
  });

  const añosOperando = [
    "Menos de 1 año",
    "1 a 3 años",
    "3 a 5 años",
    "5 a 10 años",
    "Más de 10 años",
  ];

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Notificaciones del sistema", time: "5 min", read: false },
  ]);

  // ============================================
  // CARGAR DATOS INICIALES
  // ============================================
  useEffect(() => {
    cargarUsuarioYPersona();
    cargarClasificaciones();
    cargarSolicitudes();
  }, []);

  const cargarUsuarioYPersona = async () => {
    // Obtener usuario logueado
    const usuarioLogueado = usuarioAPI.getCurrentUser();
    setCurrentUser(usuarioLogueado);
    
    if (usuarioLogueado && usuarioLogueado.cedula_usuario) {
      // Establecer la cédula del usuario logueado en el formulario
      setFormData(prev => ({
        ...prev,
        cedula_persona: usuarioLogueado.cedula_usuario,
        cedula_emprendimiento: usuarioLogueado.cedula_usuario
      }));
      
      // Cargar datos de la persona usando la cédula del usuario logueado
      await cargarPersona(usuarioLogueado.cedula_usuario);
    } else {
      console.error("No hay usuario logueado");
      // Redirigir al login si no hay usuario
      navigate("/login");
    }
  };

  const cargarPersona = async (cedula) => {
    try {
      // Importar API de persona (debes crearla si no existe)
      const PersonaAPI = (await import("../services/api_persona")).default;
      const response = await PersonaAPI.getByCedula(cedula);
      
      if (response.success && response.data) {
        setPersona({
          id: response.data.id_persona,
          tipoPersona: response.data.tipo_persona || "Natural",
          nombreCompleto: response.data.nombre_completo || response.data.nombres + " " + response.data.apellidos,
          cedula: response.data.cedula,
          rif: response.data.rif || "",
          telefono: response.data.telefono || "",
          telefono2: response.data.telefono2 || "",
          email: response.data.email || "",
          email2: response.data.email2 || "",
          direccion: response.data.direccion || "",
          municipio: response.data.municipio || "",
          estado: response.data.estado || "",
          fechaRegistro: response.data.fecha_registro,
          ocupacion: response.data.ocupacion || "",
          estadoCivil: response.data.estado_civil || "",
          fechaNacimiento: response.data.fecha_nacimiento,
          nacionalidad: response.data.nacionalidad || "Venezolana",
        });
      }
    } catch (error) {
      console.error('Error cargando persona:', error);
      // Datos de ejemplo mientras se conecta la API real
      setPersona({
        ...persona,
        cedula: cedula,
        nombreCompleto: "Usuario Actual",
        telefono: "0412-1234567",
        email: "usuario@email.com",
        direccion: "Dirección registrada",
      });
    }
  };

  const cargarClasificaciones = async () => {
    setLoadingClasificaciones(true);
    try {
      const response = await clasidEmprendAPI.getAll();
      if (response.success && response.data) {
        setClasificaciones(response.data);
        
        const sectores = [];
        const actividadesMap = {};
        
        response.data.forEach(item => {
          if (!sectores.includes(item.sector)) {
            sectores.push(item.sector);
            actividadesMap[item.sector] = [];
          }
          
          if (item.actividad && !actividadesMap[item.sector].includes(item.actividad)) {
            actividadesMap[item.sector].push(item.actividad);
          }
        });
        
        setSectoresUnicos(sectores);
        setActividadesPorSector(actividadesMap);
      } else {
        console.error('Error al cargar clasificaciones:', response.error);
        setSectoresUnicos(["Industria", "Comercio", "Agricultura"]);
        setActividadesPorSector({
          "Industria": ["Manufactura", "Construcción", "Energía"],
          "Comercio": ["Venta al por mayor", "Venta al por menor", "E-commerce"],
          "Agricultura": ["Cultivos", "Ganadería", "Pesca"]
        });
      }
    } catch (error) {
      console.error('Error en cargarClasificaciones:', error);
      setSectoresUnicos(["Industria", "Comercio", "Agricultura"]);
      setActividadesPorSector({
        "Industria": ["Manufactura", "Construcción", "Energía"],
        "Comercio": ["Venta al por mayor", "Venta al por menor", "E-commerce"],
        "Agricultura": ["Cultivos", "Ganadería", "Pesca"]
      });
    } finally {
      setLoadingClasificaciones(false);
    }
  };

  const cargarSolicitudes = async () => {
  setLoadingSolicitudes(true);
  try {
    const usuarioLogueado = usuarioAPI.getCurrentUser();
    if (usuarioLogueado && usuarioLogueado.cedula_usuario) {
      const response = await SolicitudAPI.getByCedula(usuarioLogueado.cedula_usuario);
      
      console.log("📊 Respuesta de la API:", response); // Para debugging
      
      // Verificar si la respuesta es exitosa y tiene datos
      if (response && response.success && response.data) {
        const solicitudesFormateadas = response.data.map(sol => ({
          id: sol.id_solicitud,
          fechaSolicitud: sol.fecha_solicitud,
          emprendimiento: sol.nombre_emprendimiento || 'Sin especificar',
          rifEmprendimiento: sol.cedula_emprendimiento || sol.cedula_persona,
          montoSolicitado: parseFloat(sol.monto_solicitado) || 0,
          estatus: sol.estatus || 'Pendiente',
          motivo_rechazo: sol.motivo_rechazo,
          destino: sol.solicitud,
          analista: 'Por asignar',
          clasificacion: sol.sector && sol.actividad ? `${sol.sector} - ${sol.actividad}` : 'No especificada',
          anos_experiencia: sol.anos_experiencia || 'No especificado',
          direccion_emprendimiento: sol.direccion_empredimiento || 'No especificada',
        }));
        
        console.log("📋 Solicitudes formateadas:", solicitudesFormateadas);
        setSolicitudes(solicitudesFormateadas);
      } else if (response && response.data && !response.success) {
        // Si la respuesta no tiene el formato success
        const solicitudesFormateadas = response.data.map(sol => ({
          id: sol.id_solicitud,
          fechaSolicitud: sol.fecha_solicitud,
          emprendimiento: sol.nombre_emprendimiento || 'Sin especificar',
          rifEmprendimiento: sol.cedula_emprendimiento || sol.cedula_persona,
          montoSolicitado: parseFloat(sol.monto_solicitado) || 0,
          estatus: sol.estatus || 'Pendiente',
          motivo_rechazo: sol.motivo_rechazo,
          destino: sol.solicitud,
          analista: 'Por asignar',
          clasificacion: 'No especificada',
          anos_experiencia: sol.anos_experiencia || 'No especificado',
          direccion_emprendimiento: sol.direccion_empredimiento || 'No especificada',
        }));
        
        setSolicitudes(solicitudesFormateadas);
      } else {
        setSolicitudes([]);
      }
    } else {
      console.log("No hay usuario logueado");
      setSolicitudes([]);
    }
  } catch (error) {
    console.error('❌ Error cargando solicitudes:', error);
    setSolicitudes([]);
  } finally {
    setLoadingSolicitudes(false);
  }
};

  const obtenerIdClasificacion = (sector, actividad) => {
    const clasificacion = clasificaciones.find(
      c => c.sector === sector && c.actividad === actividad
    );
    return clasificacion ? clasificacion.id_clasificacion : null;
  };

  const stats = {
    totalSolicitudes: solicitudes.length,
    montoTotal: solicitudes.reduce((acc, s) => acc + (s.montoSolicitado || 0), 0),
    solicitudesPendientes: solicitudes.filter((s) => s.estatus === "Pendiente").length,
    solicitudesAprobadas: solicitudes.filter((s) => s.estatus === "Aprobado").length,
    solicitudesRechazadas: solicitudes.filter((s) => s.estatus === "Rechazado").length,
  };

  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    const matchesSearch =
      solicitud.emprendimiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.id?.toString().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || solicitud.estatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "sectorEconomico") {
      setFormData((prev) => ({
        ...prev,
        subsector: "",
        id_clasificacion: "",
      }));
    }
    
    if (name === "subsector") {
      const id_clasificacion = obtenerIdClasificacion(formData.sectorEconomico, value);
      setFormData((prev) => ({
        ...prev,
        id_clasificacion: id_clasificacion || "",
      }));
    }
  };

  const handleNuevaSolicitud = () => {
    const usuarioLogueado = usuarioAPI.getCurrentUser();
    if (!usuarioLogueado || !usuarioLogueado.cedula_usuario) {
      alert("Debe iniciar sesión para crear una solicitud");
      navigate("/login");
      return;
    }
    
    setShowModal(true);
    setCurrentStep(1);
    setFormData({
      cedula_persona: usuarioLogueado.cedula_usuario,
      solicitud: "",
      monto_solicitado: "",
      fecha_solicitud: new Date().toISOString().split("T")[0],
      nombre_emprendimiento: "",
      direccion_empredimiento: "",
      cedula_emprendimiento: usuarioLogueado.cedula_usuario,
      anos_experiencia: "",
      id_clasificacion: "",
      sectorEconomico: "",
      subsector: "",
    });
  };

  const handleGuardarSolicitud = async () => {
    const usuarioLogueado = usuarioAPI.getCurrentUser();
    
    if (!usuarioLogueado || !usuarioLogueado.cedula_usuario) {
      alert("No se ha detectado un usuario logueado. Por favor, inicie sesión nuevamente.");
      navigate("/login");
      return;
    }
    
    if (!formData.solicitud || !formData.monto_solicitado || !formData.fecha_solicitud) {
      alert("Por favor completa los datos del crédito");
      setCurrentStep(1);
      return;
    }

    if (
      !formData.nombre_emprendimiento ||
      !formData.direccion_empredimiento ||
      !formData.anos_experiencia ||
      !formData.id_clasificacion
    ) {
      alert("Por favor completa todos los datos del emprendimiento");
      setCurrentStep(2);
      return;
    }

    setSaving(true);

    try {
      const solicitudData = {
        cedula_persona: usuarioLogueado.cedula_usuario,
        solicitud: formData.solicitud,
        fecha_solicitud: formData.fecha_solicitud,
        monto_solicitado: formData.monto_solicitado,
        estatus: "Pendiente"
      };

      console.log("📝 Enviando a solicitud:", solicitudData);
      const solicitudResponse = await SolicitudAPI.create(solicitudData);
      
      if (!solicitudResponse.success) {
        throw new Error(solicitudResponse.error || "Error al crear la solicitud");
      }

      const nuevaSolicitud = solicitudResponse.data;
      const id_solicitud = nuevaSolicitud.id_solicitud;
      console.log("✅ Solicitud creada con ID:", id_solicitud);

      const emprendimientoData = {
        id_solicitud: id_solicitud,
        id_clasificacion: parseInt(formData.id_clasificacion),
        cedula_emprendimiento: usuarioLogueado.cedula_usuario,
        anos_experiencia: formData.anos_experiencia,
        nombre_emprendimiento: formData.nombre_emprendimiento,
        direccion_empredimiento: formData.direccion_empredimiento
      };

      console.log("📝 Enviando a emprendimiento:", emprendimientoData);
      const emprendimientoResponse = await EmprendimientoAPI.create(emprendimientoData);
      
      if (!emprendimientoResponse.success) {
        console.error("Error al crear emprendimiento, eliminando solicitud...");
        await SolicitudAPI.delete(id_solicitud);
        throw new Error(emprendimientoResponse.error || "Error al crear el emprendimiento");
      }

      console.log("✅ Emprendimiento creado exitosamente");

      const clasificacion = clasificaciones.find(c => c.id_clasificacion === parseInt(formData.id_clasificacion));
      
      const nuevaSolicitudLocal = {
        id: nuevaSolicitud.id_solicitud,
        fechaSolicitud: formData.fecha_solicitud,
        emprendimiento: formData.nombre_emprendimiento,
        rifEmprendimiento: usuarioLogueado.cedula_usuario,
        montoSolicitado: parseFloat(formData.monto_solicitado) || 0,
        estatus: "Pendiente",
        motivo_rechazo: null,
        destino: formData.solicitud,
        analista: "Por asignar",
        clasificacion: clasificacion ? `${clasificacion.sector} - ${clasificacion.actividad}` : "No especificada",
        anos_experiencia: formData.anos_experiencia,
        direccion_emprendimiento: formData.direccion_empredimiento,
      };

      setSolicitudes([nuevaSolicitudLocal, ...solicitudes]);
      setShowModal(false);
      alert("✅ Solicitud guardada exitosamente");
      
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      alert(`Error al guardar la solicitud: ${error.message || "Intente nuevamente"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleVerDetalle = (solicitudId) => {
    navigate(`/solicitud/${solicitudId}`);
  };

  const handleVolver = () => {
    navigate(-1);
  };

  const getStatusColor = (estatus) => {
    const colores = {
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Aprobado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Rechazado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colores[estatus] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (estatus) => {
    switch (estatus) {
      case "Pendiente": return <Clock size={14} className="mr-1" />;
      case "Aprobado": return <CheckCircle size={14} className="mr-1" />;
      case "Rechazado": return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const user = {
    name: currentUser?.nombre_completo || "Usuario",
    email: currentUser?.cedula_usuario || "",
    role: currentUser?.rol === "admin" ? "Administrador" : "Emprendedor",
    avatar: null,
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        user={user}
        handleLogout={handleLogout}
        unreadCount={unreadCount}
        markAsRead={markAsRead}
      />

      <div className="flex flex-1">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab="creditos"
          setActiveTab={() => {}}
          darkMode={darkMode}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
          <div className="p-4 md:p-6 mt-16">
            <button 
              onClick={handleVolver} 
              className={`flex items-center gap-2 mb-4 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
            >
              <ChevronLeft size={20} />
              <span>Volver</span>
            </button>

            {/* Información de la persona */}
            <div className={`mb-6 p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-full ${persona.tipoPersona === "Jurídica" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                    {persona.tipoPersona === "Jurídica" ? <Building size={32} /> : <User size={32} />}
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {persona.nombreCompleto || "Cargando..."}
                    </h1>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {persona.tipoPersona || "Natural"} • C.I: {persona.cedula || currentUser?.cedula_usuario}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleNuevaSolicitud} 
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nueva Solicitud
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone size={16} className="text-gray-400" />
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Teléfonos</span>
                  </div>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{persona.telefono || "No registrado"}</p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={16} className="text-gray-400" />
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</span>
                  </div>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{persona.email || "No registrado"}</p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-gray-400" />
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dirección</span>
                  </div>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{persona.direccion || "No registrada"}</p>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                <p className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Solicitudes</p>
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{stats.totalSolicitudes}</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg border-l-4 border-yellow-500`}>
                <p className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.solicitudesPendientes}</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg border-l-4 border-green-500`}>
                <p className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.solicitudesAprobadas}</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg border-l-4 border-red-500`}>
                <p className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.solicitudesRechazadas}</p>
              </div>
            </div>

            {/* Filtros */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar por emprendimiento o ID..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className={`px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
              >
                <option value="todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* Tabla de solicitudes */}
            <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              {loadingSolicitudes ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F] mx-auto mb-4"></div>
                  <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Cargando solicitudes...</p>
                </div>
              ) : filteredSolicitudes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emprendimiento</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RIF</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clasificación</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estatus</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                      {filteredSolicitudes.map((solicitud) => (
                        <tr key={solicitud.id} className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors`}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-sm font-mono ${darkMode ? "text-white" : "text-gray-900"}`}>{solicitud.id}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{formatFecha(solicitud.fechaSolicitud)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{solicitud.emprendimiento}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{solicitud.rifEmprendimiento}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{formatMonto(solicitud.montoSolicitado)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{solicitud.clasificacion}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${getStatusColor(solicitud.estatus)}`}>
                              {getStatusIcon(solicitud.estatus)}{solicitud.estatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button 
                              onClick={() => handleVerDetalle(solicitud.id)} 
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>No hay solicitudes para mostrar</p>
                  <button 
                    onClick={handleNuevaSolicitud}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Crear primera solicitud
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MODAL - Formulario para ambas tablas */}
          {showModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setShowModal(false)}></div>
              <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full max-w-3xl rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-2xl max-h-[90vh] overflow-y-auto`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} sticky top-0 ${darkMode ? "bg-gray-800" : "bg-white"} z-10 flex justify-between items-center`}>
                    <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Nueva Solicitud de Crédito</h2>
                    <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="px-6 py-4">
                    {/* Mostrar información del usuario logueado */}
                    <div className={`mb-4 p-3 rounded-lg ${darkMode ? "bg-blue-900/30" : "bg-blue-50"} text-sm`}>
                      <p className={`${darkMode ? "text-blue-300" : "text-blue-800"}`}>
                        📌 Solicitante: {persona.nombreCompleto || currentUser?.cedula_usuario} (C.I: {currentUser?.cedula_usuario})
                      </p>
                      <p className={`${darkMode ? "text-blue-300" : "text-blue-800"} text-xs mt-1`}>
                        La cédula se asignará automáticamente a la solicitud y al emprendimiento
                      </p>
                    </div>

                    {/* Paso 1: Datos de la solicitud */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>📋 Datos de la Solicitud</h3>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Motivo / Descripción <span className="text-red-500">*</span>
                          </label>
                          <textarea 
                            name="solicitud" 
                            value={formData.solicitud} 
                            onChange={handleChange} 
                            rows="3" 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                            placeholder="Describa detalladamente el motivo del préstamo..." 
                            required 
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Monto Solicitado (Bs.) <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="number" 
                            name="monto_solicitado" 
                            value={formData.monto_solicitado} 
                            onChange={handleChange} 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                            placeholder="0.00" 
                            min="0" 
                            required 
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Fecha de Solicitud <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="date" 
                            name="fecha_solicitud" 
                            value={formData.fecha_solicitud} 
                            onChange={handleChange} 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                            required 
                          />
                        </div>
                      </div>
                    )}

                    {/* Paso 2: Datos del emprendimiento */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>🏢 Datos del Emprendimiento</h3>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Nombre del Emprendimiento <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            name="nombre_emprendimiento" 
                            value={formData.nombre_emprendimiento} 
                            onChange={handleChange} 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                            placeholder="Ej: Panadería La Espiga" 
                            required 
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            RIF / Cédula del Emprendimiento <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            name="cedula_emprendimiento" 
                            value={formData.cedula_emprendimiento} 
                            onChange={handleChange} 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-gray-100 dark:bg-gray-600`} 
                            placeholder="J-12345678-9" 
                            required 
                            readOnly
                          />
                          <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Se usa la misma cédula del solicitante automáticamente
                          </p>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Dirección del Emprendimiento <span className="text-red-500">*</span>
                          </label>
                          <textarea 
                            name="direccion_empredimiento" 
                            value={formData.direccion_empredimiento} 
                            onChange={handleChange} 
                            rows="2" 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                            placeholder="Dirección completa" 
                            required 
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Años de Experiencia <span className="text-red-500">*</span>
                          </label>
                          <select 
                            name="anos_experiencia" 
                            value={formData.anos_experiencia} 
                            onChange={handleChange} 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                            required
                          >
                            <option value="">Seleccione</option>
                            {añosOperando.map((año) => (
                              <option key={año} value={año}>{año}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Sector Económico <span className="text-red-500">*</span>
                          </label>
                          <select 
                            name="sectorEconomico" 
                            value={formData.sectorEconomico} 
                            onChange={handleChange} 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                            disabled={loadingClasificaciones} 
                            required
                          >
                            <option value="">{loadingClasificaciones ? "Cargando..." : "Seleccione un sector"}</option>
                            {sectoresUnicos.map((sector) => (
                              <option key={sector} value={sector}>{sector}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Actividad / Subsector <span className="text-red-500">*</span>
                          </label>
                          <select 
                            name="subsector" 
                            value={formData.subsector} 
                            onChange={handleChange} 
                            disabled={!formData.sectorEconomico} 
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`} 
                            required
                          >
                            <option value="">
                              {!formData.sectorEconomico ? "Primero seleccione un sector" : "Seleccione una actividad"}
                            </option>
                            {formData.sectorEconomico && actividadesPorSector[formData.sectorEconomico]?.map((actividad) => (
                              <option key={actividad} value={actividad}>{actividad}</option>
                            ))}
                          </select>
                        </div>

                        {formData.id_clasificacion && (
                          <div className={`p-3 rounded-lg ${darkMode ? "bg-green-900/30" : "bg-green-50"}`}>
                            <p className={`text-sm ${darkMode ? "text-green-300" : "text-green-800"}`}>
                              ✓ Clasificación ID: {formData.id_clasificacion} asignada automáticamente
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowModal(false)} 
                        className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                      >
                        {currentStep === 1 ? "Cancelar" : "Anterior"}
                      </button>
                      {currentStep < 2 ? (
                        <button 
                          onClick={() => setCurrentStep(currentStep + 1)} 
                          className="px-6 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg" 
                          disabled={saving}
                        >
                          Siguiente
                        </button>
                      ) : (
                        <button 
                          onClick={handleGuardarSolicitud} 
                          className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2" 
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Check size={18} /> Guardar Solicitud
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Footer darkMode={darkMode} />
        </main>
      </div>
    </div>
  );
};

export default SolicitudesPersona;