// pages/InspeccionRealizada.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Building,
  FileText,
  Star,
  Eye,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  Home,
  Users,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Camera,
  FileSignature,
  X,
  Save,
  ClipboardList,
  RefreshCw,
  Database
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import InspectionFormCompleto from "../components/InspectionFormCompleto";

// Importamos la API de inspección
import inspeccionAPI from "../services/api_inspeccion";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const InspeccionRealizada = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedEmprendimiento, setSelectedEmprendimiento] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nueva inspección programada", time: "5 min", read: false },
    { id: 2, text: "Informe de inspección listo para revisión", time: "1 hora", read: false },
    { id: 3, text: "Emprendimiento aprobado después de inspección", time: "3 horas", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("inspRealizadas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Estados para la DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estatus_inspeccion: '',
    id_tipo_insp_clas: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Estado para almacenar las inspecciones de la API
  const [inspecciones, setInspecciones] = useState([]);

  // Estados para el formulario de inspección
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [selectedInspeccion, setSelectedInspeccion] = useState(null);
  const [emprendimientoData, setEmprendimientoData] = useState(null);
  const [sector, setSector] = useState(null); // 'agricola' o 'industria_comercio'

  // Cargar inspecciones desde la API
  useEffect(() => {
    cargarInspecciones();
  }, []);

  const cargarInspecciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inspeccionAPI.getAll();
      if (response.success) {
        // Mapear los datos de la API al formato que usa el componente
        const inspeccionesFormateadas = response.data.map(ins => ({
          id: ins.id_inspeccion,
          codigo: `INSP-2024-${String(ins.id_inspeccion).padStart(3, '0')}`,
          id_codigo_exp: ins.id_codigo_exp,
          id_tipo_insp_clas: ins.id_tipo_insp_clas,
          estatus_inspeccion: ins.estatus_inspeccion,
          created_at: ins.created_at,
          updated_at: ins.updated_at,
          // Datos complementarios que podrían venir del JOIN
          codigo_expediente: ins.codigo_expediente || `EXP-${ins.id_codigo_exp}`,
          nombre_emprendedor: ins.nombre_emprendedor || "No especificado",
          cedula: ins.cedula || "No especificada",
          tipo_inspeccion: ins.tipo_inspeccion || getTipoInspeccionDefault(ins.id_tipo_insp_clas),
          // Campos calculados
          fechaInspeccion: ins.created_at ? new Date(ins.created_at).toISOString().split('T')[0] : '-',
          inspector: ins.inspector || "Por asignar",
          resultado: ins.estatus_inspeccion || "Pendiente",
          calificacion: ins.calificacion || 0,
          observaciones: ins.observaciones || "Sin observaciones",
          recomendaciones: ins.recomendaciones || "Sin recomendaciones",
          duracion: ins.duracion || "-",
          actividad: ins.actividad || "No especificada",
          direccion: ins.direccion || "No especificada",
          telefono: ins.telefono || "No especificado"
        }));
        setInspecciones(inspeccionesFormateadas);
      } else {
        setError('Error al cargar las inspecciones');
      }
    } catch (error) {
      console.error('Error al cargar inspecciones:', error);
      setError('Error al conectar con el servidor. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para realizar inspección
  const handleRealizarInspeccion = async (inspeccion) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar que la inspección tenga id_codigo_exp
      if (!inspeccion.id_codigo_exp) {
        throw new Error('El emprendimiento no tiene un código de expediente válido');
      }
      
      // Obtener datos completos del emprendimiento
      const response = await inspeccionAPI.getEmprendimientoData(inspeccion.id_codigo_exp);
      
      if (response.success && response.data) {
        setSelectedInspeccion(inspeccion);
        setEmprendimientoData(response.data);
        
        // Determinar sector basado en la actividad o clasificación
        const sectorDeterminado = response.data.sector?.toLowerCase().includes('agric') ? 'agricola' : 'industria_comercio';
        setSector(sectorDeterminado);
        setShowInspectionForm(true);
      } else {
        throw new Error('No se pudieron obtener los datos del emprendimiento');
      }
    } catch (error) {
      console.error('Error al cargar datos para inspección:', error);
      setError(error.message || 'Error al cargar los datos del emprendimiento');
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar los resultados de la inspección
  const handleSaveInspectionResults = async (resultados) => {
    try {
      setLoading(true);
      
      // Actualizar la inspección con los resultados completos
      const updateResponse = await inspeccionAPI.update(selectedInspeccion.id, {
        estatus_inspeccion: resultados.evaluacionFinal.estatus,
        calificacion: resultados.evaluacionFinal.calificacion,
        observaciones: resultados.evaluacionFinal.observaciones_generales,
        recomendaciones: resultados.evaluacionFinal.recomendaciones,
        duracion: resultados.evaluacionFinal.duracion_minutos,
        resultados_completos: resultados // Guardar todo el formulario como JSON
      });
      
      if (updateResponse.success) {
        // Recargar las inspecciones
        await cargarInspecciones();
        // Cerrar el formulario y limpiar estados
        handleCloseInspectionForm();
        // Mostrar mensaje de éxito
        alert(`Inspección ${resultados.evaluacionFinal.estatus} con calificación ${resultados.evaluacionFinal.calificacion}/5.0`);
      }
    } catch (error) {
      console.error('Error al guardar inspección:', error);
      alert('Error al guardar la inspección');
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar el formulario de inspección
  const handleCloseInspectionForm = () => {
    setShowInspectionForm(false);
    setSelectedInspeccion(null);
    setEmprendimientoData(null);
    setSector(null);
  };

  // Función auxiliar para tipo de inspección por defecto
  const getTipoInspeccionDefault = (id_tipo_insp_clas) => {
    const tipos = {
      1: 'Inicial',
      2: 'Re-inspección',
      3: 'Periódica',
      4: 'Seguimiento'
    };
    return tipos[id_tipo_insp_clas] || 'No especificado';
  };

  // Estadísticas de inspecciones calculadas desde los datos reales
  const estadisticas = React.useMemo(() => {
    const inspeccionesConCalificacion = inspecciones.filter(i => i.calificacion > 0);
    
    return {
      total: inspecciones.length,
      aprobadas: inspecciones.filter(i => i.resultado === "Aprobado").length,
      aprobadasObs: inspecciones.filter(i => i.resultado === "Aprobado con observaciones").length,
      rechazadas: inspecciones.filter(i => i.resultado === "Rechazado").length,
      pendientes: inspecciones.filter(i => i.resultado === "Pendiente").length,
      promedioCalificacion: inspeccionesConCalificacion.length > 0 
        ? (inspeccionesConCalificacion.reduce((sum, i) => sum + i.calificacion, 0) / inspeccionesConCalificacion.length).toFixed(1)
        : "0.0",
      tiposInspeccion: {
        inicial: inspecciones.filter(i => i.id_tipo_insp_clas === 1).length,
        reinpeccion: inspecciones.filter(i => i.id_tipo_insp_clas === 2).length,
        periodica: inspecciones.filter(i => i.id_tipo_insp_clas === 3).length,
        pendiente: inspecciones.filter(i => i.id_tipo_insp_clas === 4).length
      }
    };
  }, [inspecciones]);

  // Datos del usuario
  const user = {
    name: "Inspector IADEY",
    email: "inspector@iadey.gob.ve",
    role: "Inspector de Campo",
    avatar: null,
    department: "Dirección de Inspecciones",
    joinDate: "Enero 2024",
    pendingTasks: 5,
    completedTasks: 48,
    performance: "96%"
  };

  // Datos específicos por sección
  const sectionData = {
    inspRealizadas: {
      title: "Inspecciones Realizadas",
      description: "Historial de inspecciones completadas y sus resultados",
      actionButton: "Nueva Inspección",
      pendingTitle: "Inspecciones Recientes"
    }
  };

  const getCurrentSectionData = () => {
    return sectionData.inspRealizadas;
  };

  const currentData = getCurrentSectionData();

  // Notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Funciones de filtrado
  const filteredInspecciones = inspecciones.filter(ins => {
    const matchesSearch = searchTerm === '' || 
      Object.values(ins).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesEstatus = filters.estatus_inspeccion === '' || 
      ins.estatus_inspeccion === filters.estatus_inspeccion;
    
    const matchesTipo = filters.id_tipo_insp_clas === '' || 
      ins.id_tipo_insp_clas === parseInt(filters.id_tipo_insp_clas);
    
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta && ins.fechaInspeccion !== '-') {
      const insDate = new Date(ins.fechaInspeccion);
      const desde = new Date(filters.fechaDesde);
      const hasta = new Date(filters.fechaHasta);
      matchesFecha = insDate >= desde && insDate <= hasta;
    }
    
    return matchesSearch && matchesEstatus && matchesTipo && matchesFecha;
  });

  // Ordenamiento
  const sortedInspecciones = [...filteredInspecciones].sort((a, b) => {
    if (sortConfig.key) {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedInspecciones.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedInspecciones = sortedInspecciones.slice(startIndex, startIndex + rowsPerPage);

  // Funciones de manejo
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedInspecciones.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedInspecciones.map(ins => ins.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleViewDetalle = async (id) => {
    try {
      const response = await inspeccionAPI.getById(id);
      if (response.success) {
        console.log('Detalle de inspección:', response.data);
        navigate(`/inspeccion/${id}`);
      }
    } catch (error) {
      console.error('Error al obtener detalle:', error);
    }
  };

  const handleDownloadInforme = (id) => {
    console.log('Descargar informe de inspección:', id);
  };

  const handleGenerarCertificado = (id) => {
    console.log('Generar certificado para inspección:', id);
  };

  const resetFilters = () => {
    setFilters({
      estatus_inspeccion: '',
      id_tipo_insp_clas: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares para estilos
  const getResultadoBadge = (resultado) => {
    const styles = {
      'Aprobado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Aprobado con observaciones': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Pendiente': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return styles[resultado] || 'bg-gray-100 text-gray-800';
  };

  const getTipoInspeccionBadge = (tipo) => {
    const styles = {
      'Inicial': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Re-inspección': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Periódica': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Pendiente': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return styles[tipo] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    if (rating === 0) {
      return <div className="flex items-center gap-0.5 text-gray-300">Sin calificar</div>;
    }
    const fullStars = Math.floor(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300 dark:text-gray-600" />);
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  // Marcar notificaciones como leídas
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
            {/* Título de la sección */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {currentData?.title || "Inspecciones Realizadas"}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentData?.description || "Historial completo de inspecciones realizadas en emprendimientos"}
                </p>
              </div>
              <button
                onClick={cargarInspecciones}
                disabled={loading}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                } transition-colors`}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Actualizar
              </button>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
                <button
                  onClick={cargarInspecciones}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Intentar nuevamente
                </button>
              </div>
            )}

            {/* Indicador de carga */}
            {loading && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Cargando inspecciones...</span>
                </div>
              </div>
            )}

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <ClipboardCheck className="text-[#2A9D8F]" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.total}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Inspecciones</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-blue-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.pendientes}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pendientes</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <ThumbsUp className="text-green-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.aprobadas}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aprobadas</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="text-yellow-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.aprobadasObs}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aprobadas con Obs.</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <ThumbsDown className="text-red-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.rechazadas}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rechazadas</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Star className="text-yellow-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.promedioCalificacion}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Calificación Promedio</p>
              </div>
            </div>

            {/* Barra de búsqueda y acciones */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por código, estatus o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                    darkMode 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={20} />
                  Filtros
                </button>
                {inspecciones.length > 0 && (
                  <div className={`px-4 py-2 text-sm flex items-center gap-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Database size={16} />
                    {inspecciones.length} registros
                  </div>
                )}
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={filters.estatus_inspeccion}
                    onChange={(e) => setFilters({...filters, estatus_inspeccion: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los estatus</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Aprobado con observaciones">Aprobado con observaciones</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>

                  <select
                    value={filters.id_tipo_insp_clas}
                    onChange={(e) => setFilters({...filters, id_tipo_insp_clas: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="1">Inicial</option>
                    <option value="2">Re-inspección</option>
                    <option value="3">Periódica</option>
                    <option value="4">Seguimiento</option>
                  </select>

                  <input
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                    placeholder="Fecha desde"
                  />

                  <input
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                    placeholder="Fecha hasta"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm text-[#2A9D8F] hover:text-[#264653]"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}

            {/* DataTable de Inspecciones */}
            <div className={`rounded-xl border ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            } overflow-hidden`}>
              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-4 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={selectedRows.length === paginatedInspecciones.length && paginatedInspecciones.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('codigo')}>
                        <div className="flex items-center gap-2">
                          Código
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('id_codigo_exp')}>
                        <div className="flex items-center gap-2">
                          Expediente
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('id_tipo_insp_clas')}>
                        <div className="flex items-center gap-2">
                          Tipo
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('created_at')}>
                        <div className="flex items-center gap-2">
                          Fecha Creación
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('estatus_inspeccion')}>
                        <div className="flex items-center gap-2">
                          Estatus
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('updated_at')}>
                        <div className="flex items-center gap-2">
                          Última Actualización
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {paginatedInspecciones.map((inspeccion) => (
                      <tr key={inspeccion.id} className={`${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(inspeccion.id)}
                            onChange={() => handleSelectRow(inspeccion.id)}
                            className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {inspeccion.codigo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {inspeccion.codigo_expediente}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ID: {inspeccion.id_codigo_exp}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTipoInspeccionBadge(inspeccion.tipo_inspeccion)}`}>
                            {inspeccion.tipo_inspeccion}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {inspeccion.created_at ? new Date(inspeccion.created_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              }) : '-'}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {inspeccion.created_at ? new Date(inspeccion.created_at).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getResultadoBadge(inspeccion.estatus_inspeccion)}`}>
                            {inspeccion.estatus_inspeccion}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {inspeccion.updated_at ? new Date(inspeccion.updated_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              }) : '-'}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {inspeccion.updated_at ? new Date(inspeccion.updated_at).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetalle(inspeccion.id)}
                              className={`p-1.5 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors group relative`}
                              title="Ver detalles"
                            >
                              <Eye size={18} className="text-blue-500" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Ver Detalles
                              </span>
                            </button>
                            
                            {/* Botón para realizar inspección cuando está pendiente */}
                            {inspeccion.estatus_inspeccion === "Pendiente" && (
                              <button
                                onClick={() => handleRealizarInspeccion(inspeccion)}
                                className={`p-1.5 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors group relative`}
                                title="Realizar inspección"
                              >
                                <ClipboardCheck size={18} className="text-green-500" />
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Realizar Inspección
                                </span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDownloadInforme(inspeccion.id)}
                              className={`p-1.5 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors group relative`}
                              title="Descargar informe"
                            >
                              <Download size={18} className="text-purple-500" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Descargar Informe
                              </span>
                            </button>
                            
                            {inspeccion.estatus_inspeccion === "Aprobado" && (
                              <button
                                onClick={() => handleGenerarCertificado(inspeccion.id)}
                                className={`p-1.5 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors group relative`}
                                title="Generar certificado"
                              >
                                <FileSignature size={18} className="text-green-500" />
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Generar Certificado
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className={`px-4 py-3 flex items-center justify-between border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    Mostrar
                  </span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-1 rounded border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    registros
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedInspecciones.length)} de {sortedInspecciones.length}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`p-1 rounded ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronsLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`p-1 rounded ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <span className={`px-3 py-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Página {currentPage} de {totalPages || 1}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`p-1 rounded ${
                        currentPage === totalPages || totalPages === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`p-1 rounded ${
                        currentPage === totalPages || totalPages === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronsRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Si no hay resultados */}
            {!loading && sortedInspecciones.length === 0 && (
              <div className={`text-center py-12 rounded-xl border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <ClipboardCheck size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No se encontraron inspecciones
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {error 
                    ? "Ocurrió un error al cargar los datos. Por favor, intente nuevamente."
                    : "No hay inspecciones que coincidan con los filtros aplicados."}
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  {error && (
                    <button
                      onClick={cargarInspecciones}
                      className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653]"
                    >
                      Reintentar
                    </button>
                  )}
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-[#2A9D8F] hover:text-[#264653]"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* MODAL DEL FORMULARIO DE INSPECCIÓN - FUERA DEL MAIN */}
      {showInspectionForm && selectedInspeccion && emprendimientoData && (
        <InspectionFormCompleto
          isOpen={showInspectionForm}
          onClose={handleCloseInspectionForm}
          onSave={handleSaveInspectionResults}
          emprendimientoData={emprendimientoData}
          sector={sector || 'industria_comercio'}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default InspeccionRealizada;