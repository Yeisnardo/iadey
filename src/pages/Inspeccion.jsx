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
  FileSignature
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const InspeccionRealizada = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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
  const [sortConfig, setSortConfig] = useState({ key: 'fechaInspeccion', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipoInspeccion: '',
    resultado: '',
    calificacion: '',
    fechaDesde: '',
    fechaHasta: '',
    inspector: ''
  });

  // Datos de ejemplo para inspecciones realizadas
  const [inspecciones, setInspecciones] = useState([
    {
      id: 1,
      codigo: "INSP-2024-001",
      emprendimiento: "Restaurante El Sazón",
      emprendedor: "María González",
      tipoInspeccion: "Inicial",
      fechaInspeccion: "2024-03-12",
      inspector: "Ing. Martínez",
      resultado: "Aprobado",
      calificacion: 4.5,
      observaciones: "Cumple con todos los requisitos sanitarios y de infraestructura",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Fotos de instalaciones", url: "#" },
        { nombre: "Certificado de cumplimiento", url: "#" }
      ],
      recomendaciones: "Mejorar sistema de ventilación",
      proximaInspeccion: "2024-09-12",
      duracion: "2 horas 30 min"
    },
    {
      id: 2,
      codigo: "INSP-2024-002",
      emprendimiento: "Taller Mecánico Rápido",
      emprendedor: "Juan Pérez",
      tipoInspeccion: "Re-inspección",
      fechaInspeccion: "2024-03-11",
      inspector: "Ing. López",
      resultado: "Aprobado con observaciones",
      calificacion: 3.5,
      observaciones: "Se requiere mejorar área de almacenamiento de residuos",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Lista de verificación", url: "#" }
      ],
      recomendaciones: "Implementar sistema de gestión de residuos",
      proximaInspeccion: "2024-06-11",
      duracion: "1 hora 45 min"
    },
    {
      id: 3,
      codigo: "INSP-2024-003",
      emprendimiento: "Tienda de Ropa Moda",
      emprendedor: "Carlos Rodríguez",
      tipoInspeccion: "Inicial",
      fechaInspeccion: "2024-03-10",
      inspector: "Ing. García",
      resultado: "Rechazado",
      calificacion: 2.0,
      observaciones: "No cumple con normas de seguridad contra incendios",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Informe de no conformidades", url: "#" }
      ],
      recomendaciones: "Instalar sistema de extinción de incendios",
      proximaInspeccion: "2024-04-10",
      duracion: "3 horas"
    },
    {
      id: 4,
      codigo: "INSP-2024-004",
      emprendimiento: "Centro Estético Bella Vista",
      emprendedor: "Ana Martínez",
      tipoInspeccion: "Periódica",
      fechaInspeccion: "2024-03-09",
      inspector: "Ing. Pérez",
      resultado: "Aprobado",
      calificacion: 5.0,
      observaciones: "Excelentes condiciones sanitarias y de higiene",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Certificado de sanidad", url: "#" },
        { nombre: "Fotos del establecimiento", url: "#" }
      ],
      recomendaciones: "Mantener estándares actuales",
      proximaInspeccion: "2025-03-09",
      duracion: "1 hora 20 min"
    },
    {
      id: 5,
      codigo: "INSP-2024-005",
      emprendimiento: "Ferretería El Constructor",
      emprendedor: "Luis Torres",
      tipoInspeccion: "Inicial",
      fechaInspeccion: "2024-03-08",
      inspector: "Ing. Sánchez",
      resultado: "Aprobado con observaciones",
      calificacion: 4.0,
      observaciones: "Cumple con normativas, requiere señalización",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" }
      ],
      recomendaciones: "Colocar señalización de seguridad",
      proximaInspeccion: "2024-09-08",
      duracion: "2 horas"
    },
    {
      id: 6,
      codigo: "INSP-2024-006",
      emprendimiento: "Panadería La Espiga",
      emprendedor: "Carmen Flores",
      tipoInspeccion: "Re-inspección",
      fechaInspeccion: "2024-03-07",
      inspector: "Ing. Ramírez",
      resultado: "Aprobado",
      calificacion: 4.5,
      observaciones: "Corrigieron observaciones anteriores satisfactoriamente",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Evidencia fotográfica", url: "#" }
      ],
      recomendaciones: "Continuar con buenas prácticas",
      proximaInspeccion: "2024-09-07",
      duracion: "1 hora 30 min"
    },
    {
      id: 7,
      codigo: "INSP-2024-007",
      emprendimiento: "Clínica Veterinaria Mascotas",
      emprendedor: "Roberto Sánchez",
      tipoInspeccion: "Periódica",
      fechaInspeccion: "2024-03-06",
      inspector: "Ing. Díaz",
      resultado: "Aprobado",
      calificacion: 4.8,
      observaciones: "Instalaciones adecuadas, manejo correcto de medicamentos",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Certificado de buenas prácticas", url: "#" }
      ],
      recomendaciones: "Actualizar equipos de diagnóstico",
      proximaInspeccion: "2025-03-06",
      duracion: "2 horas 15 min"
    },
    {
      id: 8,
      codigo: "INSP-2024-008",
      emprendimiento: "Gimnasio Fit Life",
      emprendedor: "Patricia Gómez",
      tipoInspeccion: "Inicial",
      fechaInspeccion: "2024-03-05",
      inspector: "Ing. Torres",
      resultado: "Rechazado",
      calificacion: 1.5,
      observaciones: "No cumple con medidas de seguridad en equipos",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Informe de riesgos", url: "#" }
      ],
      recomendaciones: "Realizar mantenimiento preventivo de equipos",
      proximaInspeccion: "2024-04-05",
      duracion: "1 hora 50 min"
    }
  ]);

  // Estadísticas de inspecciones
  const estadisticas = {
    total: inspecciones.length,
    aprobadas: inspecciones.filter(i => i.resultado === "Aprobado").length,
    aprobadasObs: inspecciones.filter(i => i.resultado === "Aprobado con observaciones").length,
    rechazadas: inspecciones.filter(i => i.resultado === "Rechazado").length,
    promedioCalificacion: (inspecciones.reduce((sum, i) => sum + i.calificacion, 0) / inspecciones.length).toFixed(1),
    tiposInspeccion: {
      inicial: inspecciones.filter(i => i.tipoInspeccion === "Inicial").length,
      reinpeccion: inspecciones.filter(i => i.tipoInspeccion === "Re-inspección").length,
      periodica: inspecciones.filter(i => i.tipoInspeccion === "Periódica").length
    }
  };

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

  // Funciones de filtrado y ordenamiento
  const filteredInspecciones = inspecciones.filter(ins => {
    const matchesSearch = searchTerm === '' || 
      Object.values(ins).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesTipo = filters.tipoInspeccion === '' || ins.tipoInspeccion === filters.tipoInspeccion;
    const matchesResultado = filters.resultado === '' || ins.resultado === filters.resultado;
    
    let matchesCalificacion = true;
    if (filters.calificacion) {
      const calif = parseFloat(filters.calificacion);
      matchesCalificacion = ins.calificacion >= calif;
    }
    
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta) {
      const insDate = new Date(ins.fechaInspeccion);
      const desde = new Date(filters.fechaDesde);
      const hasta = new Date(filters.fechaHasta);
      matchesFecha = insDate >= desde && insDate <= hasta;
    }
    
    const matchesInspector = filters.inspector === '' || 
      ins.inspector.toLowerCase().includes(filters.inspector.toLowerCase());
    
    return matchesSearch && matchesTipo && matchesResultado && matchesCalificacion && matchesFecha && matchesInspector;
  });

  // Ordenamiento
  const sortedInspecciones = [...filteredInspecciones].sort((a, b) => {
    if (sortConfig.key) {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
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

  const handleViewDetalle = (id) => {
    console.log('Ver detalle de inspección:', id);
    navigate(`/inspeccion/${id}`);
  };

  const handleDownloadInforme = (id) => {
    console.log('Descargar informe de inspección:', id);
  };

  const handleGenerarCertificado = (id) => {
    console.log('Generar certificado para inspección:', id);
  };

  const resetFilters = () => {
    setFilters({
      tipoInspeccion: '',
      resultado: '',
      calificacion: '',
      fechaDesde: '',
      fechaHasta: '',
      inspector: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares para estilos
  const getResultadoBadge = (resultado) => {
    const styles = {
      'Aprobado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Aprobado con observaciones': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[resultado] || 'bg-gray-100 text-gray-800';
  };

  const getTipoInspeccionBadge = (tipo) => {
    const styles = {
      'Inicial': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Re-inspección': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Periódica': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return styles[tipo] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
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
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {currentData?.title || "Inspecciones Realizadas"}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentData?.description || "Historial completo de inspecciones realizadas en emprendimientos"}
              </p>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
                  placeholder="Buscar por emprendimiento, emprendedor o código..."
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
                <button
                  onClick={() => navigate('/nueva-inspeccion')}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nueva Inspección
                </button>
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <select
                    value={filters.tipoInspeccion}
                    onChange={(e) => setFilters({...filters, tipoInspeccion: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Re-inspección">Re-inspección</option>
                    <option value="Periódica">Periódica</option>
                  </select>

                  <select
                    value={filters.resultado}
                    onChange={(e) => setFilters({...filters, resultado: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los resultados</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Aprobado con observaciones">Aprobado con observaciones</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>

                  <select
                    value={filters.calificacion}
                    onChange={(e) => setFilters({...filters, calificacion: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Calificación mínima</option>
                    <option value="5">5 estrellas</option>
                    <option value="4">4+ estrellas</option>
                    <option value="3">3+ estrellas</option>
                    <option value="2">2+ estrellas</option>
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

                  <input
                    type="text"
                    value={filters.inspector}
                    onChange={(e) => setFilters({...filters, inspector: e.target.value})}
                    placeholder="Inspector"
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 placeholder-gray-500'
                    }`}
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
                          onClick={() => handleSort('emprendimiento')}>
                        <div className="flex items-center gap-2">
                          Emprendimiento
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('tipoInspeccion')}>
                        <div className="flex items-center gap-2">
                          Tipo
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('fechaInspeccion')}>
                        <div className="flex items-center gap-2">
                          Fecha
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resultado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calificación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inspector
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
                              {inspeccion.emprendimiento}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {inspeccion.emprendedor}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTipoInspeccionBadge(inspeccion.tipoInspeccion)}`}>
                            {inspeccion.tipoInspeccion}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {new Date(inspeccion.fechaInspeccion).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              Duración: {inspeccion.duracion}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getResultadoBadge(inspeccion.resultado)}`}>
                            {inspeccion.resultado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {renderStars(inspeccion.calificacion)}
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {inspeccion.calificacion}/5.0
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {inspeccion.inspector}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetalle(inspeccion.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Ver detalles"
                            >
                              <Eye size={18} className="text-[#2A9D8F]" />
                            </button>
                            <button
                              onClick={() => handleDownloadInforme(inspeccion.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Descargar informe"
                            >
                              <Download size={18} className="text-purple-500" />
                            </button>
                            {inspeccion.resultado === "Aprobado" && (
                              <button
                                onClick={() => handleGenerarCertificado(inspeccion.id)}
                                className={`p-1 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors`}
                                title="Generar certificado"
                              >
                                <FileSignature size={18} className="text-green-500" />
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
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded ${
                        currentPage === totalPages
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
            {sortedInspecciones.length === 0 && (
              <div className={`text-center py-12 rounded-xl border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <ClipboardCheck size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No se encontraron inspecciones
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay inspecciones que coincidan con los filtros aplicados.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-[#2A9D8F] hover:text-[#264653]"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>
    </div>
  );
};

export default InspeccionRealizada;