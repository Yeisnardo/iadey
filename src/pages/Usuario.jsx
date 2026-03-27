// pages/Usuario.jsx
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
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  Building,
  Briefcase,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  RefreshCw,
  Key,
  Settings,
  UserCog,
  Activity,
  BarChart
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Usuario = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nuevo usuario registrado en el sistema", time: "5 min", read: false },
    { id: 2, text: "Solicitud de cambio de rol pendiente", time: "1 hora", read: false },
    { id: 3, text: "Usuario requiere restablecer contraseña", time: "3 horas", read: true },
    { id: 4, text: "Nuevo permiso configurado para inspectores", time: "1 día", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("usuarios");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view, resetPassword
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    cedula: "",
    telefono: "",
    rol: "",
    estado: "Activo"
  });

  // Estados para la DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaRegistro', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rol: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Datos de ejemplo para usuarios del sistema
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: "María",
      apellido: "González",
      email: "maria.gonzalez@iadey.gob.ve",
      cedula: "V-12345678",
      telefono: "0412-1234567",
      rol: "Administrador",
      estado: "Activo",
      fechaRegistro: "2024-01-15",
      ultimoAcceso: "2024-03-12 14:30:00",
      permisos: ["todos"],
      intentosFallidos: 0,
      requiereCambioPass: false
    },
    {
      id: 2,
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan.perez@iadey.gob.ve",
      cedula: "V-87654321",
      telefono: "0416-7654321",
      rol: "Inspector",
      estado: "Activo",
      fechaRegistro: "2024-01-20",
      ultimoAcceso: "2024-03-12 09:15:00",
      permisos: ["ver_inspecciones", "crear_inspecciones", "editar_inspecciones"],
      intentosFallidos: 0,
      requiereCambioPass: false
    },
    {
      id: 3,
      nombre: "Carlos",
      apellido: "Rodríguez",
      email: "carlos.rodriguez@iadey.gob.ve",
      cedula: "V-11223344",
      telefono: "0424-1122334",
      rol: "Analista de Crédito",
      estado: "Activo",
      fechaRegistro: "2024-01-25",
      ultimoAcceso: "2024-03-11 16:45:00",
      permisos: ["ver_solicitudes", "evaluar_solicitudes", "aprobar_solicitudes"],
      intentosFallidos: 1,
      requiereCambioPass: false
    },
    {
      id: 4,
      nombre: "Ana",
      apellido: "Martínez",
      email: "ana.martinez@iadey.gob.ve",
      cedula: "V-99887766",
      telefono: "0414-9988776",
      rol: "Asistente",
      estado: "Inactivo",
      fechaRegistro: "2024-02-01",
      ultimoAcceso: "2024-02-28 11:20:00",
      permisos: ["ver_expedientes", "registrar_documentos"],
      intentosFallidos: 3,
      requiereCambioPass: true
    },
    {
      id: 5,
      nombre: "Luis",
      apellido: "Torres",
      email: "luis.torres@iadey.gob.ve",
      cedula: "V-55443322",
      telefono: "0412-5544332",
      rol: "Inspector",
      estado: "Activo",
      fechaRegistro: "2024-02-10",
      ultimoAcceso: "2024-03-12 08:30:00",
      permisos: ["ver_inspecciones", "crear_inspecciones"],
      intentosFallidos: 0,
      requiereCambioPass: false
    },
    {
      id: 6,
      nombre: "Carmen",
      apellido: "Flores",
      email: "carmen.flores@iadey.gob.ve",
      cedula: "V-66778899",
      telefono: "0416-6677889",
      rol: "Analista de Crédito",
      estado: "Bloqueado",
      fechaRegistro: "2024-02-15",
      ultimoAcceso: "2024-03-10 10:15:00",
      permisos: ["ver_solicitudes"],
      intentosFallidos: 5,
      requiereCambioPass: true
    },
    {
      id: 7,
      nombre: "Roberto",
      apellido: "Sánchez",
      email: "roberto.sanchez@iadey.gob.ve",
      cedula: "V-33445566",
      telefono: "0424-3344556",
      rol: "Supervisor",
      estado: "Activo",
      fechaRegistro: "2024-02-20",
      ultimoAcceso: "2024-03-11 14:20:00",
      permisos: ["ver_inspecciones", "aprobar_inspecciones", "asignar_inspectores"],
      intentosFallidos: 0,
      requiereCambioPass: false
    },
    {
      id: 8,
      nombre: "Patricia",
      apellido: "Gómez",
      email: "patricia.gomez@iadey.gob.ve",
      cedula: "V-77665544",
      telefono: "0412-7766554",
      rol: "Administrador",
      estado: "Activo",
      fechaRegistro: "2024-01-10",
      ultimoAcceso: "2024-03-12 13:45:00",
      permisos: ["todos"],
      intentosFallidos: 0,
      requiereCambioPass: false
    }
  ]);

  // Roles disponibles
  const roles = [
    { value: "Administrador", label: "Administrador", permisos: "Acceso total al sistema" },
    { value: "Supervisor", label: "Supervisor", permisos: "Supervisión y aprobación" },
    { value: "Inspector", label: "Inspector", permisos: "Gestión de inspecciones" },
    { value: "Analista de Crédito", label: "Analista de Crédito", permisos: "Evaluación de créditos" },
    { value: "Asistente", label: "Asistente", permisos: "Gestión documental" },
    { value: "Consultor", label: "Consultor", permisos: "Solo consulta" }
  ];

  // Estadísticas de usuarios
  const estadisticas = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === "Activo").length,
    inactivos: usuarios.filter(u => u.estado === "Inactivo").length,
    bloqueados: usuarios.filter(u => u.estado === "Bloqueado").length,
    porRol: {
      administradores: usuarios.filter(u => u.rol === "Administrador").length,
      inspectores: usuarios.filter(u => u.rol === "Inspector").length,
      analistas: usuarios.filter(u => u.rol === "Analista de Crédito").length,
      otros: usuarios.filter(u => !["Administrador", "Inspector", "Analista de Crédito"].includes(u.rol)).length
    },
    accesosRecientes: usuarios.filter(u => {
      const ultimoAcceso = new Date(u.ultimoAcceso);
      const hoy = new Date();
      const diffDias = Math.floor((hoy - ultimoAcceso) / (1000 * 60 * 60 * 24));
      return diffDias <= 7;
    }).length
  };

  // Datos del usuario actual (logueado)
  const currentUser = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
    department: "Dirección General",
    joinDate: "Enero 2024",
    pendingTasks: 8,
    completedTasks: 45,
    performance: "98%"
  };

  const currentData = {
    title: "Gestión de Usuarios",
    description: "Administración de usuarios, roles y permisos del sistema IADEY",
    actionButton: "Nuevo Usuario",
    pendingTitle: "Usuarios Recientes"
  };

  // Notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Funciones de filtrado y ordenamiento
  const filteredUsuarios = usuarios.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.includes(searchTerm) ||
      user.rol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRol = filters.rol === '' || user.rol === filters.rol;
    const matchesEstado = filters.estado === '' || user.estado === filters.estado;
    
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta) {
      const userDate = new Date(user.fechaRegistro);
      const desde = new Date(filters.fechaDesde);
      const hasta = new Date(filters.fechaHasta);
      matchesFecha = userDate >= desde && userDate <= hasta;
    }
    
    return matchesSearch && matchesRol && matchesEstado && matchesFecha;
  });

  // Ordenamiento
  const sortedUsuarios = [...filteredUsuarios].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedUsuarios.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsuarios = sortedUsuarios.slice(startIndex, startIndex + rowsPerPage);

  // Funciones de manejo
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedUsuarios.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedUsuarios.map(user => user.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      cedula: user.cedula,
      telefono: user.telefono,
      rol: user.rol,
      estado: user.estado
    });
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      cedula: "",
      telefono: "",
      rol: "",
      estado: "Activo"
    });
    setModalMode("create");
    setModalOpen(true);
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setModalMode("resetPassword");
    setModalOpen(true);
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.estado === "Activo" ? "Inactivo" : "Activo";
    const updatedUsuarios = usuarios.map(u => 
      u.id === user.id ? { ...u, estado: newStatus } : u
    );
    setUsuarios(updatedUsuarios);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
      const updatedUsuarios = usuarios.filter(u => u.id !== user.id);
      setUsuarios(updatedUsuarios);
      if (selectedRows.includes(user.id)) {
        setSelectedRows(selectedRows.filter(id => id !== user.id));
      }
    }
  };

  const handleSaveUser = () => {
    if (modalMode === "create") {
      const newUser = {
        id: usuarios.length + 1,
        ...formData,
        fechaRegistro: new Date().toISOString().split('T')[0],
        ultimoAcceso: "Nunca",
        permisos: [],
        intentosFallidos: 0,
        requiereCambioPass: true
      };
      setUsuarios([...usuarios, newUser]);
      alert(`Usuario ${formData.nombre} ${formData.apellido} creado exitosamente`);
    } else if (modalMode === "edit" && selectedUser) {
      const updatedUsuarios = usuarios.map(u => 
        u.id === selectedUser.id ? { ...u, ...formData } : u
      );
      setUsuarios(updatedUsuarios);
      alert(`Usuario ${formData.nombre} ${formData.apellido} actualizado exitosamente`);
    }
    setModalOpen(false);
  };

  const handleConfirmResetPassword = () => {
    if (selectedUser) {
      alert(`Se ha enviado un enlace para restablecer contraseña a ${selectedUser.email}`);
      setModalOpen(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      rol: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares para estilos
  const getEstadoBadge = (estado) => {
    const styles = {
      'Activo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Inactivo': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'Bloqueado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800';
  };

  const getRolBadge = (rol) => {
    const styles = {
      'Administrador': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Supervisor': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Inspector': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Analista de Crédito': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Asistente': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return styles[rol] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        user={currentUser}
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
                  <Users className="text-[#2A9D8F]" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.total}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Usuarios</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="text-green-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.activos}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Usuarios Activos</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <UserX className="text-red-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.bloqueados + estadisticas.inactivos}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Inactivos/Bloqueados</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Shield className="text-purple-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.porRol.administradores}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Administradores</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Activity className="text-blue-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.accesosRecientes}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Accesos últimos 7 días</p>
              </div>
            </div>

            {/* Barra de búsqueda y acciones */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, cédula o rol..."
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
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nuevo Usuario
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
                    value={filters.rol}
                    onChange={(e) => setFilters({...filters, rol: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los roles</option>
                    {roles.map(rol => (
                      <option key={rol.value} value={rol.value}>{rol.label}</option>
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
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Bloqueado">Bloqueado</option>
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

            {/* DataTable de Usuarios */}
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
                          checked={selectedRows.length === paginatedUsuarios.length && paginatedUsuarios.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('nombre')}>
                        <div className="flex items-center gap-2">
                          Usuario
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('email')}>
                        <div className="flex items-center gap-2">
                          Contacto
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('rol')}>
                        <div className="flex items-center gap-2">
                          Rol
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('ultimoAcceso')}>
                        <div className="flex items-center gap-2">
                          Último Acceso
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {paginatedUsuarios.map((usuario) => (
                      <tr key={usuario.id} className={`${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(usuario.id)}
                            onChange={() => handleSelectRow(usuario.id)}
                            className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {usuario.nombre} {usuario.apellido}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {usuario.cedula}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {usuario.email}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {usuario.telefono}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRolBadge(usuario.rol)}`}>
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadge(usuario.estado)}`}>
                              {usuario.estado}
                            </span>
                            {usuario.requiereCambioPass && (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                Requiere cambio contraseña
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatDateTime(usuario.ultimoAcceso)}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Registro: {formatDate(usuario.fechaRegistro)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewUser(usuario)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Ver detalles"
                            >
                              <Eye size={18} className="text-[#2A9D8F]" />
                            </button>
                            <button
                              onClick={() => handleEditUser(usuario)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Editar"
                            >
                              <Edit size={18} className="text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(usuario)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Restablecer contraseña"
                            >
                              <Key size={18} className="text-purple-500" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(usuario)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title={usuario.estado === "Activo" ? "Desactivar" : "Activar"}
                            >
                              {usuario.estado === "Activo" ? (
                                <Lock size={18} className="text-orange-500" />
                              ) : (
                                <Unlock size={18} className="text-green-500" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usuario)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Eliminar"
                            >
                              <Trash2 size={18} className="text-red-500" />
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
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedUsuarios.length)} de {sortedUsuarios.length}
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

            {/* Modal de Usuario (Crear/Editar/Ver/Restablecer) */}
            {modalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className={`p-6 border-b sticky top-0 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {modalMode === "create" && "Crear Nuevo Usuario"}
                      {modalMode === "edit" && "Editar Usuario"}
                      {modalMode === "view" && "Detalles del Usuario"}
                      {modalMode === "resetPassword" && "Restablecer Contraseña"}
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {modalMode === "resetPassword" && selectedUser && (
                      <div className="text-center py-8">
                        <Key size={64} className="mx-auto mb-4 text-purple-500" />
                        <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          Restablecer contraseña
                        </h3>
                        <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Se enviará un enlace de restablecimiento de contraseña al correo:
                        </p>
                        <p className={`font-medium mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {selectedUser.email}
                        </p>
                        <div className="flex justify-center gap-3">
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
                            onClick={handleConfirmResetPassword}
                            className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
                          >
                            Enviar enlace
                          </button>
                        </div>
                      </div>
                    )}

                    {(modalMode === "create" || modalMode === "edit") && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Nombre *
                            </label>
                            <input
                              type="text"
                              value={formData.nombre}
                              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Apellido *
                            </label>
                            <input
                              type="text"
                              value={formData.apellido}
                              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Correo Electrónico *
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Cédula *
                            </label>
                            <input
                              type="text"
                              value={formData.cedula}
                              onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Teléfono
                            </label>
                            <input
                              type="text"
                              value={formData.telefono}
                              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Rol *
                            </label>
                            <select
                              value={formData.rol}
                              onChange={(e) => setFormData({...formData, rol: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            >
                              <option value="">Seleccionar rol</option>
                              {roles.map(rol => (
                                <option key={rol.value} value={rol.value}>{rol.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Estado
                            </label>
                            <select
                              value={formData.estado}
                              onChange={(e) => setFormData({...formData, estado: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            >
                              <option value="Activo">Activo</option>
                              <option value="Inactivo">Inactivo</option>
                              <option value="Bloqueado">Bloqueado</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {modalMode === "view" && selectedUser && (
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#264653] to-[#2A9D8F] flex items-center justify-center text-white text-3xl font-bold">
                            {selectedUser.nombre[0]}{selectedUser.apellido[0]}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre Completo</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedUser.nombre} {selectedUser.apellido}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cédula</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedUser.cedula}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correo Electrónico</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedUser.email}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Teléfono</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedUser.telefono}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rol</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedUser.rol}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado</label>
                            <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadge(selectedUser.estado)}`}>
                              {selectedUser.estado}
                            </span>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha Registro</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {formatDate(selectedUser.fechaRegistro)}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Último Acceso</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {formatDateTime(selectedUser.ultimoAcceso)}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Intentos Fallidos</label>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div 
                                  className={`h-2 rounded-full ${selectedUser.intentosFallidos >= 3 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                  style={{ width: `${(selectedUser.intentosFallidos / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {selectedUser.intentosFallidos}/5
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {(modalMode === "create" || modalMode === "edit") && (
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
                        onClick={handleSaveUser}
                        className="px-4 py-2 rounded-lg bg-[#2A9D8F] text-white hover:bg-[#264653]"
                      >
                        {modalMode === "create" ? "Crear Usuario" : "Guardar Cambios"}
                      </button>
                    </div>
                  )}

                  {modalMode === "view" && (
                    <div className={`p-6 border-t flex justify-end ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-[#2A9D8F] text-white hover:bg-[#264653]"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Si no hay resultados */}
            {sortedUsuarios.length === 0 && (
              <div className={`text-center py-12 rounded-xl border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <Users size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No se encontraron usuarios
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay usuarios que coincidan con los filtros aplicados.
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

export default Usuario;