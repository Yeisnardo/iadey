// pages/Bancarios.jsx - Versión sin PDF
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Edit,
  Eye,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building,
  Star,
  TrendingUp,
  Award,
  BarChart,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Zap,
  Shield,
  MapPin,
  Briefcase,
  Calendar,
  ThumbsUp,
  TrendingDown,
  Scale,
  Rocket,
  Leaf,
  Heart,
  GraduationCap,
  Factory,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Wrench,
  Gift,
  Trash2,
  RefreshCw,
  Landmark,
  PiggyBank,
  CreditCard,
  Banknote,
  HandCoins,
  Receipt,
  FileText,
  DownloadCloud
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Bancarios = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nueva solicitud de crédito registrada", time: "5 min", read: false },
    { id: 2, text: "Desembolso aprobado para Ferretería El Constructor", time: "1 hora", read: false },
    { id: 3, text: "Vencimiento de pago próximo: Restaurante El Sazón", time: "3 horas", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("gestionBancaria");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // Estados para la DataTable Bancaria
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaSolicitud', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    banco: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Lista de bancos disponibles
  const bancos = [
    { id: 1, nombre: "Banco de Venezuela", siglas: "BDV", tipo: "Público" },
    { id: 2, nombre: "Banco Bicentenario", siglas: "BB", tipo: "Público" },
    { id: 3, nombre: "Banco Mercantil", siglas: "BM", tipo: "Privado" },
    { id: 4, nombre: "Banco Provincial", siglas: "BP", tipo: "Privado" },
    { id: 5, nombre: "Banco Banesco", siglas: "BAN", tipo: "Privado" },
    { id: 6, nombre: "Banco Exterior", siglas: "BE", tipo: "Privado" },
    { id: 7, nombre: "Banco Plaza", siglas: "BPZ", tipo: "Privado" },
    { id: 8, nombre: "Banco del Tesoro", siglas: "BT", tipo: "Público" },
    { id: 9, nombre: "Banco Nacional de Crédito", siglas: "BNC", tipo: "Privado" },
    { id: 10, nombre: "Banco Sofitasa", siglas: "BS", tipo: "Privado" }
  ];

  // Estados de solicitud
  const estadosSolicitud = [
    "En Evaluación",
    "Pre-aprobado",
    "Aprobado",
    "Desembolsado",
    "En Moratoria",
    "Cancelado",
    "Rechazado"
  ];

  // Datos de solicitudes bancarias
  const [solicitudesBancarias, setSolicitudesBancarias] = useState([
    {
      id: 1,
      emprendedor: {
        nombre: "María González",
        empresa: "Restaurante El Sazón",
        ruc: "J-123456789",
        telefono: "0412-1234567",
        email: "elsazon@email.com",
        sector: "Gastronomía"
      },
      banco: "Banco de Venezuela",
      numeroCuenta: "0102-0123-45-1234567890",
      tipoCuenta: "Corriente",
      montoSolicitado: 5000,
      montoAprobado: 4500,
      plazo: 12,
      tasaInteres: 5,
      fechaSolicitud: "2024-01-15",
      fechaAprobacion: "2024-01-25",
      fechaDesembolso: "2024-02-01",
      fechaVencimiento: "2025-02-01",
      estado: "Desembolsado",
      analista: "Carlos Méndez",
      observaciones: "Cliente con buen historial crediticio"
    },
    {
      id: 2,
      emprendedor: {
        nombre: "Juan Pérez",
        empresa: "Taller Mecánico Rápido",
        ruc: "J-876543210",
        telefono: "0416-7654321",
        email: "tallerrapido@email.com",
        sector: "Servicios Automotrices"
      },
      banco: "Banco Mercantil",
      numeroCuenta: "0105-0456-78-9876543210",
      tipoCuenta: "Corriente",
      montoSolicitado: 15000,
      montoAprobado: 12000,
      plazo: 24,
      tasaInteres: 8,
      fechaSolicitud: "2024-02-01",
      fechaAprobacion: "2024-02-10",
      fechaDesembolso: "2024-02-15",
      fechaVencimiento: "2026-02-15",
      estado: "Desembolsado",
      analista: "Ana Rodríguez",
      observaciones: "Excelente capacidad de pago"
    },
    {
      id: 3,
      emprendedor: {
        nombre: "Carlos Rodríguez",
        empresa: "Moda Express",
        ruc: "J-112233445",
        telefono: "0424-1122334",
        email: "modaexpress@email.com",
        sector: "Comercio"
      },
      banco: "Banco Bicentenario",
      numeroCuenta: "0175-0789-12-3456789012",
      tipoCuenta: "Ahorro",
      montoSolicitado: 3000,
      montoAprobado: 2500,
      plazo: 12,
      tasaInteres: 5,
      fechaSolicitud: "2024-02-15",
      fechaAprobacion: "2024-02-25",
      fechaDesembolso: null,
      fechaVencimiento: "2025-02-25",
      estado: "Aprobado",
      analista: "Luis Fernández",
      observaciones: "En espera de documentos"
    },
    {
      id: 4,
      emprendedor: {
        nombre: "Ana Martínez",
        empresa: "Centro Estético Bella Vista",
        ruc: "J-998877665",
        telefono: "0414-9988776",
        email: "bellavista@email.com",
        sector: "Salud y Bienestar"
      },
      banco: "Banco Banesco",
      numeroCuenta: "0134-0123-45-9876543210",
      tipoCuenta: "Corriente",
      montoSolicitado: 8000,
      montoAprobado: null,
      plazo: 18,
      tasaInteres: 8,
      fechaSolicitud: "2024-03-01",
      fechaAprobacion: null,
      fechaDesembolso: null,
      fechaVencimiento: null,
      estado: "En Evaluación",
      analista: "Pedro Martínez",
      observaciones: "En proceso de verificación"
    },
    {
      id: 5,
      emprendedor: {
        nombre: "Luis Torres",
        empresa: "Ferretería El Constructor",
        ruc: "J-554433221",
        telefono: "0412-5544332",
        email: "elconstructor@email.com",
        sector: "Construcción"
      },
      banco: "Banco Provincial",
      numeroCuenta: "0108-0456-78-1234567890",
      tipoCuenta: "Corriente",
      montoSolicitado: 50000,
      montoAprobado: 50000,
      plazo: 36,
      tasaInteres: 7,
      fechaSolicitud: "2023-12-01",
      fechaAprobacion: "2023-12-15",
      fechaDesembolso: "2024-01-10",
      fechaVencimiento: "2027-01-10",
      estado: "Desembolsado",
      analista: "María González",
      observaciones: "Cliente preferencial"
    },
    {
      id: 6,
      emprendedor: {
        nombre: "Carmen Flores",
        empresa: "Panadería La Espiga",
        ruc: "J-667788990",
        telefono: "0416-6677889",
        email: "laespiga@email.com",
        sector: "Alimentos"
      },
      banco: "Banco Exterior",
      numeroCuenta: "0115-0789-12-3456789012",
      tipoCuenta: "Ahorro",
      montoSolicitado: 8000,
      montoAprobado: 8000,
      plazo: 24,
      tasaInteres: 8,
      fechaSolicitud: "2024-02-10",
      fechaAprobacion: "2024-02-20",
      fechaDesembolso: "2024-03-01",
      fechaVencimiento: "2026-03-01",
      estado: "Desembolsado",
      analista: "Carolina Rivas",
      observaciones: "Cumple con todos los requisitos"
    },
    {
      id: 7,
      emprendedor: {
        nombre: "Roberto Sánchez",
        empresa: "Clínica Veterinaria Mascotas",
        ruc: "J-334455667",
        telefono: "0424-3344556",
        email: "veterinaria@email.com",
        sector: "Servicios Veterinarios"
      },
      banco: "Banco Plaza",
      numeroCuenta: "0114-0456-78-1234567890",
      tipoCuenta: "Corriente",
      montoSolicitado: 20000,
      montoAprobado: 18000,
      plazo: 30,
      tasaInteres: 8,
      fechaSolicitud: "2024-01-05",
      fechaAprobacion: "2024-01-20",
      fechaDesembolso: "2024-02-01",
      fechaVencimiento: "2026-08-01",
      estado: "Desembolsado",
      analista: "Andrea Silva",
      observaciones: "Proyecto con alto impacto social"
    },
    {
      id: 8,
      emprendedor: {
        nombre: "Patricia Gómez",
        empresa: "Gimnasio Fit Life",
        ruc: "J-776655443",
        telefono: "0412-7766554",
        email: "fitlife@email.com",
        sector: "Deporte y Recreación"
      },
      banco: "Banco del Tesoro",
      numeroCuenta: "0163-0890-12-3456789012",
      tipoCuenta: "Corriente",
      montoSolicitado: 15000,
      montoAprobado: null,
      plazo: 24,
      tasaInteres: 5,
      fechaSolicitud: "2024-03-10",
      fechaAprobacion: null,
      fechaDesembolso: null,
      fechaVencimiento: null,
      estado: "En Evaluación",
      analista: "José Ramírez",
      observaciones: "Revisión de estados financieros"
    }
  ]);

  // Estadísticas bancarias
  const estadisticasBancarias = {
    totalSolicitudes: solicitudesBancarias.length,
    totalSolicitado: solicitudesBancarias.reduce((sum, s) => sum + s.montoSolicitado, 0),
    totalAprobado: solicitudesBancarias.reduce((sum, s) => sum + (s.montoAprobado || 0), 0),
    totalDesembolsado: solicitudesBancarias
      .filter(s => s.estado === "Desembolsado")
      .reduce((sum, s) => sum + (s.montoAprobado || 0), 0),
    porBanco: bancos.map(banco => ({
      ...banco,
      total: solicitudesBancarias.filter(s => s.banco === banco.nombre).length,
      montoTotal: solicitudesBancarias
        .filter(s => s.banco === banco.nombre)
        .reduce((sum, s) => sum + s.montoSolicitado, 0)
    })).filter(b => b.total > 0),
    porEstado: estadosSolicitud.map(estado => ({
      estado,
      total: solicitudesBancarias.filter(s => s.estado === estado).length
    }))
  };

  // Datos del usuario
  const user = {
    name: "Analista Bancario",
    email: "analista.bancario@iadey.gob.ve",
    role: "Analista de Crédito",
    avatar: null,
    department: "Dirección de Financiamiento",
    joinDate: "Enero 2024",
    pendingTasks: 8,
    completedTasks: 45,
    performance: "89%"
  };

  const currentData = {
    title: "Gestión de Solicitudes Bancarias",
    description: "Registro y seguimiento de solicitudes de crédito para emprendimientos",
    actionButton: "Nueva Solicitud",
    pendingTitle: "Solicitudes Recientes"
  };

  // Notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Funciones de filtrado
  const filteredSolicitudes = solicitudesBancarias.filter(sol => {
    const matchesSearch = searchTerm === '' || 
      sol.emprendedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.emprendedor.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.emprendedor.ruc.includes(searchTerm);
    
    const matchesBanco = filters.banco === '' || sol.banco === filters.banco;
    const matchesEstado = filters.estado === '' || sol.estado === filters.estado;
    
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta) {
      const solDate = new Date(sol.fechaSolicitud);
      const desde = new Date(filters.fechaDesde);
      const hasta = new Date(filters.fechaHasta);
      matchesFecha = solDate >= desde && solDate <= hasta;
    }
    
    return matchesSearch && matchesBanco && matchesEstado && matchesFecha;
  });

  // Ordenamiento
  const sortedSolicitudes = [...filteredSolicitudes].sort((a, b) => {
    if (sortConfig.key) {
      let aVal, bVal;
      
      switch(sortConfig.key) {
        case 'emprendedor':
          aVal = a.emprendedor.empresa;
          bVal = b.emprendedor.empresa;
          break;
        case 'montoSolicitado':
          aVal = a.montoSolicitado;
          bVal = b.montoSolicitado;
          break;
        default:
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
      }
      
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

  // Función para exportar a CSV
  const handleExportCSV = () => {
    const headers = ['Emprendedor', 'Empresa', 'RUC', 'Banco', 'N° Cuenta', 'Tipo Cuenta', 'Monto Solicitado', 'Monto Aprobado', 'Plazo (meses)', 'Tasa Interés', 'Fecha Solicitud', 'Fecha Aprobación', 'Fecha Desembolso', 'Fecha Vencimiento', 'Estado', 'Analista', 'Observaciones'];
    const data = filteredSolicitudes.map(s => [
      s.emprendedor.nombre,
      s.emprendedor.empresa,
      s.emprendedor.ruc,
      s.banco,
      s.numeroCuenta,
      s.tipoCuenta,
      s.montoSolicitado,
      s.montoAprobado || 'Pendiente',
      s.plazo,
      s.tasaInteres,
      s.fechaSolicitud,
      s.fechaAprobacion || 'Pendiente',
      s.fechaDesembolso || 'Pendiente',
      s.fechaVencimiento || 'Pendiente',
      s.estado,
      s.analista,
      s.observaciones || ''
    ]);
    
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `solicitudes_bancarias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handleViewDetails = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalMode("view");
    setModalOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      banco: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares
  const getEstadoBadge = (estado) => {
    const styles = {
      'Desembolsado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Aprobado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Pre-aprobado': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'En Evaluación': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'En Moratoria': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Rechazado': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Pendiente";
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
                  {currentData.title}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentData.description}
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653] transition-all flex items-center gap-2"
              >
                <DownloadCloud size={20} />
                Exportar Listado
              </button>
            </div>

            {/* Tarjetas de estadísticas bancarias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <FileText className="text-[#2A9D8F]" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticasBancarias.totalSolicitudes}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Solicitudes</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="text-blue-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatCurrency(estadisticasBancarias.totalSolicitado)}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Solicitado</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="text-green-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatCurrency(estadisticasBancarias.totalAprobado)}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Aprobado</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <HandCoins className="text-purple-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatCurrency(estadisticasBancarias.totalDesembolsado)}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Desembolsado</p>
              </div>
            </div>

            {/* Gráfico de distribución por banco */}
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Solicitudes por Banco
                </h3>
                <div className="space-y-2">
                  {estadisticasBancarias.porBanco.map((banco, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{banco.nombre}</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {banco.total} solicitudes - {formatCurrency(banco.montoTotal)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#2A9D8F] h-2 rounded-full" 
                          style={{ width: `${(banco.total / estadisticasBancarias.totalSolicitudes) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estado de Solicitudes
                </h3>
                <div className="space-y-2">
                  {estadisticasBancarias.porEstado.filter(e => e.total > 0).map((estado, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{estado.estado}</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {estado.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            estado.estado === 'Desembolsado' ? 'bg-green-500' :
                            estado.estado === 'Aprobado' ? 'bg-blue-500' :
                            estado.estado === 'En Evaluación' ? 'bg-yellow-500' :
                            estado.estado === 'Rechazado' ? 'bg-red-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${(estado.total / estadisticasBancarias.totalSolicitudes) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barra de búsqueda y acciones */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por emprendedor, empresa o RUC..."
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
                  onClick={() => navigate('/nueva-solicitud')}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={filters.banco}
                    onChange={(e) => setFilters({...filters, banco: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los bancos</option>
                    {bancos.map(banco => (
                      <option key={banco.id} value={banco.nombre}>{banco.nombre}</option>
                    ))}
                  </select>

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
                    {estadosSolicitud.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filters.fechaDesde}
                      onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                      className={`w-1/2 px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                      placeholder="Fecha Desde"
                    />
                    <input
                      type="date"
                      value={filters.fechaHasta}
                      onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                      className={`w-1/2 px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                      placeholder="Fecha Hasta"
                    />
                  </div>
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

            {/* DataTable de Solicitudes Bancarias */}
            <div className={`rounded-xl border ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            } overflow-hidden`}>
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
                          onClick={() => handleSort('emprendedor')}>
                        <div className="flex items-center gap-2">
                          Emprendedor / Empresa
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Banco / N° Cuenta
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('montoSolicitado')}>
                        <div className="flex items-center gap-2">
                          Monto Solicitado
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto Aprobado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('fechaSolicitud')}>
                        <div className="flex items-center gap-2">
                          Fecha Solicitud
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Aprobación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
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
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {solicitud.emprendedor.empresa}
                              </span>
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {solicitud.emprendedor.nombre} | {solicitud.emprendedor.ruc}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {solicitud.emprendedor.sector}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Landmark size={14} className="text-[#2A9D8F]" />
                              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {solicitud.banco}
                              </span>
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {solicitud.numeroCuenta}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {solicitud.tipoCuenta}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatCurrency(solicitud.montoSolicitado)}
                          </span>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Plazo: {solicitud.plazo} meses
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {solicitud.montoAprobado ? (
                            <>
                              <span className={`text-sm font-semibold text-green-600 dark:text-green-400`}>
                                {formatCurrency(solicitud.montoAprobado)}
                              </span>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Tasa: {solicitud.tasaInteres}%
                              </div>
                            </>
                          ) : (
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatDate(solicitud.fechaSolicitud)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatDate(solicitud.fechaAprobacion)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadge(solicitud.estado)}`}>
                            {solicitud.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(solicitud)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Ver detalles"
                            >
                              <Eye size={18} className="text-[#2A9D8F]" />
                            </button>
                            <button
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Editar"
                            >
                              <Edit size={18} className="text-blue-500" />
                            </button>
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

            {/* Modal de Detalles */}
            {modalOpen && modalMode === "view" && selectedSolicitud && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Detalle de Solicitud Bancaria
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedSolicitud.emprendedor.empresa}
                    </p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Información del Emprendedor */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Users size={16} />
                        Información del Emprendedor
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.emprendedor.nombre}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Empresa</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.emprendedor.empresa}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>RUC</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.emprendedor.ruc}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sector</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.emprendedor.sector}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Teléfono</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.emprendedor.telefono}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.emprendedor.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Información Bancaria */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Landmark size={16} />
                        Detalles Bancarios
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Banco</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.banco}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Número de Cuenta</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.numeroCuenta}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tipo de Cuenta</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.tipoCuenta}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasa de Interés</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.tasaInteres}% anual
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Información del Crédito */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <DollarSign size={16} />
                        Detalles del Crédito
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto Solicitado</label>
                          <p className={`font-medium text-blue-600 dark:text-blue-400`}>
                            {formatCurrency(selectedSolicitud.montoSolicitado)}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto Aprobado</label>
                          <p className={`font-medium ${selectedSolicitud.montoAprobado ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {selectedSolicitud.montoAprobado ? formatCurrency(selectedSolicitud.montoAprobado) : 'Pendiente'}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plazo</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.plazo} meses
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cuota Mensual Aprox.</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.montoAprobado ? 
                              formatCurrency(selectedSolicitud.montoAprobado / selectedSolicitud.plazo) : 
                              'Por calcular'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fechas y Estado */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Calendar size={16} />
                        Cronograma
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Solicitud</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatDate(selectedSolicitud.fechaSolicitud)}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Aprobación</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatDate(selectedSolicitud.fechaAprobacion)}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Desembolso</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatDate(selectedSolicitud.fechaDesembolso)}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Vencimiento</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatDate(selectedSolicitud.fechaVencimiento)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Observaciones */}
                    {selectedSolicitud.observaciones && (
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Observaciones
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {selectedSolicitud.observaciones}
                        </p>
                        <div className="mt-2">
                          <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Analista Responsable</label>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedSolicitud.analista}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`p-6 border-t flex justify-end ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-[#2A9D8F] text-white hover:bg-[#264653]"
                    >
                      Cerrar
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
                  No hay solicitudes bancarias que coincidan con los filtros aplicados.
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

export default Bancarios;