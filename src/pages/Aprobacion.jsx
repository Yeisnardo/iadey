// pages/Aprobacion.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Building,
  FileText,
  Eye,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  FileSignature,
  Briefcase,
  CreditCard,
  Users,
  BarChart,
  Shield,
  XCircle,
  CheckSquare,
  Send,
  Printer,
  MessageSquare
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Aprobacion = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nueva solicitud de crédito pendiente", time: "5 min", read: false },
    { id: 2, text: "Documentación de solicitud #CR-2024-015 lista para revisar", time: "1 hora", read: false },
    { id: 3, text: "Solicitud de crédito aprobada - Emprendimiento El Sazón", time: "3 horas", read: true },
    { id: 4, text: "Comité de crédito programado para mañana", time: "5 horas", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("aprobacion");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [observacionesAprobacion, setObservacionesAprobacion] = useState("");
  const [montoAprobado, setMontoAprobado] = useState("");

  // Estados para la DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaSolicitud', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado: '',
    riesgo: '',
    montoMin: '',
    montoMax: '',
    fechaDesde: '',
    fechaHasta: '',
    sector: ''
  });

  // Datos de ejemplo para solicitudes de crédito
  const [solicitudes, setSolicitudes] = useState([
    {
      id: 1,
      codigo: "CR-2024-001",
      emprendimiento: "Restaurante El Sazón",
      emprendedor: "María González",
      cedula: "V-12345678",
      sector: "Gastronomía",
      montoSolicitado: 25000,
      montoAprobado: null,
      fechaSolicitud: "2024-03-01",
      plazo: 24,
      tasaInteres: 12,
      riesgo: "Bajo",
      estado: "Pendiente",
      documentos: [
        { nombre: "Plan de Negocios", estado: "completo" },
        { nombre: "Estados Financieros", estado: "completo" },
        { nombre: "Registro Mercantil", estado: "completo" }
      ],
      scoreCrediticio: 85,
      historialCrediticio: "Bueno",
      capacidadPago: "Alta",
      garantias: "Fianza personal",
      analista: "Lic. Rodríguez",
      fechaRevision: null,
      observaciones: null
    },
    {
      id: 2,
      codigo: "CR-2024-002",
      emprendimiento: "Taller Mecánico Rápido",
      emprendedor: "Juan Pérez",
      cedula: "V-87654321",
      sector: "Servicios Automotrices",
      montoSolicitado: 45000,
      montoAprobado: null,
      fechaSolicitud: "2024-03-02",
      plazo: 36,
      tasaInteres: 12.5,
      riesgo: "Medio",
      estado: "En Análisis",
      documentos: [
        { nombre: "Plan de Negocios", estado: "completo" },
        { nombre: "Estados Financieros", estado: "pendiente" },
        { nombre: "Registro Mercantil", estado: "completo" }
      ],
      scoreCrediticio: 72,
      historialCrediticio: "Regular",
      capacidadPago: "Media",
      garantias: "Maquinaria",
      analista: "Lic. Martínez",
      fechaRevision: null,
      observaciones: null
    },
    {
      id: 3,
      codigo: "CR-2024-003",
      emprendimiento: "Tienda de Ropa Moda",
      emprendedor: "Carlos Rodríguez",
      cedula: "V-11223344",
      sector: "Comercio",
      montoSolicitado: 15000,
      montoAprobado: null,
      fechaSolicitud: "2024-03-03",
      plazo: 18,
      tasaInteres: 11,
      riesgo: "Bajo",
      estado: "Pendiente",
      documentos: [
        { nombre: "Plan de Negocios", estado: "completo" },
        { nombre: "Estados Financieros", estado: "completo" },
        { nombre: "Registro Mercantil", estado: "completo" }
      ],
      scoreCrediticio: 88,
      historialCrediticio: "Excelente",
      capacidadPago: "Alta",
      garantias: "Prendaria",
      analista: "Lic. Sánchez",
      fechaRevision: null,
      observaciones: null
    },
    {
      id: 4,
      codigo: "CR-2024-004",
      emprendimiento: "Centro Estético Bella Vista",
      emprendedor: "Ana Martínez",
      cedula: "V-99887766",
      sector: "Salud y Bienestar",
      montoSolicitado: 75000,
      montoAprobado: null,
      fechaSolicitud: "2024-03-04",
      plazo: 48,
      tasaInteres: 13,
      riesgo: "Alto",
      estado: "Revisión",
      documentos: [
        { nombre: "Plan de Negocios", estado: "completo" },
        { nombre: "Estados Financieros", estado: "completo" },
        { nombre: "Registro Mercantil", estado: "incompleto" }
      ],
      scoreCrediticio: 58,
      historialCrediticio: "Regular",
      capacidadPago: "Baja",
      garantias: "Sin garantías suficientes",
      analista: "Lic. Pérez",
      fechaRevision: null,
      observaciones: "Requiere documentación adicional de avalúo"
    },
    {
      id: 5,
      codigo: "CR-2024-005",
      emprendimiento: "Ferretería El Constructor",
      emprendedor: "Luis Torres",
      cedula: "V-55443322",
      sector: "Construcción",
      montoSolicitado: 120000,
      montoAprobado: 100000,
      fechaSolicitud: "2024-03-05",
      plazo: 60,
      tasaInteres: 11.5,
      riesgo: "Medio",
      estado: "Aprobado",
      documentos: [
        { nombre: "Plan de Negocios", estado: "completo" },
        { nombre: "Estados Financieros", estado: "completo" },
        { nombre: "Registro Mercantil", estado: "completo" }
      ],
      scoreCrediticio: 78,
      historialCrediticio: "Bueno",
      capacidadPago: "Media-Alta",
      garantias: "Hipotecaria",
      analista: "Lic. Ramírez",
      fechaRevision: "2024-03-10",
      observaciones: "Aprobado con monto ajustado según capacidad de pago"
    },
    {
      id: 6,
      codigo: "CR-2024-006",
      emprendimiento: "Panadería La Espiga",
      emprendedor: "Carmen Flores",
      cedula: "V-66778899",
      sector: "Alimentos",
      montoSolicitado: 35000,
      montoAprobado: null,
      fechaSolicitud: "2024-03-06",
      plazo: 30,
      tasaInteres: 12,
      riesgo: "Bajo",
      estado: "Rechazado",
      documentos: [
        { nombre: "Plan de Negocios", estado: "completo" },
        { nombre: "Estados Financieros", estado: "completo" },
        { nombre: "Registro Mercantil", estado: "completo" }
      ],
      scoreCrediticio: 45,
      historialCrediticio: "Malo",
      capacidadPago: "Baja",
      garantias: "Sin garantías",
      analista: "Lic. Díaz",
      fechaRevision: "2024-03-08",
      observaciones: "Rechazado por mal historial crediticio y baja capacidad de pago"
    },
    {
      id: 7,
      codigo: "CR-2024-007",
      emprendimiento: "Clínica Veterinaria Mascotas",
      emprendedor: "Roberto Sánchez",
      cedula: "V-33445566",
      sector: "Servicios Veterinarios",
      montoSolicitado: 55000,
      montoAprobado: null,
      fechaSolicitud: "2024-03-07",
      plazo: 36,
      tasaInteres: 12,
      riesgo: "Medio",
      estado: "En Análisis",
      documentos: [
        { nombre: "Plan de Negocios", estado: "completo" },
        { nombre: "Estados Financieros", estado: "completo" },
        { nombre: "Registro Mercantil", estado: "completo" }
      ],
      scoreCrediticio: 82,
      historialCrediticio: "Bueno",
      capacidadPago: "Alta",
      garantias: "Equipos médicos",
      analista: "Lic. Torres",
      fechaRevision: null,
      observaciones: null
    },
    {
      id: 8,
      codigo: "CR-2024-008",
      emprendimiento: "Gimnasio Fit Life",
      emprendedor: "Patricia Gómez",
      cedula: "V-77665544",
      sector: "Deporte y Recreación",
      montoSolicitado: 85000,
      montoAprobado: 75000,
      fechaSolicitud: "2024-03-08",
      plazo: 48,
      tasaInteres: 12.5,
      riesgo: "Medio-Alto",
      estado: "Aprobado Parcial",
      documentos: [
        { nombre: "Plan de Negocios", estado: "completo" },
        { nombre: "Estados Financieros", estado: "completo" },
        { nombre: "Registro Mercantil", estado: "completo" }
      ],
      scoreCrediticio: 68,
      historialCrediticio: "Regular",
      capacidadPago: "Media",
      garantias: "Maquinaria y equipo",
      analista: "Lic. Gómez",
      fechaRevision: "2024-03-12",
      observaciones: "Aprobado parcialmente, se requiere ajustar plan de inversión"
    }
  ]);

  // Estadísticas de solicitudes
  const estadisticas = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === "Pendiente").length,
    enAnalisis: solicitudes.filter(s => s.estado === "En Análisis").length,
    enRevision: solicitudes.filter(s => s.estado === "Revisión").length,
    aprobadas: solicitudes.filter(s => s.estado === "Aprobado").length,
    aprobadasParcial: solicitudes.filter(s => s.estado === "Aprobado Parcial").length,
    rechazadas: solicitudes.filter(s => s.estado === "Rechazado").length,
    montoTotalSolicitado: solicitudes.reduce((sum, s) => sum + s.montoSolicitado, 0),
    montoTotalAprobado: solicitudes.reduce((sum, s) => sum + (s.montoAprobado || 0), 0),
    tasaAprobacion: ((solicitudes.filter(s => s.estado.includes("Aprobado")).length / solicitudes.length) * 100).toFixed(1)
  };

  // Datos del usuario
  const user = {
    name: "Comité de Crédito",
    email: "comite.credito@iadey.gob.ve",
    role: "Analista de Crédito",
    avatar: null,
    department: "Dirección de Crédito",
    joinDate: "Enero 2024",
    pendingTasks: 12,
    completedTasks: 156,
    performance: "94%"
  };

  const currentData = {
    title: "Aprobación de Solicitudes de Crédito",
    description: "Gestión y evaluación de solicitudes de crédito para emprendedores",
    actionButton: "Nueva Solicitud",
    pendingTitle: "Solicitudes Recientes"
  };

  // Notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Funciones de filtrado y ordenamiento
  const filteredSolicitudes = solicitudes.filter(sol => {
    const matchesSearch = searchTerm === '' || 
      sol.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.emprendimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.emprendedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.cedula.includes(searchTerm);
    
    const matchesEstado = filters.estado === '' || sol.estado === filters.estado;
    const matchesRiesgo = filters.riesgo === '' || sol.riesgo === filters.riesgo;
    const matchesSector = filters.sector === '' || sol.sector === filters.sector;
    
    let matchesMonto = true;
    if (filters.montoMin) {
      matchesMonto = sol.montoSolicitado >= parseFloat(filters.montoMin);
    }
    if (filters.montoMax) {
      matchesMonto = matchesMonto && sol.montoSolicitado <= parseFloat(filters.montoMax);
    }
    
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta) {
      const solDate = new Date(sol.fechaSolicitud);
      const desde = new Date(filters.fechaDesde);
      const hasta = new Date(filters.fechaHasta);
      matchesFecha = solDate >= desde && solDate <= hasta;
    }
    
    return matchesSearch && matchesEstado && matchesRiesgo && matchesSector && matchesMonto && matchesFecha;
  });

  // Ordenamiento
  const sortedSolicitudes = [...filteredSolicitudes].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedSolicitudes.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedSolicitudes = sortedSolicitudes.slice(startIndex, startIndex + rowsPerPage);

  // Funciones de manejo
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedSolicitudes.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedSolicitudes.map(sol => sol.id));
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
    console.log('Ver detalle de solicitud:', id);
    navigate(`/solicitud-credito/${id}`);
  };

  const handleDownloadDocumentos = (id) => {
    console.log('Descargar documentos de solicitud:', id);
  };

  const openAprobacionModal = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setMontoAprobado(solicitud.montoSolicitado.toString());
    setObservacionesAprobacion("");
    setModalOpen(true);
  };

  const handleAprobar = () => {
    if (selectedSolicitud) {
      const updatedSolicitudes = solicitudes.map(sol => 
        sol.id === selectedSolicitud.id 
          ? { 
              ...sol, 
              estado: "Aprobado",
              montoAprobado: parseFloat(montoAprobado),
              fechaRevision: new Date().toISOString().split('T')[0],
              observaciones: observacionesAprobacion
            }
          : sol
      );
      setSolicitudes(updatedSolicitudes);
      setModalOpen(false);
      setSelectedSolicitud(null);
      
      // Notificar éxito
      alert(`Solicitud ${selectedSolicitud.codigo} aprobada por $${parseFloat(montoAprobado).toLocaleString()}`);
    }
  };

  const handleAprobarParcial = () => {
    if (selectedSolicitud) {
      const updatedSolicitudes = solicitudes.map(sol => 
        sol.id === selectedSolicitud.id 
          ? { 
              ...sol, 
              estado: "Aprobado Parcial",
              montoAprobado: parseFloat(montoAprobado),
              fechaRevision: new Date().toISOString().split('T')[0],
              observaciones: observacionesAprobacion
            }
          : sol
      );
      setSolicitudes(updatedSolicitudes);
      setModalOpen(false);
      setSelectedSolicitud(null);
      
      alert(`Solicitud ${selectedSolicitud.codigo} aprobada parcialmente por $${parseFloat(montoAprobado).toLocaleString()}`);
    }
  };

  const handleRechazar = () => {
    if (selectedSolicitud && window.confirm("¿Está seguro de rechazar esta solicitud?")) {
      const updatedSolicitudes = solicitudes.map(sol => 
        sol.id === selectedSolicitud.id 
          ? { 
              ...sol, 
              estado: "Rechazado",
              fechaRevision: new Date().toISOString().split('T')[0],
              observaciones: observacionesAprobacion
            }
          : sol
      );
      setSolicitudes(updatedSolicitudes);
      setModalOpen(false);
      setSelectedSolicitud(null);
      
      alert(`Solicitud ${selectedSolicitud.codigo} rechazada`);
    }
  };

  const handleSolicitarRevision = () => {
    if (selectedSolicitud) {
      const updatedSolicitudes = solicitudes.map(sol => 
        sol.id === selectedSolicitud.id 
          ? { 
              ...sol, 
              estado: "Revisión",
              observaciones: observacionesAprobacion
            }
          : sol
      );
      setSolicitudes(updatedSolicitudes);
      setModalOpen(false);
      setSelectedSolicitud(null);
      
      alert(`Solicitud ${selectedSolicitud.codigo} enviada a revisión`);
    }
  };

  const resetFilters = () => {
    setFilters({
      estado: '',
      riesgo: '',
      montoMin: '',
      montoMax: '',
      fechaDesde: '',
      fechaHasta: '',
      sector: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares para estilos
  const getEstadoBadge = (estado) => {
    const styles = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'En Análisis': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Revisión': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Aprobado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Aprobado Parcial': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800';
  };

  const getRiesgoBadge = (riesgo) => {
    const styles = {
      'Bajo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Medio': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Medio-Alto': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Alto': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[riesgo] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
                {currentData.title}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentData.description}
              </p>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <FileText className="text-[#2A9D8F]" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.total}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Solicitudes</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-yellow-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.pendientes + estadisticas.enAnalisis + estadisticas.enRevision}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Proceso</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <ThumbsUp className="text-green-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.aprobadas + estadisticas.aprobadasParcial}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aprobadas</p>
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
                  <DollarSign className="text-blue-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatCurrency(estadisticas.montoTotalAprobado)}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monto Aprobado</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-purple-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.tasaAprobacion}%
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tasa de Aprobación</p>
              </div>
            </div>

            {/* Barra de búsqueda y acciones */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por código, emprendimiento, emprendedor o cédula..."
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
                  onClick={() => navigate('/nueva-solicitud-credito')}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nueva Solicitud
                </button>
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({...filters, estado: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Análisis">En Análisis</option>
                    <option value="Revisión">Revisión</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Aprobado Parcial">Aprobado Parcial</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>

                  <select
                    value={filters.riesgo}
                    onChange={(e) => setFilters({...filters, riesgo: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los niveles de riesgo</option>
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Medio-Alto">Medio-Alto</option>
                    <option value="Alto">Alto</option>
                  </select>

                  <select
                    value={filters.sector}
                    onChange={(e) => setFilters({...filters, sector: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los sectores</option>
                    <option value="Gastronomía">Gastronomía</option>
                    <option value="Servicios Automotrices">Servicios Automotrices</option>
                    <option value="Comercio">Comercio</option>
                    <option value="Salud y Bienestar">Salud y Bienestar</option>
                    <option value="Construcción">Construcción</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Servicios Veterinarios">Servicios Veterinarios</option>
                    <option value="Deporte y Recreación">Deporte y Recreación</option>
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.montoMin}
                      onChange={(e) => setFilters({...filters, montoMin: e.target.value})}
                      placeholder="Monto mínimo"
                      className={`w-1/2 px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      value={filters.montoMax}
                      onChange={(e) => setFilters({...filters, montoMax: e.target.value})}
                      placeholder="Monto máximo"
                      className={`w-1/2 px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 placeholder-gray-500'
                      }`}
                    />
                  </div>

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

            {/* DataTable de Solicitudes */}
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
                          checked={selectedRows.length === paginatedSolicitudes.length && paginatedSolicitudes.length > 0}
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
                          onClick={() => handleSort('montoSolicitado')}>
                        <div className="flex items-center gap-2">
                          Monto Solicitado
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('fechaSolicitud')}>
                        <div className="flex items-center gap-2">
                          Fecha
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Riesgo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {paginatedSolicitudes.map((solicitud) => (
                      <tr key={solicitud.id} className={`${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(solicitud.id)}
                            onChange={() => handleSelectRow(solicitud.id)}
                            className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {solicitud.codigo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {solicitud.emprendimiento}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {solicitud.emprendedor} | {solicitud.sector}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(solicitud.montoSolicitado)}
                            </div>
                            {solicitud.montoAprobado && (
                              <div className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                Aprobado: {formatCurrency(solicitud.montoAprobado)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              Plazo: {solicitud.plazo} meses
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadge(solicitud.estado)}`}>
                            {solicitud.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRiesgoBadge(solicitud.riesgo)}`}>
                            {solicitud.riesgo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div 
                                  className="bg-[#2A9D8F] h-2 rounded-full" 
                                  style={{ width: `${solicitud.scoreCrediticio}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {solicitud.scoreCrediticio}
                              </span>
                            </div>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {solicitud.historialCrediticio}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetalle(solicitud.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Ver detalles"
                            >
                              <Eye size={18} className="text-[#2A9D8F]" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocumentos(solicitud.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Descargar documentos"
                            >
                              <Download size={18} className="text-purple-500" />
                            </button>
                            {!solicitud.estado.includes("Aprobado") && solicitud.estado !== "Rechazado" && (
                              <button
                                onClick={() => openAprobacionModal(solicitud)}
                                className={`p-1 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors`}
                                title="Evaluar solicitud"
                              >
                                <CheckCircle size={18} className="text-green-500" />
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
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedSolicitudes.length)} de {sortedSolicitudes.length}
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

            {/* Modal de Aprobación */}
            {modalOpen && selectedSolicitud && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl max-w-2xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Evaluación de Solicitud
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedSolicitud.codigo} - {selectedSolicitud.emprendimiento}
                    </p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Información de la solicitud */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto Solicitado</label>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {formatCurrency(selectedSolicitud.montoSolicitado)}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score Crediticio</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div 
                              className="bg-[#2A9D8F] h-2 rounded-full" 
                              style={{ width: `${selectedSolicitud.scoreCrediticio}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.scoreCrediticio}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plazo</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {selectedSolicitud.plazo} meses
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasa de Interés</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {selectedSolicitud.tasaInteres}%
                        </p>
                      </div>
                    </div>

                    {/* Campo para monto aprobado */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Monto a Aprobar
                      </label>
                      <input
                        type="number"
                        value={montoAprobado}
                        onChange={(e) => setMontoAprobado(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                      />
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Monto máximo: {formatCurrency(selectedSolicitud.montoSolicitado)}
                      </p>
                    </div>

                    {/* Campo de observaciones */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Observaciones / Justificación
                      </label>
                      <textarea
                        value={observacionesAprobacion}
                        onChange={(e) => setObservacionesAprobacion(e.target.value)}
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        placeholder="Ingrese las observaciones o justificación para esta decisión..."
                      />
                    </div>
                  </div>

                  <div className={`p-6 border-t flex justify-end gap-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setModalOpen(false)}
                      className={`px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSolicitarRevision}
                      className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                    >
                      Solicitar Revisión
                    </button>
                    <button
                      onClick={handleRechazar}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={handleAprobarParcial}
                      className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                    >
                      Aprobar Parcial
                    </button>
                    <button
                      onClick={handleAprobar}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      Aprobar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Si no hay resultados */}
            {sortedSolicitudes.length === 0 && (
              <div className={`text-center py-12 rounded-xl border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <FileText size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No se encontraron solicitudes
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay solicitudes que coincidan con los filtros aplicados.
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

export default Aprobacion;