// pages/ClasificacionEmprendimiento.jsx
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
  RefreshCw
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const ClasificacionEmprendimiento = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nuevo emprendimiento registrado para clasificación", time: "5 min", read: false },
    { id: 2, text: "Clasificación de emprendimiento actualizada", time: "1 hora", read: false },
    { id: 3, text: "Emprendimiento alcanzó categoría Premium", time: "3 horas", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("clasificacion");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // view, edit, evaluar
  const [selectedEmprendimiento, setSelectedEmprendimiento] = useState(null);
  const [evaluacionForm, setEvaluacionForm] = useState({
    ingresosMensuales: 0,
    empleados: 0,
    antiguedad: 0,
    inversion: 0,
    crecimiento: 0,
    innovacion: 0,
    impactoSocial: 0,
    sostenibilidad: 0
  });

  // Estados para la DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoria: '',
    sector: '',
    nivel: '',
    municipio: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Datos de ejemplo para emprendimientos
  const [emprendimientos, setEmprendimientos] = useState([
    {
      id: 1,
      nombre: "Restaurante El Sazón",
      ruc: "J-123456789",
      representante: "María González",
      sector: "Gastronomía",
      subsector: "Restaurantes",
      municipio: "Libertador",
      direccion: "Av. Principal, Caracas",
      telefono: "0412-1234567",
      email: "elsazon@email.com",
      fechaRegistro: "2023-01-15",
      clasificacion: {
        categoria: "Micro",
        nivel: "Inicial",
        puntaje: 65,
        rango: "Bronce"
      },
      metricas: {
        ingresosMensuales: 3500,
        empleados: 5,
        antiguedad: 14,
        inversion: 15000,
        crecimiento: 15,
        innovacion: 70,
        impactoSocial: 80,
        sostenibilidad: 75
      },
      estado: "Activo",
      certificaciones: ["Registro Sanitario", "BPM"],
      ultimaEvaluacion: "2024-01-15"
    },
    {
      id: 2,
      nombre: "Taller Mecánico Rápido",
      ruc: "J-876543210",
      representante: "Juan Pérez",
      sector: "Servicios Automotrices",
      subsector: "Mecánica General",
      municipio: "Chacao",
      direccion: "Av. Francisco de Miranda",
      telefono: "0416-7654321",
      email: "tallerrapido@email.com",
      fechaRegistro: "2023-03-20",
      clasificacion: {
        categoria: "Pequeña",
        nivel: "Desarrollo",
        puntaje: 78,
        rango: "Plata"
      },
      metricas: {
        ingresosMensuales: 8500,
        empleados: 12,
        antiguedad: 12,
        inversion: 45000,
        crecimiento: 25,
        innovacion: 65,
        impactoSocial: 60,
        sostenibilidad: 70
      },
      estado: "Activo",
      certificaciones: ["Taller Certificado"],
      ultimaEvaluacion: "2024-02-10"
    },
    {
      id: 3,
      nombre: "Moda Express",
      ruc: "J-112233445",
      representante: "Carlos Rodríguez",
      sector: "Comercio",
      subsector: "Venta de Ropa",
      municipio: "Baruta",
      direccion: "CC El Recreo",
      telefono: "0424-1122334",
      email: "modaexpress@email.com",
      fechaRegistro: "2023-06-10",
      clasificacion: {
        categoria: "Micro",
        nivel: "Inicial",
        puntaje: 52,
        rango: "Bronce"
      },
      metricas: {
        ingresosMensuales: 2800,
        empleados: 3,
        antiguedad: 9,
        inversion: 8000,
        crecimiento: 8,
        innovacion: 55,
        impactoSocial: 50,
        sostenibilidad: 60
      },
      estado: "Activo",
      certificaciones: [],
      ultimaEvaluacion: "2024-01-20"
    },
    {
      id: 4,
      nombre: "Centro Estético Bella Vista",
      ruc: "J-998877665",
      representante: "Ana Martínez",
      sector: "Salud y Bienestar",
      subsector: "Estética",
      municipio: "Sucre",
      direccion: "Av. Principal de Petare",
      telefono: "0414-9988776",
      email: "bellavista@email.com",
      fechaRegistro: "2023-08-05",
      clasificacion: {
        categoria: "Micro",
        nivel: "Inicial",
        puntaje: 48,
        rango: "Bronce"
      },
      metricas: {
        ingresosMensuales: 3200,
        empleados: 4,
        antiguedad: 7,
        inversion: 12000,
        crecimiento: 12,
        innovacion: 60,
        impactoSocial: 70,
        sostenibilidad: 65
      },
      estado: "En Evaluación",
      certificaciones: [],
      ultimaEvaluacion: null
    },
    {
      id: 5,
      nombre: "Ferretería El Constructor",
      ruc: "J-554433221",
      representante: "Luis Torres",
      sector: "Construcción",
      subsector: "Materiales",
      municipio: "El Hatillo",
      direccion: "Calle Principal, El Hatillo",
      telefono: "0412-5544332",
      email: "elconstructor@email.com",
      fechaRegistro: "2022-11-15",
      clasificacion: {
        categoria: "Mediana",
        nivel: "Consolidado",
        puntaje: 88,
        rango: "Oro"
      },
      metricas: {
        ingresosMensuales: 25000,
        empleados: 28,
        antiguedad: 28,
        inversion: 120000,
        crecimiento: 32,
        innovacion: 75,
        impactoSocial: 65,
        sostenibilidad: 80
      },
      estado: "Activo",
      certificaciones: ["ISO 9001", "Sello Verde"],
      ultimaEvaluacion: "2024-02-28"
    },
    {
      id: 6,
      nombre: "Panadería La Espiga",
      ruc: "J-667788990",
      representante: "Carmen Flores",
      sector: "Alimentos",
      subsector: "Panadería",
      municipio: "Libertador",
      direccion: "Av. San Martín",
      telefono: "0416-6677889",
      email: "laespiga@email.com",
      fechaRegistro: "2023-09-20",
      clasificacion: {
        categoria: "Micro",
        nivel: "Inicial",
        puntaje: 58,
        rango: "Bronce"
      },
      metricas: {
        ingresosMensuales: 4200,
        empleados: 6,
        antiguedad: 6,
        inversion: 18000,
        crecimiento: 18,
        innovacion: 65,
        impactoSocial: 75,
        sostenibilidad: 70
      },
      estado: "Activo",
      certificaciones: ["Registro Sanitario"],
      ultimaEvaluacion: "2024-01-25"
    },
    {
      id: 7,
      nombre: "Clínica Veterinaria Mascotas",
      ruc: "J-334455667",
      representante: "Roberto Sánchez",
      sector: "Servicios Veterinarios",
      subsector: "Clínica",
      municipio: "Chacao",
      direccion: "Av. Libertador",
      telefono: "0424-3344556",
      email: "veterinaria@email.com",
      fechaRegistro: "2023-04-12",
      clasificacion: {
        categoria: "Pequeña",
        nivel: "Desarrollo",
        puntaje: 82,
        rango: "Plata"
      },
      metricas: {
        ingresosMensuales: 12000,
        empleados: 15,
        antiguedad: 11,
        inversion: 65000,
        crecimiento: 28,
        innovacion: 85,
        impactoSocial: 90,
        sostenibilidad: 75
      },
      estado: "Activo",
      certificaciones: ["Acreditación Veterinaria"],
      ultimaEvaluacion: "2024-02-15"
    },
    {
      id: 8,
      nombre: "Gimnasio Fit Life",
      ruc: "J-776655443",
      representante: "Patricia Gómez",
      sector: "Deporte y Recreación",
      subsector: "Gimnasio",
      municipio: "Baruta",
      direccion: "Av. Las Mercedes",
      telefono: "0412-7766554",
      email: "fitlife@email.com",
      fechaRegistro: "2023-10-01",
      clasificacion: {
        categoria: "Pequeña",
        nivel: "Desarrollo",
        puntaje: 75,
        rango: "Plata"
      },
      metricas: {
        ingresosMensuales: 9500,
        empleados: 10,
        antiguedad: 5,
        inversion: 55000,
        crecimiento: 22,
        innovacion: 80,
        impactoSocial: 85,
        sostenibilidad: 70
      },
      estado: "Activo",
      certificaciones: ["Instructor Certificado"],
      ultimaEvaluacion: "2024-03-01"
    }
  ]);

  // Sectores disponibles
  const sectores = [
    "Gastronomía",
    "Servicios Automotrices",
    "Comercio",
    "Salud y Bienestar",
    "Construcción",
    "Alimentos",
    "Servicios Veterinarios",
    "Deporte y Recreación",
    "Tecnología",
    "Educación",
    "Turismo",
    "Arte y Cultura",
    "Agroindustria",
    "Textil",
    "Logística"
  ];

  // Municipios de Caracas
  const municipios = [
    "Libertador",
    "Chacao",
    "Baruta",
    "Sucre",
    "El Hatillo"
  ];

  // Categorías de clasificación
  const categorias = {
    micro: { nombre: "Micro", limiteIngresos: 5000, limiteEmpleados: 10, color: "bronze" },
    pequena: { nombre: "Pequeña", limiteIngresos: 15000, limiteEmpleados: 30, color: "silver" },
    mediana: { nombre: "Mediana", limiteIngresos: 50000, limiteEmpleados: 100, color: "gold" },
    grande: { nombre: "Grande", limiteIngresos: Infinity, limiteEmpleados: Infinity, color: "platinum" }
  };

  // Niveles de desarrollo
  const niveles = {
    inicial: { nombre: "Inicial", puntajeMin: 0, puntajeMax: 59, color: "bronze" },
    desarrollo: { nombre: "Desarrollo", puntajeMin: 60, puntajeMax: 79, color: "silver" },
    consolidado: { nombre: "Consolidado", puntajeMin: 80, puntajeMax: 100, color: "gold" }
  };

  // Estadísticas de clasificación
  const estadisticas = {
    total: emprendimientos.length,
    porCategoria: {
      micro: emprendimientos.filter(e => e.clasificacion.categoria === "Micro").length,
      pequena: emprendimientos.filter(e => e.clasificacion.categoria === "Pequeña").length,
      mediana: emprendimientos.filter(e => e.clasificacion.categoria === "Mediana").length,
      grande: emprendimientos.filter(e => e.clasificacion.categoria === "Grande").length
    },
    porNivel: {
      inicial: emprendimientos.filter(e => e.clasificacion.nivel === "Inicial").length,
      desarrollo: emprendimientos.filter(e => e.clasificacion.nivel === "Desarrollo").length,
      consolidado: emprendimientos.filter(e => e.clasificacion.nivel === "Consolidado").length
    },
    porRango: {
      bronce: emprendimientos.filter(e => e.clasificacion.rango === "Bronce").length,
      plata: emprendimientos.filter(e => e.clasificacion.rango === "Plata").length,
      oro: emprendimientos.filter(e => e.clasificacion.rango === "Oro").length
    },
    promedioPuntaje: (emprendimientos.reduce((sum, e) => sum + e.clasificacion.puntaje, 0) / emprendimientos.length).toFixed(1)
  };

  // Datos del usuario
  const user = {
    name: "Analista IADEY",
    email: "analista@iadey.gob.ve",
    role: "Analista de Clasificación",
    avatar: null,
    department: "Dirección de Fomento",
    joinDate: "Enero 2024",
    pendingTasks: 6,
    completedTasks: 52,
    performance: "92%"
  };

  const currentData = {
    title: "Clasificación de Emprendimientos",
    description: "Sistema de evaluación y categorización de emprendimientos según su nivel de desarrollo y potencial",
    actionButton: "Nuevo Emprendimiento",
    pendingTitle: "Últimos Evaluados"
  };

  // Notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Función para calcular clasificación automática
  const calcularClasificacion = (metricas) => {
    // Cálculo de categoría por ingresos y empleados
    let categoria = "Micro";
    if (metricas.ingresosMensuales >= 50000 || metricas.empleados >= 100) {
      categoria = "Grande";
    } else if (metricas.ingresosMensuales >= 15000 || metricas.empleados >= 30) {
      categoria = "Mediana";
    } else if (metricas.ingresosMensuales >= 5000 || metricas.empleados >= 10) {
      categoria = "Pequeña";
    } else {
      categoria = "Micro";
    }

    // Cálculo de puntaje de desarrollo
    const puntajes = {
      ingresos: Math.min((metricas.ingresosMensuales / 50000) * 25, 25),
      empleados: Math.min((metricas.empleados / 100) * 15, 15),
      antiguedad: Math.min((metricas.antiguedad / 60) * 10, 10),
      inversion: Math.min((metricas.inversion / 200000) * 15, 15),
      crecimiento: Math.min((metricas.crecimiento / 100) * 15, 15),
      innovacion: metricas.innovacion / 100 * 10,
      impactoSocial: metricas.impactoSocial / 100 * 5,
      sostenibilidad: metricas.sostenibilidad / 100 * 5
    };

    const puntajeTotal = Object.values(puntajes).reduce((a, b) => a + b, 0);
    
    let nivel = "Inicial";
    let rango = "Bronce";
    
    if (puntajeTotal >= 80) {
      nivel = "Consolidado";
      rango = "Oro";
    } else if (puntajeTotal >= 60) {
      nivel = "Desarrollo";
      rango = "Plata";
    } else {
      nivel = "Inicial";
      rango = "Bronce";
    }

    return {
      categoria,
      nivel,
      puntaje: Math.round(puntajeTotal),
      rango
    };
  };

  // Función para evaluar emprendimiento
  const handleEvaluar = (emprendimiento) => {
    setSelectedEmprendimiento(emprendimiento);
    setEvaluacionForm({
      ingresosMensuales: emprendimiento.metricas.ingresosMensuales,
      empleados: emprendimiento.metricas.empleados,
      antiguedad: emprendimiento.metricas.antiguedad,
      inversion: emprendimiento.metricas.inversion,
      crecimiento: emprendimiento.metricas.crecimiento,
      innovacion: emprendimiento.metricas.innovacion,
      impactoSocial: emprendimiento.metricas.impactoSocial,
      sostenibilidad: emprendimiento.metricas.sostenibilidad
    });
    setModalMode("evaluar");
    setModalOpen(true);
  };

  // Función para guardar evaluación
  const guardarEvaluacion = () => {
    if (selectedEmprendimiento) {
      const nuevaClasificacion = calcularClasificacion(evaluacionForm);
      const updatedEmprendimientos = emprendimientos.map(e => 
        e.id === selectedEmprendimiento.id 
          ? { 
              ...e, 
              metricas: evaluacionForm,
              clasificacion: nuevaClasificacion,
              ultimaEvaluacion: new Date().toISOString().split('T')[0],
              estado: "Activo"
            }
          : e
      );
      setEmprendimientos(updatedEmprendimientos);
      setModalOpen(false);
      alert(`Emprendimiento ${selectedEmprendimiento.nombre} clasificado como ${nuevaClasificacion.categoria} - Nivel ${nuevaClasificacion.nivel} (${nuevaClasificacion.rango})`);
    }
  };

  // Funciones de filtrado y ordenamiento
  const filteredEmprendimientos = emprendimientos.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.representante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ruc.includes(searchTerm);
    
    const matchesCategoria = filters.categoria === '' || emp.clasificacion.categoria === filters.categoria;
    const matchesSector = filters.sector === '' || emp.sector === filters.sector;
    const matchesNivel = filters.nivel === '' || emp.clasificacion.nivel === filters.nivel;
    const matchesMunicipio = filters.municipio === '' || emp.municipio === filters.municipio;
    
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta) {
      const empDate = new Date(emp.fechaRegistro);
      const desde = new Date(filters.fechaDesde);
      const hasta = new Date(filters.fechaHasta);
      matchesFecha = empDate >= desde && empDate <= hasta;
    }
    
    return matchesSearch && matchesCategoria && matchesSector && matchesNivel && matchesMunicipio && matchesFecha;
  });

  // Ordenamiento
  const sortedEmprendimientos = [...filteredEmprendimientos].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedEmprendimientos.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedEmprendimientos = sortedEmprendimientos.slice(startIndex, startIndex + rowsPerPage);

  // Funciones de manejo
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedEmprendimientos.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedEmprendimientos.map(emp => emp.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleViewDetails = (emprendimiento) => {
    setSelectedEmprendimiento(emprendimiento);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEditEmprendimiento = (emprendimiento) => {
    setSelectedEmprendimiento(emprendimiento);
    setModalMode("edit");
    setModalOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      categoria: '',
      sector: '',
      nivel: '',
      municipio: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares para estilos
  const getRangoBadge = (rango) => {
    const styles = {
      'Bronce': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Plata': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'Oro': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return styles[rango] || 'bg-gray-100 text-gray-800';
  };

  const getCategoriaBadge = (categoria) => {
    const styles = {
      'Micro': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Pequeña': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Mediana': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Grande': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[categoria] || 'bg-gray-100 text-gray-800';
  };

  const getNivelBadge = (nivel) => {
    const styles = {
      'Inicial': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'Desarrollo': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Consolidado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return styles[nivel] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      'Activo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'En Evaluación': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Inactivo': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800';
  };

  const getSectorIcon = (sector) => {
    const icons = {
      'Gastronomía': Utensils,
      'Servicios Automotrices': Car,
      'Comercio': ShoppingBag,
      'Salud y Bienestar': Heart,
      'Construcción': Building,
      'Alimentos': Gift,
      'Servicios Veterinarios': Heart,
      'Deporte y Recreación': Activity
    };
    const IconComponent = icons[sector] || Briefcase;
    return IconComponent;
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
    if (!dateString) return "No evaluado";
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
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {currentData.title}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentData.description}
              </p>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Building className="text-[#2A9D8F]" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.total}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Emprendimientos</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Award className="text-yellow-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.porRango.oro}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rango Oro</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-green-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.porNivel.desarrollo + estadisticas.porNivel.consolidado}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Desarrollo+</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Star className="text-purple-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.promedioPuntaje}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Puntaje Promedio</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Users className="text-blue-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.porCategoria.mediana + estadisticas.porCategoria.grande}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Medianas/Grandes</p>
              </div>
            </div>

            {/* Barra de búsqueda y acciones */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, representante o RUC..."
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
                  onClick={() => navigate('/nuevo-emprendimiento')}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nuevo Emprendimiento
                </button>
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <select
                    value={filters.categoria}
                    onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todas las categorías</option>
                    <option value="Micro">Micro</option>
                    <option value="Pequeña">Pequeña</option>
                    <option value="Mediana">Mediana</option>
                    <option value="Grande">Grande</option>
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
                    {sectores.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>

                  <select
                    value={filters.nivel}
                    onChange={(e) => setFilters({...filters, nivel: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los niveles</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Desarrollo">Desarrollo</option>
                    <option value="Consolidado">Consolidado</option>
                  </select>

                  <select
                    value={filters.municipio}
                    onChange={(e) => setFilters({...filters, municipio: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los municipios</option>
                    {municipios.map(mun => (
                      <option key={mun} value={mun}>{mun}</option>
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
                      placeholder="Desde"
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
                      placeholder="Hasta"
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

            {/* DataTable de Emprendimientos */}
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
                          checked={selectedRows.length === paginatedEmprendimientos.length && paginatedEmprendimientos.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('nombre')}>
                        <div className="flex items-center gap-2">
                          Emprendimiento
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('sector')}>
                        <div className="flex items-center gap-2">
                          Sector
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clasificación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('clasificacion.puntaje')}>
                        <div className="flex items-center gap-2">
                          Puntaje
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Métricas
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
                    {paginatedEmprendimientos.map((emprendimiento) => {
                      const SectorIcon = getSectorIcon(emprendimiento.sector);
                      return (
                        <tr key={emprendimiento.id} className={`${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        } transition-colors`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(emprendimiento.id)}
                              onChange={() => handleSelectRow(emprendimiento.id)}
                              className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <SectorIcon size={16} className="text-[#2A9D8F]" />
                                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {emprendimiento.nombre}
                                </span>
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {emprendimiento.representante} | {emprendimiento.municipio}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {emprendimiento.sector}
                            </span>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {emprendimiento.subsector}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${getCategoriaBadge(emprendimiento.clasificacion.categoria)}`}>
                                {emprendimiento.clasificacion.categoria}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getNivelBadge(emprendimiento.clasificacion.nivel)}`}>
                                {emprendimiento.clasificacion.nivel}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getRangoBadge(emprendimiento.clasificacion.rango)}`}>
                                {emprendimiento.clasificacion.rango}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                  <div 
                                    className="bg-[#2A9D8F] h-2 rounded-full" 
                                    style={{ width: `${emprendimiento.clasificacion.puntaje}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {emprendimiento.clasificacion.puntaje}
                                </span>
                              </div>
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Evaluado: {formatDate(emprendimiento.ultimaEvaluacion)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <DollarSign size={12} className="text-green-500" />
                                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {formatCurrency(emprendimiento.metricas.ingresosMensuales)}/mes
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={12} className="text-blue-500" />
                                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {emprendimiento.metricas.empleados} empleados
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-orange-500" />
                                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {emprendimiento.metricas.antiguedad} meses
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadge(emprendimiento.estado)}`}>
                              {emprendimiento.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewDetails(emprendimiento)}
                                className={`p-1 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors`}
                                title="Ver detalles"
                              >
                                <Eye size={18} className="text-[#2A9D8F]" />
                              </button>
                              <button
                                onClick={() => handleEditEmprendimiento(emprendimiento)}
                                className={`p-1 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors`}
                                title="Editar"
                              >
                                <Edit size={18} className="text-blue-500" />
                              </button>
                              {emprendimiento.estado !== "En Evaluación" && (
                                <button
                                  onClick={() => handleEvaluar(emprendimiento)}
                                  className={`p-1 rounded-lg ${
                                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                  } transition-colors`}
                                  title="Evaluar"
                                >
                                  <Target size={18} className="text-purple-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedEmprendimientos.length)} de {sortedEmprendimientos.length}
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

            {/* Modal de Evaluación */}
            {modalOpen && modalMode === "evaluar" && selectedEmprendimiento && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className={`p-6 border-b sticky top-0 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Evaluación de Emprendimiento
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedEmprendimiento.nombre} - {selectedEmprendimiento.representante}
                    </p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Métricas de evaluación */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Ingresos Mensuales (USD)
                        </label>
                        <input
                          type="number"
                          value={evaluacionForm.ingresosMensuales}
                          onChange={(e) => setEvaluacionForm({...evaluacionForm, ingresosMensuales: parseFloat(e.target.value)})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Número de Empleados
                        </label>
                        <input
                          type="number"
                          value={evaluacionForm.empleados}
                          onChange={(e) => setEvaluacionForm({...evaluacionForm, empleados: parseInt(e.target.value)})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Antigüedad (meses)
                        </label>
                        <input
                          type="number"
                          value={evaluacionForm.antiguedad}
                          onChange={(e) => setEvaluacionForm({...evaluacionForm, antiguedad: parseInt(e.target.value)})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Inversión Inicial (USD)
                        </label>
                        <input
                          type="number"
                          value={evaluacionForm.inversion}
                          onChange={(e) => setEvaluacionForm({...evaluacionForm, inversion: parseFloat(e.target.value)})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Crecimiento Anual (%)
                        </label>
                        <input
                          type="number"
                          value={evaluacionForm.crecimiento}
                          onChange={(e) => setEvaluacionForm({...evaluacionForm, crecimiento: parseFloat(e.target.value)})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Nivel de Innovación (0-100)
                        </label>
                        <input
                          type="number"
                          value={evaluacionForm.innovacion}
                          onChange={(e) => setEvaluacionForm({...evaluacionForm, innovacion: parseFloat(e.target.value)})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Impacto Social (0-100)
                        </label>
                        <input
                          type="number"
                          value={evaluacionForm.impactoSocial}
                          onChange={(e) => setEvaluacionForm({...evaluacionForm, impactoSocial: parseFloat(e.target.value)})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Sostenibilidad (0-100)
                        </label>
                        <input
                          type="number"
                          value={evaluacionForm.sostenibilidad}
                          onChange={(e) => setEvaluacionForm({...evaluacionForm, sostenibilidad: parseFloat(e.target.value)})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                    </div>

                    {/* Vista previa de clasificación */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Clasificación Resultante:
                      </h3>
                      <div className="flex gap-4 flex-wrap">
                        {(() => {
                          const nuevaClasificacion = calcularClasificacion(evaluacionForm);
                          return (
                            <>
                              <span className={`px-3 py-1 rounded-full text-sm ${getCategoriaBadge(nuevaClasificacion.categoria)}`}>
                                {nuevaClasificacion.categoria}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm ${getNivelBadge(nuevaClasificacion.nivel)}`}>
                                {nuevaClasificacion.nivel}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm ${getRangoBadge(nuevaClasificacion.rango)}`}>
                                {nuevaClasificacion.rango} ({nuevaClasificacion.puntaje} pts)
                              </span>
                            </>
                          );
                        })()}
                      </div>
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
                      onClick={guardarEvaluacion}
                      className="px-4 py-2 rounded-lg bg-[#2A9D8F] text-white hover:bg-[#264653]"
                    >
                      Guardar Clasificación
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Ver Detalles */}
            {modalOpen && modalMode === "view" && selectedEmprendimiento && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Detalles del Emprendimiento
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedEmprendimiento.nombre}
                    </p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>RUC</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEmprendimiento.ruc}</p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Representante</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEmprendimiento.representante}</p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sector</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEmprendimiento.sector}</p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subsector</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEmprendimiento.subsector}</p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Municipio</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEmprendimiento.municipio}</p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dirección</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEmprendimiento.direccion}</p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Teléfono</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEmprendimiento.telefono}</p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEmprendimiento.email}</p>
                      </div>
                    </div>

                    {/* Clasificación actual */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Clasificación Actual
                      </h3>
                      <div className="flex gap-4 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm ${getCategoriaBadge(selectedEmprendimiento.clasificacion.categoria)}`}>
                          {selectedEmprendimiento.clasificacion.categoria}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${getNivelBadge(selectedEmprendimiento.clasificacion.nivel)}`}>
                          {selectedEmprendimiento.clasificacion.nivel}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${getRangoBadge(selectedEmprendimiento.clasificacion.rango)}`}>
                          {selectedEmprendimiento.clasificacion.rango} ({selectedEmprendimiento.clasificacion.puntaje} pts)
                        </span>
                      </div>
                    </div>

                    {/* Métricas detalladas */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Métricas de Desempeño
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingresos Mensuales:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatCurrency(selectedEmprendimiento.metricas.ingresosMensuales)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Empleados:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedEmprendimiento.metricas.empleados}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Antigüedad:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedEmprendimiento.metricas.antiguedad} meses
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inversión:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatCurrency(selectedEmprendimiento.metricas.inversion)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Crecimiento:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedEmprendimiento.metricas.crecimiento}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Innovación:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-[#2A9D8F] h-2 rounded-full" style={{ width: `${selectedEmprendimiento.metricas.innovacion}%` }}></div>
                            </div>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedEmprendimiento.metricas.innovacion}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Impacto Social:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-[#2A9D8F] h-2 rounded-full" style={{ width: `${selectedEmprendimiento.metricas.impactoSocial}%` }}></div>
                            </div>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedEmprendimiento.metricas.impactoSocial}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sostenibilidad:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-[#2A9D8F] h-2 rounded-full" style={{ width: `${selectedEmprendimiento.metricas.sostenibilidad}%` }}></div>
                            </div>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedEmprendimiento.metricas.sostenibilidad}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificaciones */}
                    {selectedEmprendimiento.certificaciones.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Certificaciones
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {selectedEmprendimiento.certificaciones.map((cert, idx) => (
                            <span key={idx} className={`px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              {cert}
                            </span>
                          ))}
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
            {sortedEmprendimientos.length === 0 && (
              <div className={`text-center py-12 rounded-xl border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <Building size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No se encontraron emprendimientos
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay emprendimientos que coincidan con los filtros aplicados.
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

export default ClasificacionEmprendimiento;