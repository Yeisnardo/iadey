import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardCheck,
  User,
  Mail,
  FileCheck,
  FileX,
  Loader,
  Filter,
  Info,
  RefreshCw
} from "lucide-react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import aprobacionAPI from "../services/api_aprobacion";
import requisitosAPI from "../services/api_requisitos";

const Aprobacion = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nueva aprobación pendiente de revisión", time: "5 min", read: false },
    { id: 2, text: "Inspección de emprendimiento programada", time: "1 hora", read: false },
    { id: 3, text: "Solicitud de crédito en revisión", time: "3 horas", read: true },
    { id: 4, text: "Contrato listo para firma", time: "1 día", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("aprobaciones");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [aprobaciones, setAprobaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAprobacion, setSelectedAprobacion] = useState(null);

  const [showVerificacionModal, setShowVerificacionModal] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState(null);
  const [requisitosExpediente, setRequisitosExpediente] = useState([]);
  const [loadingRequisitos, setLoadingRequisitos] = useState(false);
  const [savingRequisitos, setSavingRequisitos] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [seleccionManejo, setSeleccionManejo] = useState("");
  const [idInspeccion, setIdInspeccion] = useState("");

  const user = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
    department: "Gestión de Créditos",
    joinDate: "Enero 2024",
    pendingTasks: 8,
    completedTasks: 45,
    performance: "98%"
  };

  // Cargar aprobaciones (expedientes)
  const loadAprobaciones = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando expedientes...');
      const response = await aprobacionAPI.getAll();
      
      if (response.success) {
        console.log('Expedientes cargados:', response.data.length);
        setAprobaciones(response.data);
      } else {
        setError(response.error || 'Error desconocido al cargar expedientes');
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error de conexión al cargar los expedientes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar todos los requisitos disponibles
  const loadTodosRequisitos = async () => {
    try {
      const response = await requisitosAPI.getAll();
      if (response.success) {
        const requisitosFormateados = response.data.map(req => ({
          id_requisito: req.id_requisitos || req.id_requisito,
          nombre: req.nombre_requisito || req.nombre,
          descripcion: req.descripcion || '',
          verificado: false
        }));
        return requisitosFormateados;
      }
      return [];
    } catch (err) {
      console.error('Error al cargar requisitos:', err);
      return [];
    }
  };

  // Abrir modal de detalle
  const handleOpenDetail = (aprobacion) => {
    setSelectedAprobacion(aprobacion);
    setShowDetailModal(true);
  };

  // Abrir modal de verificación
  // Abrir modal de verificación
const handleOpenVerificacion = async (aprobacion) => {
  setSelectedAprobacion(aprobacion);
  setObservaciones(aprobacion.observaciones || "");
  setSeleccionManejo(aprobacion.seleccion_manejo || "");
  // MODIFICADO: Por defecto usa el id_expediente, o el id_inspeccion existente si tiene
  setIdInspeccion(
    aprobacion.id_inspeccion 
      ? aprobacion.id_inspeccion.toString() 
      : aprobacion.id_expediente.toString()
  );
  setLoadingRequisitos(true);
  
  try {
    console.log('Abriendo verificación para expediente:', aprobacion.id_expediente);
    console.log('ID de Inspección por defecto:', aprobacion.id_expediente);
    
    // Verificar si ya tiene requisitos verificados
    if (aprobacion.verificacion_requisitos && 
        Array.isArray(aprobacion.verificacion_requisitos) && 
        aprobacion.verificacion_requisitos.length > 0) {
      console.log('Usando requisitos ya verificados');
      setRequisitosExpediente(aprobacion.verificacion_requisitos);
    } 
    // Verificar si tiene requisitos del expediente
    else if (aprobacion.requisitos_expediente && 
             Array.isArray(aprobacion.requisitos_expediente) && 
             aprobacion.requisitos_expediente.length > 0) {
      console.log('Usando requisitos del expediente');
      const requisitosConEstado = aprobacion.requisitos_expediente.map(req => ({
        ...req,
        verificado: false
      }));
      setRequisitosExpediente(requisitosConEstado);
    } 
    // Cargar todos los requisitos disponibles
    else {
      console.log('Cargando todos los requisitos');
      const requisitos = await loadTodosRequisitos();
      setRequisitosExpediente(requisitos);
    }
    
    setShowVerificacionModal(true);
  } catch (err) {
    console.error('Error al abrir modal de verificación:', err);
    alert('Error al cargar los requisitos');
  } finally {
    setLoadingRequisitos(false);
  }
};

  // Cerrar modales
  const handleCloseModals = () => {
    setShowDetailModal(false);
    setShowVerificacionModal(false);
    setSelectedAprobacion(null);
    setRequisitosExpediente([]);
    setObservaciones("");
    setSeleccionManejo("");
    setIdInspeccion("");
  };

  // Toggle requisito verificado/no verificado
  const toggleRequisito = (index) => {
    const nuevosRequisitos = [...requisitosExpediente];
    nuevosRequisitos[index] = {
      ...nuevosRequisitos[index],
      verificado: !nuevosRequisitos[index].verificado
    };
    setRequisitosExpediente(nuevosRequisitos);
  };

  // Guardar verificación de requisitos
  const handleSaveVerificacion = async () => {
    if (!selectedAprobacion) {
      alert('❌ No hay expediente seleccionado');
      return;
    }
    
    // Validar ID de inspección si se proporciona
    if (idInspeccion && idInspeccion.trim() !== '') {
      if (isNaN(parseInt(idInspeccion))) {
        alert('❌ El ID de inspección debe ser un número válido');
        return;
      }
    }
    
    // Validar que el ID del expediente existe
    console.log('=== DEBUG: Información del Expediente ===');
    console.log('ID Expediente:', selectedAprobacion.id_expediente);
    console.log('ID Inspección:', idInspeccion);
    console.log('Tipo de ID:', typeof selectedAprobacion.id_expediente);
    console.log('Expediente completo:', selectedAprobacion);
    
    if (!selectedAprobacion.id_expediente) {
      alert('❌ Error: El expediente no tiene un ID válido');
      return;
    }
    
    // Validar que todos los requisitos tengan id_requisito y nombre
    const requisitosInvalidos = requisitosExpediente.some(r => !r.id_requisito || !r.nombre);
    if (requisitosInvalidos) {
      console.error('Requisitos inválidos:', requisitosExpediente.filter(r => !r.id_requisito || !r.nombre));
      alert('❌ Hay requisitos sin ID o nombre');
      return;
    }
    
    const todosVerificados = requisitosExpediente.every(r => r.verificado);
    if (todosVerificados && !seleccionManejo) {
      alert('⚠️ Debe seleccionar el tipo de manejo (Interno o Banco) cuando todos los requisitos están verificados');
      return;
    }
    
    setSavingRequisitos(true);
    
    try {
      console.log('=== DEBUG: Enviando a la API ===');
      console.log('URL a llamar:', aprobacionAPI.verificarRequisitos);
      console.log('ID Expediente a enviar:', selectedAprobacion.id_expediente);
      
      const datosVerificacion = {
        requisitos: requisitosExpediente.map(req => ({
          id_requisito: req.id_requisito,
          nombre: req.nombre,
          verificado: req.verificado
        })),
        observaciones: observaciones,
        seleccion_manejo: seleccionManejo,
        id_inspeccion: idInspeccion && idInspeccion.trim() !== '' ? parseInt(idInspeccion) : null
      };
      
      console.log('Datos completos a enviar:', JSON.stringify(datosVerificacion, null, 2));
      
      const response = await aprobacionAPI.verificarRequisitos(
        selectedAprobacion.id_expediente, 
        datosVerificacion
      );
      
      console.log('=== DEBUG: Respuesta de la API ===');
      console.log('Respuesta completa:', response);
      
      if (response.success) {
        alert('✅ Requisitos verificados y guardados exitosamente\n' + (response.message || ''));
        handleCloseModals();
        loadAprobaciones(); // Recargar la lista
      } else {
        alert('❌ Error: ' + (response.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error('=== DEBUG: Error al guardar ===');
      console.error('Error completo:', err);
      console.error('ID que se intentó enviar:', selectedAprobacion.id_expediente);
      alert(`❌ Error al guardar la verificación de requisitos: ${err.message}`);
    } finally {
      setSavingRequisitos(false);
    }
  };

  // Calcular progreso de verificación
  const calcularProgreso = (requisitos) => {
    if (!requisitos || requisitos.length === 0) return 0;
    const verificados = requisitos.filter(r => r.verificado).length;
    return Math.round((verificados / requisitos.length) * 100);
  };

  // Cargar datos al iniciar
  useEffect(() => {
    if (activeTab === "aprobaciones") {
      loadAprobaciones();
    }
  }, [activeTab]);

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  // Marcar notificación como leída
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notifications-menu') && !e.target.closest('.user-menu')) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filtrar aprobaciones
  const filteredAprobaciones = aprobaciones.filter(aprob => {
    const matchesSearch = searchTerm === "" || 
      aprob.codigo_expediente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aprob.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aprob.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aprob.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || 
      aprob.estatus_aprobacion === selectedFilter ||
      aprob.estatus === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAprobaciones = filteredAprobaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAprobaciones.length / itemsPerPage);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Color según estatus
  const getStatusColor = (estatus) => {
    const colors = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'En Proceso': 'bg-blue-100 text-blue-800 border-blue-300',
      'Aprobado': 'bg-green-100 text-green-800 border-green-300',
      'Rechazado': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[estatus] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Icono según estatus
  const getStatusIcon = (estatus) => {
    const icons = {
      'Pendiente': <Clock size={20} className="text-yellow-600" />,
      'En Proceso': <FileText size={20} className="text-blue-600" />,
      'Aprobado': <CheckCircle size={20} className="text-green-600" />,
      'Rechazado': <AlertCircle size={20} className="text-red-600" />
    };
    return icons[estatus] || <AlertCircle size={20} className="text-gray-600" />;
  };

  // Color según tipo de manejo
  const getManejoColor = (manejo) => {
    const colors = {
      'Interno': 'bg-purple-100 text-purple-800 border-purple-300',
      'Banco': 'bg-indigo-100 text-indigo-800 border-indigo-300'
    };
    return colors[manejo] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Icono según tipo de manejo
  const getManejoIcon = (manejo) => {
    switch(manejo) {
      case 'Interno':
        return '🏢';
      case 'Banco':
        return '🏦';
      default:
        return '❓';
    }
  };

  // Estadísticas
  const stats = {
    total: aprobaciones.length,
    pendientes: aprobaciones.filter(a => 
      a.estatus_aprobacion === 'Pendiente' || a.estatus === 'Pendiente'
    ).length,
    enProceso: aprobaciones.filter(a => 
      a.estatus_aprobacion === 'En Proceso' || a.estatus === 'En Proceso'
    ).length,
    aprobados: aprobaciones.filter(a => 
      a.estatus_aprobacion === 'Aprobado' || a.estatus === 'Aprobado'
    ).length,
    rechazados: aprobaciones.filter(a => 
      a.estatus_aprobacion === 'Rechazado' || a.estatus === 'Rechazado'
    ).length
  };

  // Contador de notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="p-4 md:p-6 mt-16">
            {/* Título */}
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Gestión de Aprobaciones
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Verificación de requisitos y aprobación de expedientes
              </p>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Briefcase className="text-blue-600" size={20} />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stats.total}
                  </h3>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Expedientes
                </p>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-50">
                    <Clock className="text-yellow-600" size={20} />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stats.pendientes}
                  </h3>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pendientes
                </p>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stats.enProceso}
                  </h3>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  En Proceso
                </p>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-50">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stats.aprobados}
                  </h3>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Aprobados
                </p>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-50">
                    <AlertCircle className="text-red-600" size={20} />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stats.rechazados}
                  </h3>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Rechazados
                </p>
              </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por código, nombre o email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedFilter}
                  onChange={(e) => {
                    setSelectedFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                >
                  <option value="all">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>

                <button
                  onClick={loadAprobaciones}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Tabla de Expedientes */}
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F] mx-auto"></div>
                  <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cargando expedientes...
                  </p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={loadAprobaciones}
                    className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653] transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            ID Exp.
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Expediente
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Solicitante
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Requisitos
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Manejo
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Fecha
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {currentAprobaciones.length > 0 ? (
                          currentAprobaciones.map((aprobacion) => {
                            const requisitosVerificados = Array.isArray(aprobacion.verificacion_requisitos) 
                              ? aprobacion.verificacion_requisitos.filter(r => r.verificado).length 
                              : 0;
                            const totalRequisitos = Array.isArray(aprobacion.verificacion_requisitos) 
                              ? aprobacion.verificacion_requisitos.length 
                              : (Array.isArray(aprobacion.requisitos_expediente) 
                                ? aprobacion.requisitos_expediente.length 
                                : 0);
                            
                            return (
                              <tr 
                                key={aprobacion.id_expediente}
                                className={`${
                                  darkMode 
                                    ? 'hover:bg-gray-700/50' 
                                    : 'hover:bg-gray-50'
                                } transition-colors`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white text-gray-900">
                                  #{aprobacion.id_expediente}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300 text-gray-700">
                                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {aprobacion.codigo_expediente}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300 text-gray-700">
                                  <div>
                                    <p className="font-medium">
                                      {aprobacion.nombres} {aprobacion.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {aprobacion.email}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300 text-gray-700">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-600">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          totalRequisitos > 0 && requisitosVerificados === totalRequisitos
                                            ? 'bg-green-500'
                                            : requisitosVerificados > 0
                                            ? 'bg-blue-500'
                                            : 'bg-gray-300'
                                        }`}
                                        style={{ 
                                          width: `${totalRequisitos > 0 ? (requisitosVerificados / totalRequisitos) * 100 : 0}%` 
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs">
                                      {requisitosVerificados}/{totalRequisitos}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(aprobacion.estatus_aprobacion || aprobacion.estatus)}`}>
                                    {getStatusIcon(aprobacion.estatus_aprobacion || aprobacion.estatus)}
                                    {aprobacion.estatus_aprobacion || aprobacion.estatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {aprobacion.seleccion_manejo ? (
                                    <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getManejoColor(aprobacion.seleccion_manejo)}`}>
                                      {getManejoIcon(aprobacion.seleccion_manejo)} {aprobacion.seleccion_manejo}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">No definido</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300 text-gray-700">
                                  {formatDate(aprobacion.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleOpenVerificacion(aprobacion)}
                                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                      title="Verificar/Editar requisitos"
                                    >
                                      <ClipboardCheck size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleOpenDetail(aprobacion)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Ver detalles"
                                    >
                                      <Eye size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="8" className="px-6 py-8 text-center text-sm dark:text-gray-400 text-gray-500">
                              No se encontraron expedientes
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {filteredAprobaciones.length > 0 && (
                    <div className={`px-6 py-4 flex items-center justify-between border-t dark:border-gray-700 border-gray-200`}>
                      <div className="text-sm dark:text-gray-400 text-gray-600">
                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredAprobaciones.length)} de {filteredAprobaciones.length} expedientes
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg ${
                            currentPage === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              currentPage === index + 1
                                ? 'bg-[#2A9D8F] text-white'
                                : darkMode
                                  ? 'text-gray-300 hover:bg-gray-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg ${
                            currentPage === totalPages
                              ? 'text-gray-400 cursor-not-allowed'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* Modal de Detalle */}
      {showDetailModal && selectedAprobacion && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCloseModals}
            />
            <div className={`relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform rounded-2xl shadow-xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b mb-6">
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Detalle del Expediente #{selectedAprobacion.id_expediente}
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Código: {selectedAprobacion.codigo_expediente}
                  </p>
                </div>
                <button
                  onClick={handleCloseModals}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                >
                  <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del Solicitante */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información del Solicitante
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nombre Completo</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAprobacion.nombres} {selectedAprobacion.apellidos}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cédula</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAprobacion.cedula || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAprobacion.email}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Teléfono</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAprobacion.telefono || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estado del Expediente */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Estado del Expediente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estado</p>
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border mt-1 ${getStatusColor(selectedAprobacion.estatus_aprobacion || selectedAprobacion.estatus)}`}>
                        {getStatusIcon(selectedAprobacion.estatus_aprobacion || selectedAprobacion.estatus)}
                        {selectedAprobacion.estatus_aprobacion || selectedAprobacion.estatus}
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo de Manejo</p>
                      {selectedAprobacion.seleccion_manejo ? (
                        <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border mt-1 ${getManejoColor(selectedAprobacion.seleccion_manejo)}`}>
                          {getManejoIcon(selectedAprobacion.seleccion_manejo)} {selectedAprobacion.seleccion_manejo}
                        </span>
                      ) : (
                        <p className={`font-medium mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No definido</p>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha de Creación</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(selectedAprobacion.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Última Actualización</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(selectedAprobacion.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requisitos del Expediente */}
                {selectedAprobacion.requisitos_expediente && selectedAprobacion.requisitos_expediente.length > 0 && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Requisitos del Expediente
                    </h4>
                    <div className="space-y-2">
                      {selectedAprobacion.requisitos_expediente.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FileText className="text-blue-500" size={16} />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {req.nombre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requisitos Verificados */}
                {selectedAprobacion.verificacion_requisitos && 
                 Array.isArray(selectedAprobacion.verificacion_requisitos) && 
                 selectedAprobacion.verificacion_requisitos.length > 0 && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Requisitos Verificados
                    </h4>
                    <div className="space-y-2">
                      {selectedAprobacion.verificacion_requisitos.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {req.verificado ? (
                            <CheckCircle className="text-green-500" size={16} />
                          ) : (
                            <AlertCircle className="text-gray-400" size={16} />
                          )}
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {req.nombre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observaciones */}
                {selectedAprobacion.observaciones && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Observaciones
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedAprobacion.observaciones}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseModals}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Verificación de Requisitos */}
      {showVerificacionModal && selectedAprobacion && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCloseModals}
            />
            <div className={`relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform rounded-2xl shadow-xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Header del Modal */}
              <div className="flex items-center justify-between pb-4 border-b mb-6">
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Verificación de Requisitos
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Expediente: {selectedAprobacion.codigo_expediente} | ID: #{selectedAprobacion.id_expediente}
                  </p>
                </div>
                <button
                  onClick={handleCloseModals}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                >
                  <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>

              {/* Información del Solicitante */}
              <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-blue-50 to-green-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Solicitante</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAprobacion.nombres} {selectedAprobacion.apellidos}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-green-100'}`}>
                      <Mail className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAprobacion.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-purple-100'}`}>
                      <Clock className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(selectedAprobacion.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID de Inspección */}
              <div className="mb-6">
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Search size={18} className="text-gray-400" />
                  ID de Inspección
                </h4>
                <div className="relative">
                  <input
                    type="number"
                    value={idInspeccion}
                    onChange={(e) => setIdInspeccion(e.target.value)}
                    placeholder="Ingrese el ID de inspección (opcional)"
                    min="1"
                    className={`w-full p-4 pl-12 rounded-xl border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 placeholder-gray-400'
                    } focus:ring-2 focus:ring-[#2A9D8F] focus:border-transparent`}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Info className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                  </div>
                </div>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Este campo es opcional. Si el expediente ya tiene una inspección asociada, puede ingresar su ID aquí.
                </p>
              </div>

              {/* Barra de Progreso */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Progreso de Verificación
                  </h4>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {requisitosExpediente.filter(r => r.verificado).length} de {requisitosExpediente.length} requisitos ({calcularProgreso(requisitosExpediente)}%)
                  </span>
                </div>
                <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-[#264653] to-[#2A9D8F] transition-all duration-500"
                    style={{ width: `${calcularProgreso(requisitosExpediente)}%` }}
                  />
                </div>
              </div>

              {/* Lista de Requisitos */}
              <div className="mb-6 max-h-96 overflow-y-auto">
                <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Documentos Requeridos
                </h4>
                
                {loadingRequisitos ? (
                  <div className="text-center py-8">
                    <Loader className="animate-spin mx-auto text-[#2A9D8F]" size={32} />
                    <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cargando requisitos...
                    </p>
                  </div>
                ) : requisitosExpediente.length > 0 ? (
                  <div className="space-y-3">
                    {requisitosExpediente.map((requisito, index) => (
                      <div 
                        key={requisito.id_requisito || index}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          requisito.verificado
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                            : 'border-gray-200 bg-white dark:bg-gray-700/30 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => toggleRequisito(index)}
                      >
                        <div className="flex items-center gap-3">
                          {requisito.verificado ? (
                            <FileCheck className="text-green-600" size={24} />
                          ) : (
                            <FileX className="text-gray-400" size={24} />
                          )}
                          <div>
                            <p className={`font-semibold ${
                              requisito.verificado 
                                ? 'text-green-700 dark:text-green-400' 
                                : darkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {requisito.nombre}
                            </p>
                            {requisito.descripcion && (
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {requisito.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          requisito.verificado
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {requisito.verificado && (
                            <CheckCircle className="text-white" size={16} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileX className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No hay requisitos configurados para este expediente
                    </p>
                  </div>
                )}
              </div>

              {/* Selección de Manejo (solo si todos están verificados) */}
              {calcularProgreso(requisitosExpediente) === 100 && requisitosExpediente.length > 0 && (
                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Tipo de Manejo del Crédito
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSeleccionManejo('Interno')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        seleccionManejo === 'Interno'
                          ? 'border-[#2A9D8F] bg-[#2A9D8F]/10 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      } ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          seleccionManejo === 'Interno'
                            ? 'border-[#2A9D8F] bg-[#2A9D8F]'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {seleccionManejo === 'Interno' && (
                            <CheckCircle className="text-white" size={14} />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🏢</span>
                            <p className="font-semibold text-lg">Manejo Interno</p>
                          </div>
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            El crédito será manejado internamente por IADEY
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSeleccionManejo('Banco')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        seleccionManejo === 'Banco'
                          ? 'border-[#2A9D8F] bg-[#2A9D8F]/10 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      } ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          seleccionManejo === 'Banco'
                            ? 'border-[#2A9D8F] bg-[#2A9D8F]'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {seleccionManejo === 'Banco' && (
                            <CheckCircle className="text-white" size={14} />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🏦</span>
                            <p className="font-semibold text-lg">Banco</p>
                          </div>
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            El crédito será manejado a través de una entidad bancaria
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div className="mb-6">
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Observaciones
                </h4>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Agregar observaciones sobre la verificación..."
                  rows={4}
                  className={`w-full p-4 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 placeholder-gray-400'
                  } focus:ring-2 focus:ring-[#2A9D8F] focus:border-transparent resize-none`}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseModals}
                  className={`px-6 py-2.5 rounded-xl border ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors font-medium`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveVerificacion}
                  disabled={savingRequisitos || requisitosExpediente.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingRequisitos ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck size={18} />
                      Guardar Verificación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aprobacion;