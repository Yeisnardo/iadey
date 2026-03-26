// pages/SolicitudesPersona.jsx
import React, { useState } from "react";
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

const SolicitudesPersona = () => {
  const navigate = useNavigate();
  const { personaId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Paso 1
    motivo: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],

    // Paso 2 - DATOS DEL EMPRENDIMIENTO (igual que en RegistroEmprendedor)
    aniosOperando: "",
    sectorEconomico: "",
    subsector: "",
  });

  // ============================================
  // DATOS PARA LOS SELECTORES (copiados de RegistroEmprendedor)
  // ============================================

  // SELECTOR 1: SECTORES ECONÓMICOS
  const sectoresEconomicos = [
    { valor: "primario", etiqueta: "🌱 Sector Primario (Recursos Naturales)" },
    {
      valor: "secundario",
      etiqueta: "🏭 Sector Secundario (Transformación/Industria)",
    },
    { valor: "terciario", etiqueta: "💼 Sector Terciario (Servicios)" },
    {
      valor: "cuaternario",
      etiqueta: "🧠 Sector Cuaternario (Conocimiento e I+D)",
    },
    { valor: "quinario", etiqueta: "🏛️ Sector Quinario (Alta Dirección)" },
  ];

  // SELECTOR 2: SUBSECTORES (dependen del sector seleccionado)
  const subsectoresPorSector = {
    primario: [
      "🌾 Agricultura (Cereales, Fruticultura, Horticultura)",
      "🐄 Ganadería (Bovina, Avicultura, Apicultura)",
      "🐟 Pesca y Acuicultura (Bajura, Piscifactorías)",
      "🌲 Silvicultura (Madera, Corcho, Resinas)",
      "⛏️ Minería (Metálica, Canteras, Piedras preciosas)",
      "🛢️ Extracción de Petróleo y Gas",
    ],
    secundario: [
      "🥩 Industria Alimentaria (Cárnica, Láctea, Bebidas)",
      "👕 Industria Textil (Confección, Calzado)",
      "🧪 Industria Química (Farmacéutica, Cosmética)",
      "⚙️ Metalurgia y Siderurgia (Acero, Aluminio)",
      "🚗 Industria Automotriz (Vehículos, Autopartes)",
      "🔌 Industria Eléctrica y Electrónica",
      "🏗️ Construcción (Edificación, Obra civil)",
      "🪑 Industria Maderera y del Mueble",
      "📄 Industria Papelera y Artes Gráficas",
      "🥤 Industria del Plástico y Caucho",
      "⚡ Energía (Generación, Renovables)",
    ],
    terciario: [
      "🛒 Comercio (Minorista, Mayorista, E-commerce)",
      "🚚 Transporte y Logística",
      "🏨 Hostelería y Turismo (Hoteles, Restaurantes)",
      "💰 Servicios Financieros (Banca, Seguros, Fintech)",
      "🏢 Servicios Inmobiliarios",
      "📚 Educación (Colegios, Universidades, E-learning)",
      "🏥 Sanidad y Servicios Sociales",
      "👔 Servicios Profesionales (Abogados, Consultores)",
      "💻 Tecnologías de la Información (TI)",
      "🎬 Ocio, Cultura y Entretenimiento",
      "💇 Servicios Personales (Peluquerías, Funerarias)",
    ],
    cuaternario: [
      "🔬 Investigación y Desarrollo (Biotecnología, Nanotecnología)",
      "🤖 Alta Tecnología (IA, Robótica, Big Data)",
      "📊 Servicios Avanzados (Consultoría estratégica)",
      "🎓 Educación Superior e Investigación",
    ],
    quinario: [
      "👔 Alta Dirección (CEO, Consejos de Administración)",
      "🏛️ Sector Público de Alto Nivel (Ministerios, Diplomacia)",
      "❤️ ONGs, Fundaciones y Asociaciones",
      "🎭 Liderazgo Social y Cultural",
    ],
  };

  // Años operando
  const añosOperando = [
    "Menos de 1 año",
    "1 a 3 años",
    "3 a 5 años",
    "5 a 10 años",
    "Más de 10 años",
  ];

  // Datos del usuario
  const user = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Notificaciones del sistema", time: "5 min", read: false },
  ]);

  // ============================================
  // DATOS DE LA PERSONA (incluyendo datos del emprendimiento)
  // ============================================
  const [persona] = useState({
    id: "PERS-001",
    tipoPersona: "Natural",
    nombreCompleto: "María González",
    cedula: "V-12345678",
    rif: "V-12345678-9",
    telefono: "0412-1234567",
    telefono2: "0424-1234567",
    email: "maria.gonzalez@email.com",
    email2: "maria.trabajo@email.com",
    direccion: "Av. Principal, Casa #123, Cagua",
    municipio: "Sucre",
    estado: "Aragua",
    fechaRegistro: "2024-01-15",
    ocupacion: "Comerciante",
    estadoCivil: "Soltera",
    fechaNacimiento: "1985-05-20",
    nacionalidad: "Venezolana",
    // DATOS DEL EMPRENDIMIENTO REGISTRADOS
    aniosOperando: "3 a 5 años",
    sectorEconomico: "terciario",
    subsector: "🛒 Comercio (Minorista, Mayorista, E-commerce)",
  });

  // ============================================
  // SOLICITUDES DE ESTA PERSONA
  // ============================================
  const [solicitudes, setSolicitudes] = useState([
    {
      id: "SOL-001",
      fechaSolicitud: "2024-03-15",
      horaSolicitud: "10:30 AM",
      emprendimiento: "Panadería La Espiga",
      rifEmprendimiento: "J-12345678-9",
      direccionEmprendimiento: "Av. Principal, Local 5, Cagua",
      municipioEmprendimiento: "Sucre",
      estadoEmprendimiento: "Aragua",
      tipoEmprendimiento: "Comercial",
      sector: "Alimentos",
      empleados: 5,
      montoSolicitado: 5000,
      plazo: 12,
      destino: "Capital de trabajo",
      ingresosMensuales: 2000,
      egresosMensuales: 1200,
      tieneCreditoPrevio: "No",
      analista: "Carlos Rodríguez",
      fechaAsignacion: "2024-03-15",
      estatus: "Pendiente",
      observaciones: "Documentación completa, en espera de revisión",
      documentos: {
        cedula: "cedula_maria.pdf",
        rif: "rif_maria.pdf",
        registroComercio: "registro_panaderia.pdf",
        estadosFinancieros: "estados_maria.pdf",
      },
    },
    {
      id: "SOL-002",
      fechaSolicitud: "2024-02-10",
      horaSolicitud: "09:15 AM",
      emprendimiento: "Panadería La Espiga - Sucursal",
      rifEmprendimiento: "J-12345678-9",
      direccionEmprendimiento: "Calle 5, La Victoria",
      municipioEmprendimiento: "José Félix Ribas",
      estadoEmprendimiento: "Aragua",
      tipoEmprendimiento: "Comercial",
      sector: "Alimentos",
      empleados: 3,
      montoSolicitado: 3000,
      plazo: 6,
      destino: "Compra de equipos",
      ingresosMensuales: 1500,
      egresosMensuales: 800,
      tieneCreditoPrevio: "No",
      analista: "Ana Martínez",
      fechaAsignacion: "2024-02-10",
      estatus: "Aprobado",
      observaciones: "Crédito aprobado y desembolsado",
      documentos: {
        cedula: "cedula_maria.pdf",
        rif: "rif_maria.pdf",
        registroComercio: "registro_sucursal.pdf",
        estadosFinancieros: "estados_febrero.pdf",
      },
    },
    {
      id: "SOL-003",
      fechaSolicitud: "2024-01-05",
      horaSolicitud: "02:30 PM",
      emprendimiento: "Panadería La Espiga - Ampliación",
      rifEmprendimiento: "J-12345678-9",
      direccionEmprendimiento: "Av. Principal, Local 5, Cagua",
      municipioEmprendimiento: "Sucre",
      estadoEmprendimiento: "Aragua",
      tipoEmprendimiento: "Comercial",
      sector: "Alimentos",
      empleados: 2,
      montoSolicitado: 2000,
      plazo: 4,
      destino: "Adecuación de local",
      ingresosMensuales: 1000,
      egresosMensuales: 600,
      tieneCreditoPrevio: "No",
      analista: "Luis García",
      fechaAsignacion: "2024-01-05",
      estatus: "Rechazado",
      observaciones: "No cumplía con los requisitos mínimos",
      documentos: {
        cedula: "cedula_maria.pdf",
        rif: "rif_maria.pdf",
        registroComercio: "registro_original.pdf",
        estadosFinancieros: "estados_enero.pdf",
      },
    },
  ]);

  // ============================================
  // ESTADÍSTICAS
  // ============================================
  const stats = {
    totalSolicitudes: solicitudes.length,
    montoTotal: solicitudes.reduce((acc, s) => acc + s.montoSolicitado, 0),
    solicitudesPendientes: solicitudes.filter((s) => s.estatus === "Pendiente")
      .length,
    solicitudesAprobadas: solicitudes.filter((s) => s.estatus === "Aprobado")
      .length,
    solicitudesRechazadas: solicitudes.filter((s) => s.estatus === "Rechazado")
      .length,
    montoAprobado: solicitudes
      .filter((s) => s.estatus === "Aprobado")
      .reduce((acc, s) => acc + s.montoSolicitado, 0),
    montoPendiente: solicitudes
      .filter((s) => s.estatus === "Pendiente")
      .reduce((acc, s) => acc + s.montoSolicitado, 0),
  };

  // ============================================
  // FILTROS
  // ============================================
  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    const matchesSearch =
      solicitud.emprendimiento
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      solicitud.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.analista.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || solicitud.estatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ============================================
  // FUNCIONES
  // ============================================
  const handleVerDetalle = (solicitudId) => {
    console.log("Ver detalle de solicitud:", solicitudId);
    navigate(`/solicitud/${solicitudId}`);
  };

  const handleEditar = (solicitudId) => {
    console.log("Editar solicitud:", solicitudId);
    navigate(`/solicitud/editar/${solicitudId}`);
  };

  const handleEliminar = (solicitudId) => {
    if (window.confirm("¿Está seguro de eliminar esta solicitud?")) {
      setSolicitudes(solicitudes.filter((s) => s.id !== solicitudId));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Resetear subsector cuando cambia sector económico
    if (name === "sectorEconomico") {
      setFormData((prev) => ({
        ...prev,
        subsector: "",
      }));
    }
  };

  const handleNuevaSolicitud = () => {
    setShowModal(true);
    setCurrentStep(1);
    setFormData({
      // Paso 1
      motivo: "",
      monto: "",
      fecha: new Date().toISOString().split("T")[0],

      // Paso 2 - PRECARGAR DATOS DEL EMPRENDIMIENTO DE LA PERSONA
      aniosOperando: persona.aniosOperando || "",
      sectorEconomico: persona.sectorEconomico || "",
      subsector: persona.subsector || "",
    });
  };

  const handleGuardarSolicitud = () => {
    // Validar campos del paso 2
    if (
      !formData.aniosOperando ||
      !formData.sectorEconomico ||
      !formData.subsector
    ) {
      alert("Por favor completa todos los datos del emprendimiento");
      setCurrentStep(2);
      return;
    }

    // Validar motivo y monto
    if (!formData.motivo || !formData.monto) {
      alert("Por favor completa el motivo y el monto solicitado");
      setCurrentStep(1);
      return;
    }

    // Crear nueva solicitud
    const nuevaSolicitud = {
      id: `SOL-${String(solicitudes.length + 1).padStart(3, "0")}`,
      fechaSolicitud: formData.fecha,
      horaSolicitud: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      emprendimiento: "Nuevo Emprendimiento",
      rifEmprendimiento: "Pendiente",
      direccionEmprendimiento: "Pendiente",
      municipioEmprendimiento: "Pendiente",
      estadoEmprendimiento: "Pendiente",
      tipoEmprendimiento: "Comercial",
      sector: formData.subsector || "Otro",
      empleados: 0,
      montoSolicitado: parseFloat(formData.monto) || 0,
      plazo: 12,
      destino: formData.motivo || "No especificado",
      ingresosMensuales: 0,
      egresosMensuales: 0,
      tieneCreditoPrevio: "No",
      analista: user.name,
      fechaAsignacion: new Date().toISOString().split("T")[0],
      estatus: "Pendiente",
      observaciones: `Años operando: ${formData.aniosOperando}`,
      documentos: {},
    };

    setSolicitudes([nuevaSolicitud, ...solicitudes]);
    setShowModal(false);

    // Resetear formulario
    setCurrentStep(1);
    setFormData({
      motivo: "",
      monto: "",
      fecha: new Date().toISOString().split("T")[0],
      aniosOperando: "",
      sectorEconomico: "",
      subsector: "",
    });

    alert("Solicitud guardada exitosamente");
  };

  const handleVolver = () => {
    navigate(-1);
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const getStatusColor = (estatus) => {
    const colores = {
      Pendiente:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Aprobado:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Rechazado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "En Proceso":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return colores[estatus] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (estatus) => {
    switch (estatus) {
      case "Pendiente":
        return <Clock size={14} className="mr-1" />;
      case "En Proceso":
        return <AlertCircle size={14} className="mr-1" />;
      case "Aprobado":
        return <CheckCircle size={14} className="mr-1" />;
      case "Rechazado":
        return <XCircle size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ============================================
  // RENDER
  // ============================================
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("rememberToken");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
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

        <main
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}
        >
          <div className="p-4 md:p-6 mt-16">
            {/* BOTÓN VOLVER */}
            <button
              onClick={handleVolver}
              className={`flex items-center gap-2 mb-4 ${
                darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              } transition-colors`}
            >
              <ChevronLeft size={20} />
              <span>Volver a la lista</span>
            </button>

            {/* ============================================ */}
            {/* INFORMACIÓN DE LA PERSONA */}
            {/* ============================================ */}
            <div
              className={`mb-6 p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-4 rounded-full ${
                      persona.tipoPersona === "Jurídica"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {persona.tipoPersona === "Jurídica" ? (
                      <Building size={32} />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div>
                    <h1
                      className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {persona.nombreCompleto}
                    </h1>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {persona.tipoPersona} • Registrado desde{" "}
                      {formatFecha(persona.fechaRegistro)}
                    </p>
                  </div>
                </div>

                {/* BOTÓN NUEVA SOLICITUD */}
                <button
                  onClick={handleNuevaSolicitud}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nueva Solicitud
                </button>
              </div>

              {/* Datos de contacto en tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div
                  className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Phone size={16} className="text-gray-400" />
                    <span
                      className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Teléfonos
                    </span>
                  </div>
                  <p
                    className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    {persona.telefono}
                  </p>
                  {persona.telefono2 && (
                    <p
                      className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {persona.telefono2}
                    </p>
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={16} className="text-gray-400" />
                    <span
                      className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Emails
                    </span>
                  </div>
                  <p
                    className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    {persona.email}
                  </p>
                  {persona.email2 && (
                    <p
                      className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {persona.email2}
                    </p>
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-gray-400" />
                    <span
                      className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Dirección
                    </span>
                  </div>
                  <p
                    className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    {persona.direccion}
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {persona.municipio}, {persona.estado}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-gray-400" />
                    <span
                      className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Documentos
                    </span>
                  </div>
                  <p
                    className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    C.I: {persona.cedula}
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    RIF: {persona.rif}
                  </p>
                </div>
              </div>

              {/* Mostrar datos del emprendimiento registrados */}
              <div
                className={`mt-4 p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-green-50"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase size={16} className="text-green-600" />
                  <span
                    className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Datos del Emprendimiento Registrados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Años operando
                    </p>
                    <p
                      className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {persona.aniosOperando || "No registrado"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Sector económico
                    </p>
                    <p
                      className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {persona.sectorEconomico || "No registrado"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Subsector
                    </p>
                    <p
                      className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {persona.subsector || "No registrado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* TARJETAS DE ESTADÍSTICAS */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
              >
                <p
                  className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Total Solicitudes
                </p>
                <p
                  className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                >
                  {stats.totalSolicitudes}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg border-l-4 border-yellow-500`}
              >
                <p
                  className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.solicitudesPendientes}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg border-l-4 border-green-500`}
              >
                <p
                  className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Aprobadas
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.solicitudesAprobadas}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg border-l-4 border-red-500`}
              >
                <p
                  className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Rechazadas
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.solicitudesRechazadas}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg col-span-2`}
              >
                <p
                  className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Monto Total Solicitado
                </p>
                <p
                  className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                >
                  {formatMonto(stats.montoTotal)}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
              >
                <p
                  className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Monto Aprobado
                </p>
                <p className={`text-lg font-bold text-green-600`}>
                  {formatMonto(stats.montoAprobado)}
                </p>
              </div>
            </div>

            {/* ============================================ */}
            {/* FILTROS Y BÚSQUEDA */}
            {/* ============================================ */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por emprendimiento, ID, destino o analista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            </div>

            {/* ============================================ */}
            {/* TABLA DE SOLICITUDES */}
            {/* ============================================ */}
            <div
              className={`rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
            >
              {filteredSolicitudes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead
                      className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Emprendimiento
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Monto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Plazo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Destino
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Analista
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Estatus
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                    >
                      {filteredSolicitudes.map((solicitud) => (
                        <tr
                          key={solicitud.id}
                          className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`text-sm font-mono font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {solicitud.id}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span
                                className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                              >
                                {formatFecha(solicitud.fechaSolicitud)}
                              </span>
                              <span
                                className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                              >
                                {solicitud.horaSolicitud}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span
                                className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {solicitud.emprendimiento}
                              </span>
                              <span
                                className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                              >
                                {solicitud.rifEmprendimiento}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <DollarSign
                                size={14}
                                className="mr-1 text-green-500"
                              />
                              <span
                                className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {formatMonto(solicitud.montoSolicitado)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                            >
                              {solicitud.plazo} meses
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                            >
                              {solicitud.destino}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                            >
                              {solicitud.analista}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${getStatusColor(solicitud.estatus)}`}
                            >
                              {getStatusIcon(solicitud.estatus)}
                              {solicitud.estatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleVerDetalle(solicitud.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                title="Ver detalles"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEditar(solicitud.id)}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleEliminar(solicitud.id)}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p
                    className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    No hay solicitudes para mostrar
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-4`}
                  >
                    {searchTerm
                      ? "Intente con otros términos de búsqueda"
                      : "Esta persona no tiene solicitudes registradas"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleNuevaSolicitud}
                      className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Crear Primera Solicitud
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Resumen de la persona */}
            {filteredSolicitudes.length > 0 && (
              <div
                className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-blue-50"}`}
              >
                <h3
                  className={`text-sm font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}
                >
                  Resumen de {persona.nombreCompleto}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Total solicitado
                    </p>
                    <p
                      className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {formatMonto(stats.montoTotal)}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Monto aprobado
                    </p>
                    <p className={`text-sm font-bold text-green-600`}>
                      {formatMonto(stats.montoAprobado)}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Tasa de aprobación
                    </p>
                    <p
                      className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {stats.totalSolicitudes > 0
                        ? Math.round(
                            (stats.solicitudesAprobadas /
                              stats.totalSolicitudes) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Promedio por solicitud
                    </p>
                    <p
                      className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {formatMonto(stats.montoTotal / stats.totalSolicitudes)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* MODAL DE NUEVA SOLICITUD DE CRÉDITO (SIN DOCUMENTOS) */}
          {/* ============================================ */}
          {showModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              {/* Fondo oscuro */}
              <div
                className="fixed inset-0 bg-black transition-opacity duration-300"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
                onClick={() => setShowModal(false)}
              ></div>

              {/* Modal */}
              <div className="flex min-h-full items-center justify-center p-4">
                <div
                  className={`relative w-full max-w-3xl rounded-xl ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } shadow-2xl transform transition-all`}
                >
                  {/* Header del Modal */}
                  <div
                    className={`px-6 py-4 border-b ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } flex items-center justify-between`}
                  >
                    <div>
                      <h2
                        className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                      >
                        Nueva Solicitud de Crédito
                      </h2>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Para: {persona.nombreCompleto}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className={`p-2 rounded-lg ${
                        darkMode
                          ? "hover:bg-gray-700 text-gray-400"
                          : "hover:bg-gray-100 text-gray-600"
                      } transition-colors`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* PASOS DEL FORMULARIO - SOLO 2 PASOS */}
                  <div className="px-6 py-4">
                    {/* Indicador de pasos */}
                    <div className="flex items-center justify-between mb-8">
                      {[1, 2].map((step) => (
                        <React.Fragment key={step}>
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentStep >= step
                                  ? "bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white"
                                  : darkMode
                                    ? "bg-gray-700 text-gray-400"
                                    : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {currentStep > step ? <Check size={16} /> : step}
                            </div>
                            <span
                              className={`ml-2 text-sm hidden sm:block ${
                                currentStep >= step
                                  ? darkMode
                                    ? "text-white"
                                    : "text-gray-800"
                                  : darkMode
                                    ? "text-gray-500"
                                    : "text-gray-400"
                              }`}
                            >
                              {step === 1
                                ? "Datos del Crédito"
                                : "Datos del Emprendimiento"}
                            </span>
                          </div>
                          {step < 2 && (
                            <div
                              className={`flex-1 h-0.5 mx-4 ${
                                currentStep > step
                                  ? "bg-gradient-to-r from-[#264653] to-[#2A9D8F]"
                                  : darkMode
                                    ? "bg-gray-700"
                                    : "bg-gray-200"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* PASO 1: MOTIVO, MONTO Y FECHA */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <h3
                          className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}
                        >
                          Datos del Crédito
                        </h3>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Motivo del préstamo{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="motivo"
                            value={formData.motivo}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 placeholder-gray-500"
                            } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] resize-none`}
                            placeholder="Describa detalladamente el motivo del préstamo..."
                            required
                          />
                          <p
                            className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                          >
                            Describa el propósito del crédito, cómo será
                            utilizado y los beneficios esperados.
                          </p>
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Monto solicitado (Bs.){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <DollarSign
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <input
                              type="number"
                              name="monto"
                              value={formData.monto}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                                darkMode
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                              placeholder="0.00"
                              min="0"
                              step="100"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Fecha de solicitud{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <input
                              type="date"
                              name="fecha"
                              value={formData.fecha}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                                darkMode
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PASO 2: DATOS DEL EMPRENDIMIENTO */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3
                          className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}
                        >
                          Datos del Emprendimiento (Registrados por el
                          emprendedor)
                        </h3>

                        <div className="space-y-5">
                          {/* CAMPO 1: Años operando (SELECT) */}
                          <div>
                            <label
                              className={`block text-sm font-medium mb-2 ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Años Operando{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="aniosOperando"
                              value={formData.aniosOperando || ""}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                              required
                            >
                              <option value="">
                                Selecciona tiempo operando
                              </option>
                              {añosOperando.map((año) => (
                                <option key={año} value={año}>
                                  {año}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* CAMPO 2: Sector Económico (SELECT) */}
                          <div>
                            <label
                              className={`block text-sm font-medium mb-2 ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Sector Económico{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="sectorEconomico"
                              value={formData.sectorEconomico || ""}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                              required
                            >
                              <option value="">Selecciona un sector</option>
                              {sectoresEconomicos.map((sector) => (
                                <option key={sector.valor} value={sector.valor}>
                                  {sector.etiqueta}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* CAMPO 3: Subsector (SELECT DEPENDIENTE) */}
                          <div>
                            <label
                              className={`block text-sm font-medium mb-2 ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Subsector / Actividad Específica{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="subsector"
                              value={formData.subsector || ""}
                              onChange={handleChange}
                              disabled={!formData.sectorEconomico}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode
                                  ? "bg-gray-700 border-gray-600 text-white disabled:opacity-50 disabled:bg-gray-800"
                                  : "bg-white border-gray-300 disabled:opacity-50 disabled:bg-gray-100"
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                              required
                            >
                              <option value="">Selecciona un subsector</option>
                              {formData.sectorEconomico &&
                                subsectoresPorSector[
                                  formData.sectorEconomico
                                ]?.map((subsector) => (
                                  <option key={subsector} value={subsector}>
                                    {subsector}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Mensaje informativo */}
                          <div
                            className={`p-4 rounded-lg mt-4 ${
                              darkMode ? "bg-blue-900/30" : "bg-blue-50"
                            }`}
                          >
                            <p
                              className={`text-sm flex items-start gap-2 ${
                                darkMode ? "text-blue-300" : "text-blue-800"
                              }`}
                            >
                              <AlertCircle
                                size={18}
                                className="flex-shrink-0 mt-0.5"
                              />
                              <span>
                                Estos son los datos que el emprendedor registró.
                                Puedes actualizarlos si es necesario.
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BOTONES DE NAVEGACIÓN */}
                    <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() =>
                          currentStep > 1
                            ? setCurrentStep(currentStep - 1)
                            : setShowModal(false)
                        }
                        className={`px-4 py-2 rounded-lg ${
                          darkMode
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } transition-colors`}
                      >
                        {currentStep === 1 ? "Cancelar" : "Anterior"}
                      </button>

                      <div className="flex gap-2">
                        {currentStep < 2 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="px-6 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all"
                          >
                            Siguiente
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGuardarSolicitud}
                            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <Check size={18} />
                            Guardar Solicitud
                          </button>
                        )}
                      </div>
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
