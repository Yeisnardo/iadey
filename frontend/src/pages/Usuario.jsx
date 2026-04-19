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
  BarChart,
  Save,
  X,
  Loader2
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import personaAPI from "../services/api_persona";
import usuarioAPI from "../services/api_usuario";

const Usuario = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Bienvenido al sistema de gestión de usuarios", time: "ahora", read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("usuarios");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view, resetPassword
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Datos del backend
  const [usuarios, setUsuarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  
  // Formulario de usuario (combinado persona + usuario)
  const [formData, setFormData] = useState({
    // Datos de persona
    nacionalidad: "V",
    cedula: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    telefono: "",
    correo: "",
    estado_civil: "",
    direccion: "",
    estado: "",
    municipio: "",
    parroquia: "",
    tipo_persona: "usuario_sistema",
    email: "",
    // Datos de usuario
    clave: "",
    rol: "",
    estatus: "Activo"
  });

  // Estados para la DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaRegistro', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rol: '',
    estatus: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Roles disponibles
  const roles = [
    { value: "Administrador", label: "Administrador", descripcion: "Acceso total al sistema" },
    { value: "Supervisor", label: "Supervisor", descripcion: "Supervisión y aprobación" },
    { value: "Inspector", label: "Inspector", descripcion: "Gestión de inspecciones" },
    { value: "Analista de Crédito", label: "Analista de Crédito", descripcion: "Evaluación de créditos" },
    { value: "Asistente", label: "Asistente", descripcion: "Gestión documental" },
    { value: "Consultor", label: "Consultor", descripcion: "Solo consulta" },
    { value: "emprendedor", label: "Emprendedor", descripcion: "Usuario emprendedor" }
  ];

  // Estados civiles
  const estadosCiviles = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Unión Libre"];

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Función para cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener todos los usuarios
      const usuariosResponse = await usuarioAPI.getAllUsuarios();
      
      if (usuariosResponse.success) {
        // Para cada usuario, obtener los datos de persona
        const usuariosConPersona = await Promise.all(
          usuariosResponse.data.map(async (usuario) => {
            try {
              const personaResponse = await personaAPI.getPersonaByCedula(usuario.cedula_usuario);
              if (personaResponse.success) {
                return {
                  ...usuario,
                  persona: personaResponse.data,
                  // Campos combinados para facilitar el uso
                  nombre: personaResponse.data.nombres,
                  apellido: personaResponse.data.apellidos,
                  nombre_completo: `${personaResponse.data.nombres} ${personaResponse.data.apellidos}`,
                  email: personaResponse.data.correo,
                  telefono: personaResponse.data.telefono,
                  fechaRegistro: usuario.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
                };
              }
              return usuario;
            } catch (err) {
              console.error(`Error cargando persona para usuario ${usuario.cedula_usuario}:`, err);
              return usuario;
            }
          })
        );
        setUsuarios(usuariosConPersona);
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("Error al cargar los usuarios. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas de usuarios
  const estadisticas = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estatus === "activo").length,
    inactivos: usuarios.filter(u => u.estatus === "inactivo").length,
    bloqueados: usuarios.filter(u => u.estatus === "bloqueado").length,
    porRol: {
      administradores: usuarios.filter(u => u.rol === "Administrador").length,
      inspectores: usuarios.filter(u => u.rol === "Inspector").length,
      analistas: usuarios.filter(u => u.rol === "Analista de Crédito").length,
      otros: usuarios.filter(u => !["Administrador", "Inspector", "Analista de Crédito"].includes(u.rol)).length
    },
    accesosRecientes: usuarios.filter(u => {
      if (!u.ultimo_acceso) return false;
      const ultimoAcceso = new Date(u.ultimo_acceso);
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
      (user.nombre_completo && user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.cedula_usuario && user.cedula_usuario.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.rol && user.rol.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRol = filters.rol === '' || user.rol === filters.rol;
    const matchesEstado = filters.estatus === '' || user.estatus === filters.estatus;
    
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta && user.fechaRegistro) {
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
      
      if (sortConfig.key === 'nombre_completo') {
        aVal = a.nombre_completo || '';
        bVal = b.nombre_completo || '';
      } else if (sortConfig.key === 'ultimoAcceso') {
        aVal = a.ultimo_acceso || '';
        bVal = b.ultimo_acceso || '';
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
      // Datos de persona
      nacionalidad: user.persona?.nacionalidad || "V",
      cedula: user.cedula_usuario,
      nombres: user.persona?.nombres || "",
      apellidos: user.persona?.apellidos || "",
      fecha_nacimiento: user.persona?.fecha_nacimiento?.split('T')[0] || "",
      telefono: user.persona?.telefono || "",
      correo: user.persona?.correo || "",
      estado_civil: user.persona?.estado_civil || "",
      direccion: user.persona?.direccion || "",
      estado: user.persona?.estado || "",
      municipio: user.persona?.municipio || "",
      parroquia: user.persona?.parroquia || "",
      tipo_persona: user.persona?.tipo_persona || "usuario_sistema",
      email: user.persona?.email || "",
      // Datos de usuario
      clave: "",
      rol: user.rol,
      estatus: user.estatus
    });
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      nacionalidad: "V",
      cedula: "",
      nombres: "",
      apellidos: "",
      fecha_nacimiento: "",
      telefono: "",
      correo: "",
      estado_civil: "",
      direccion: "",
      estado: "",
      municipio: "",
      parroquia: "",
      tipo_persona: "usuario_sistema",
      email: "",
      clave: "",
      rol: "",
      estatus: "Activo"
    });
    setModalMode("create");
    setModalOpen(true);
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setModalMode("resetPassword");
    setModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.estatus === "activo" ? "inactivo" : "activo";
    try {
      setLoading(true);
      const response = await usuarioAPI.cambiarEstatus(user.id, newStatus);
      if (response.success) {
        setSuccessMessage(`Usuario ${user.nombre_completo} ${newStatus === "activo" ? "activado" : "desactivado"} correctamente`);
        await cargarUsuarios(); // Recargar lista
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error cambiando estatus:", err);
      setError("Error al cambiar el estado del usuario");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.nombre_completo}?`)) {
      try {
        setLoading(true);
        // Primero eliminar el usuario (la eliminación en cascada eliminará la persona)
        const response = await usuarioAPI.deleteUsuario(user.id);
        if (response.success) {
          setSuccessMessage(`Usuario ${user.nombre_completo} eliminado correctamente`);
          await cargarUsuarios();
          if (selectedRows.includes(user.id)) {
            setSelectedRows(selectedRows.filter(id => id !== user.id));
          }
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (err) {
        console.error("Error eliminando usuario:", err);
        setError("Error al eliminar el usuario");
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (modalMode === "create") {
        // Crear persona primero
        const personaData = {
          nacionalidad: formData.nacionalidad,
          cedula: formData.cedula,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fecha_nacimiento,
          telefono: formData.telefono,
          correo: formData.correo,
          estado_civil: formData.estado_civil,
          direccion: formData.direccion,
          estado: formData.estado,
          municipio: formData.municipio,
          parroquia: formData.parroquia,
          tipo_persona: formData.tipo_persona,
          email: formData.email || formData.correo
        };
        
        const personaResponse = await personaAPI.createPersona(personaData);
        
        if (!personaResponse.success) {
          throw new Error(personaResponse.error || "Error al crear la persona");
        }
        
        // Luego crear el usuario
        const usuarioData = {
          cedula_usuario: formData.cedula,
          clave: formData.clave,
          rol: formData.rol,
          estatus: formData.estatus.toLowerCase()
        };
        
        const usuarioResponse = await usuarioAPI.createUsuario(usuarioData);
        
        if (!usuarioResponse.success) {
          throw new Error(usuarioResponse.error || "Error al crear el usuario");
        }
        
        setSuccessMessage(`Usuario ${formData.nombres} ${formData.apellidos} creado exitosamente`);
        await cargarUsuarios();
        
      } else if (modalMode === "edit" && selectedUser) {
        // Actualizar persona
        const personaData = {
          nacionalidad: formData.nacionalidad,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fecha_nacimiento,
          telefono: formData.telefono,
          correo: formData.correo,
          estado_civil: formData.estado_civil,
          direccion: formData.direccion,
          estado: formData.estado,
          municipio: formData.municipio,
          parroquia: formData.parroquia,
          tipo_persona: formData.tipo_persona,
          email: formData.email || formData.correo
        };
        
        await personaAPI.updatePersona(selectedUser.persona?.id, personaData);
        
        // Actualizar usuario
        const usuarioData = {
          rol: formData.rol,
          estatus: formData.estatus.toLowerCase()
        };
        
        await usuarioAPI.updateUsuario(selectedUser.id, usuarioData);
        
        setSuccessMessage(`Usuario ${formData.nombres} ${formData.apellidos} actualizado exitosamente`);
        await cargarUsuarios();
      }
      
      setModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error("Error guardando usuario:", err);
      setError(err.message || "Error al guardar el usuario");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetPassword = async () => {
    if (selectedUser) {
      try {
        setLoading(true);
        // Generar contraseña temporal
        const tempPassword = Math.random().toString(36).slice(-8);
        const response = await usuarioAPI.updatePassword(selectedUser.id, tempPassword);
        
        if (response.success) {
          setSuccessMessage(`Contraseña restablecida. Nueva contraseña temporal: ${tempPassword}`);
          // Aquí podrías enviar un email con la nueva contraseña
          setModalOpen(false);
          setTimeout(() => setSuccessMessage(null), 5000);
        }
      } catch (err) {
        console.error("Error restableciendo contraseña:", err);
        setError("Error al restablecer la contraseña");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetFilters = () => {
    setFilters({
      rol: '',
      estatus: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares para estilos
  const getEstadoBadge = (estatus) => {
    const styles = {
      'activo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'inactivo': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'bloqueado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    const estadoMap = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'bloqueado': 'Bloqueado'
    };
    return styles[estatus] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoTexto = (estatus) => {
    const estadoMap = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'bloqueado': 'Bloqueado'
    };
    return estadoMap[estatus] || estatus;
  };

  const getRolBadge = (rol) => {
    const styles = {
      'Administrador': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Supervisor': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Inspector': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Analista de Crédito': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Asistente': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'Consultor': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'emprendedor': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    };
    return styles[rol] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Nunca";
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
            {/* Mensajes de éxito/error */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>{successMessage}</span>
                </div>
                <button onClick={() => setSuccessMessage(null)} className="text-green-700">
                  <X size={20} />
                </button>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-red-700">
                  <X size={20} />
                </button>
              </div>
            )}

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
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
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
                    value={filters.estatus}
                    onChange={(e) => setFilters({...filters, estatus: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="bloqueado">Bloqueado</option>
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

            {/* Loading state */}
            {loading && !usuarios.length ? (
              <div className={`text-center py-12 rounded-xl border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <Loader2 size={48} className={`mx-auto mb-4 animate-spin ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cargando usuarios...
                </h3>
              </div>
            ) : (
              <>
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
                              onClick={() => handleSort('nombre_completo')}>
                            <div className="flex items-center gap-2">
                              Usuario
                              <ArrowUpDown size={14} />
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contacto
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
                                  {usuario.nombre_completo || `${usuario.nombre} ${usuario.apellido}`}
                                </div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {usuario.cedula_usuario}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {usuario.email || usuario.correo}
                                </div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {usuario.telefono}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getRolBadge(usuario.rol)}`}>
                                {usuario.rol === 'emprendedor' ? 'Emprendedor' : usuario.rol}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadge(usuario.estatus)}`}>
                                {getEstadoTexto(usuario.estatus)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatDateTime(usuario.ultimo_acceso)}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Registro: {formatDate(usuario.created_at)}
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
                                  title={usuario.estatus === "activo" ? "Desactivar" : "Activar"}
                                >
                                  {usuario.estatus === "activo" ? (
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
              </>
            )}

            {/* Modal de Usuario (Crear/Editar/Ver/Restablecer) */}
            {modalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
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
                          Se generará una nueva contraseña temporal para el usuario:
                        </p>
                        <p className={`font-medium mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {selectedUser.nombre_completo} ({selectedUser.email})
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
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
                          >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            Generar nueva contraseña
                          </button>
                        </div>
                      </div>
                    )}

                    {(modalMode === "create" || modalMode === "edit") && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Datos Personales */}
                          <div className="col-span-2">
                            <h3 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              Datos Personales
                            </h3>
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Nacionalidad *
                            </label>
                            <select
                              value={formData.nacionalidad}
                              onChange={(e) => setFormData({...formData, nacionalidad: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            >
                              <option value="V">Venezolano (V)</option>
                              <option value="E">Extranjero (E)</option>
                            </select>
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
                              placeholder="12345678"
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Nombres *
                            </label>
                            <input
                              type="text"
                              value={formData.nombres}
                              onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Apellidos *
                            </label>
                            <input
                              type="text"
                              value={formData.apellidos}
                              onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Fecha de Nacimiento
                            </label>
                            <input
                              type="date"
                              value={formData.fecha_nacimiento}
                              onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
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
                              placeholder="0412-1234567"
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Correo Electrónico *
                            </label>
                            <input
                              type="email"
                              value={formData.correo}
                              onChange={(e) => setFormData({...formData, correo: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Estado Civil
                            </label>
                            <select
                              value={formData.estado_civil}
                              onChange={(e) => setFormData({...formData, estado_civil: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            >
                              <option value="">Seleccionar</option>
                              {estadosCiviles.map(ec => (
                                <option key={ec} value={ec}>{ec}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="col-span-2">
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Dirección
                            </label>
                            <textarea
                              value={formData.direccion}
                              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                              rows="2"
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Estado
                            </label>
                            <input
                              type="text"
                              value={formData.estado}
                              onChange={(e) => setFormData({...formData, estado: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Municipio
                            </label>
                            <input
                              type="text"
                              value={formData.municipio}
                              onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Parroquia
                            </label>
                            <input
                              type="text"
                              value={formData.parroquia}
                              onChange={(e) => setFormData({...formData, parroquia: e.target.value})}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                            />
                          </div>
                          
                          {/* Datos de Usuario */}
                          <div className="col-span-2 mt-4">
                            <h3 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              Datos de Acceso
                            </h3>
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
                              value={formData.estatus}
                              onChange={(e) => setFormData({...formData, estatus: e.target.value})}
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
                          
                          {modalMode === "create" && (
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Contraseña *
                              </label>
                              <input
                                type="password"
                                value={formData.clave}
                                onChange={(e) => setFormData({...formData, clave: e.target.value})}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                  darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-200'
                                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                                placeholder="Mínimo 6 caracteres"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {modalMode === "view" && selectedUser && (
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#264653] to-[#2A9D8F] flex items-center justify-center text-white text-3xl font-bold">
                            {selectedUser.nombre_completo?.charAt(0) || 'U'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre Completo</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedUser.nombre_completo}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cédula</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedUser.cedula_usuario}
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
                              {selectedUser.telefono || "No registrado"}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rol</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {selectedUser.rol === 'emprendedor' ? 'Emprendedor' : selectedUser.rol}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado</label>
                            <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadge(selectedUser.estatus)}`}>
                              {getEstadoTexto(selectedUser.estatus)}
                            </span>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha Registro</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {formatDate(selectedUser.created_at)}
                            </p>
                          </div>
                          <div>
                            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Último Acceso</label>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {formatDateTime(selectedUser.ultimo_acceso)}
                            </p>
                          </div>
                          {selectedUser.persona && (
                            <>
                              <div>
                                <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha Nacimiento</label>
                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {formatDate(selectedUser.persona.fecha_nacimiento)}
                                </p>
                              </div>
                              <div>
                                <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado Civil</label>
                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {selectedUser.persona.estado_civil || "No especificado"}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dirección</label>
                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {selectedUser.persona.direccion || "No registrada"}
                                </p>
                              </div>
                            </>
                          )}
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
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-[#2A9D8F] text-white hover:bg-[#264653] disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading && <Loader2 size={18} className="animate-spin" />}
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
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>
    </div>
  );
};

export default Usuario;