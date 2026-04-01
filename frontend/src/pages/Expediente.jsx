import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Grid, 
  List,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Star,
  Edit,
  MessageCircle,
  Upload,
  CheckCircle,
  ClipboardCheck,
  Handshake,
  CreditCard,
  FileSignature,
  Users,
  FileText,
  Building,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Download,
  Printer,
  Filter,
  ArrowUpDown,
  MoreVertical,
  X,
  Save,
  FolderPlus,
  User,
  Tag,
  Calendar as CalendarIcon,
  AlertTriangle,
  FileCheck,
  UserCheck as UserCheckIcon,
  ListChecks,
  Camera,
  Image,
  Trash2,
  Check,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  IdCard
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Expediente = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNewExpedienteModal, setShowNewExpedienteModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nuevo expediente de emprendedor pendiente", time: "5 min", read: false },
    { id: 2, text: "Inspección de emprendimiento programada", time: "1 hora", read: false },
    { id: 3, text: "Solicitud de crédito en revisión", time: "3 horas", read: true },
    { id: 4, text: "Contrato listo para firma", time: "1 día", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Estado para el nuevo expediente
  const [newExpediente, setNewExpediente] = useState({
    codigo: "",
    fecha: new Date().toISOString().split('T')[0],
    estado: "Revisión",
    inspector: "",
    emprendedor: null,
    documentosCapturados: []
  });

  // Estado para búsqueda de emprendedor
  const [searchEmprendedorTerm, setSearchEmprendedorTerm] = useState("");
  const [showEmprendedorResults, setShowEmprendedorResults] = useState(false);
  const [selectedEmprendedor, setSelectedEmprendedor] = useState(null);
  
  // Estado para captura de documentos
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [currentRequisito, setCurrentRequisito] = useState(null);
  const [capturedImages, setCapturedImages] = useState({});
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Estados para la DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    estado: '',
    prioridad: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Datos de ejemplo para los expedientes
  const [expedientes, setExpedientes] = useState([
    {
      id: 1,
      codigo: "EXP-2024-001",
      nombre: "María González",
      tipo: "Nuevo Emprendimiento",
      fecha: "2024-03-12",
      estado: "Pendiente",
      prioridad: "Alta",
      monto: "$25,000",
      inspector: "Ing. Martínez",
      documentos: 8,
      ultimaActualizacion: "2024-03-12"
    },
    // ... más datos
  ]);

  // Datos de emprendedores registrados
  const [emprendedoresRegistrados, setEmprendedoresRegistrados] = useState([
    {
      id: 1,
      nombre: "María González Pérez",
      cedula: "V-12345678",
      telefono: "0412-1234567",
      email: "maria.gonzalez@email.com",
      direccion: "Av. Principal, Edif. Central, Caracas",
      emprendimiento: "Restaurante El Sazón",
      rif: "J-123456789",
      status: "Activo"
    },
    {
      id: 2,
      nombre: "Juan Pérez Rodríguez",
      cedula: "V-87654321",
      telefono: "0416-7654321",
      email: "juan.perez@email.com",
      direccion: "Calle 5, Qta. Rosa, Maracaibo",
      emprendimiento: "Taller Mecánico Rápido",
      rif: "J-987654321",
      status: "Activo"
    },
    {
      id: 3,
      nombre: "Carlos Rodríguez Silva",
      cedula: "V-11223344",
      telefono: "0424-1122334",
      email: "carlos.rodriguez@email.com",
      direccion: "Av. Libertador, Centro Comercial, Valencia",
      emprendimiento: "Tienda de Ropa Moda",
      rif: "J-456789123",
      status: "Activo"
    },
    {
      id: 4,
      nombre: "Ana Martínez López",
      cedula: "V-55667788",
      telefono: "0412-5566778",
      email: "ana.martinez@email.com",
      direccion: "Calle Real, Casa 23, Barquisimeto",
      emprendimiento: "Distribuidora de Alimentos",
      rif: "J-789123456",
      status: "Activo"
    },
    {
      id: 5,
      nombre: "Luis Torres Méndez",
      cedula: "V-99887766",
      telefono: "0416-9988776",
      email: "luis.torres@email.com",
      direccion: "Av. Universidad, Edif. Central, Maracay",
      emprendimiento: "Servicios de Tecnología",
      rif: "J-321654987",
      status: "Activo"
    }
  ]);

  // Lista de inspectores disponibles
  const inspectores = [
    "Ing. Martínez",
    "Ing. López",
    "Ing. García",
    "Ing. Pérez",
    "Ing. Sánchez",
    "Ing. Ramírez",
    "Ing. Díaz",
    "Ing. Torres"
  ];

  // Requisitos según tipo de trámite
  const requisitosLista = [
    { id: 1, nombre: "Cédula de identidad (frente)", tipo: "documento", requerido: true },
    { id: 2, nombre: "Cédula de identidad (respaldo)", tipo: "documento", requerido: true },
    { id: 3, nombre: "Registro Único de Información Fiscal (RIF)", tipo: "documento", requerido: true },
    { id: 4, nombre: "Plan de negocio", tipo: "documento", requerido: true },
    { id: 5, nombre: "Estado de cuenta bancario", tipo: "documento", requerido: false },
    { id: 6, nombre: "Fotos del local comercial", tipo: "foto", requerido: true },
    { id: 7, nombre: "Fotos de equipos/maquinaria", tipo: "foto", requerido: false },
    { id: 8, nombre: "Permiso de uso de suelo", tipo: "documento", requerido: false },
    { id: 9, nombre: "Licencia de actividades económicas", tipo: "documento", requerido: true },
    { id: 10, nombre: "Fachada del negocio", tipo: "foto", requerido: true }
  ];

  // Función para generar código de expediente auto-incrementable
  const generarCodigoExpediente = () => {
    const año = new Date().getFullYear();
    const expedientesAño = expedientes.filter(e => e.codigo.includes(año.toString()));
    const nuevoNumero = expedientesAño.length + 1;
    return `EXP-${año}-${String(nuevoNumero).padStart(4, '0')}`;
  };

  // Filtrar emprendedores por búsqueda
  const filteredEmprendedores = emprendedoresRegistrados.filter(emp => 
    emp.nombre.toLowerCase().includes(searchEmprendedorTerm.toLowerCase()) ||
    emp.cedula.toLowerCase().includes(searchEmprendedorTerm.toLowerCase()) ||
    emp.emprendimiento.toLowerCase().includes(searchEmprendedorTerm.toLowerCase())
  );

  // Seleccionar emprendedor
  const handleSelectEmprendedor = (emprendedor) => {
    setSelectedEmprendedor(emprendedor);
    setSearchEmprendedorTerm(emprendedor.nombre);
    setShowEmprendedorResults(false);
  };

  // Limpiar selección de emprendedor
  const handleClearEmprendedor = () => {
    setSelectedEmprendedor(null);
    setSearchEmprendedorTerm("");
  };

  // Iniciar cámara
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capturar foto desde cámara
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir a base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Guardar imagen
      handleSaveImage(imageData);
    }
  };

  // Manejar carga de archivo desde computadora
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSaveImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar imagen capturada
  const handleSaveImage = (imageData) => {
    const newImage = {
      id: Date.now(),
      requisitoId: currentRequisito.id,
      requisitoNombre: currentRequisito.nombre,
      imageData: imageData,
      timestamp: new Date().toISOString()
    };
    
    setCapturedImages(prev => ({
      ...prev,
      [currentRequisito.id]: [...(prev[currentRequisito.id] || []), newImage]
    }));
    
    setShowCameraModal(false);
    stopCamera();
  };

  // Eliminar imagen
  const handleDeleteImage = (requisitoId, imageId) => {
    setCapturedImages(prev => ({
      ...prev,
      [requisitoId]: prev[requisitoId].filter(img => img.id !== imageId)
    }));
  };

  // Abrir modal de cámara para un requisito
  const handleOpenCamera = (requisito) => {
    setCurrentRequisito(requisito);
    setShowCameraModal(true);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // Cerrar modal de cámara
  const handleCloseCamera = () => {
    setShowCameraModal(false);
    stopCamera();
    setCurrentRequisito(null);
  };

  // Abrir modal de nuevo expediente
  const handleOpenNewExpedienteModal = () => {
    setNewExpediente({
      codigo: generarCodigoExpediente(),
      fecha: new Date().toISOString().split('T')[0],
      estado: "Revisión",
      inspector: "",
      emprendedor: null,
      documentosCapturados: []
    });
    setSelectedEmprendedor(null);
    setSearchEmprendedorTerm("");
    setCapturedImages({});
    setShowNewExpedienteModal(true);
  };

  // Guardar nuevo expediente
  const handleSaveNewExpediente = () => {
    // Validaciones
    if (!selectedEmprendedor) {
      alert("Por favor, seleccione un emprendedor registrado");
      return;
    }
    if (!newExpediente.inspector) {
      alert("Por favor, seleccione un inspector");
      return;
    }
    
    // Verificar requisitos requeridos
    const requisitosRequeridos = requisitosLista.filter(r => r.requerido);
    const requisitosFaltantes = requisitosRequeridos.filter(r => 
      !capturedImages[r.id] || capturedImages[r.id].length === 0
    );
    
    if (requisitosFaltantes.length > 0) {
      alert(`Por favor, capture los siguientes documentos requeridos:\n${requisitosFaltantes.map(r => r.nombre).join('\n')}`);
      return;
    }
    
    // Contar total de documentos capturados
    const totalDocumentos = Object.values(capturedImages).reduce((total, arr) => total + arr.length, 0);
    
    // Crear nuevo expediente
    const nuevoExpediente = {
      id: expedientes.length + 1,
      codigo: newExpediente.codigo,
      nombre: selectedEmprendedor.nombre,
      tipo: "Nuevo Expediente",
      fecha: newExpediente.fecha,
      estado: newExpediente.estado,
      prioridad: "Media",
      monto: "$0",
      inspector: newExpediente.inspector,
      documentos: totalDocumentos,
      ultimaActualizacion: new Date().toISOString().split('T')[0],
      emprendedorId: selectedEmprendedor.id,
      documentosCapturados: capturedImages
    };

    setExpedientes([nuevoExpediente, ...expedientes]);
    setShowNewExpedienteModal(false);
    
    // Mostrar notificación de éxito
    const nuevaNotificacion = {
      id: notifications.length + 1,
      text: `Nuevo expediente creado: ${newExpediente.codigo} - ${selectedEmprendedor.nombre}`,
      time: "Ahora",
      read: false
    };
    setNotifications([nuevaNotificacion, ...notifications]);
    
    alert(`Expediente ${newExpediente.codigo} creado exitosamente con ${totalDocumentos} documentos adjuntos`);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowNewExpedienteModal(false);
    stopCamera();
  };

  // ... (resto del código existente para la DataTable, filtros, etc.)

  // Datos del usuario
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

  // Datos específicos por sección (mantener igual)
  const sectionData = {
    overview: {
      title: "Gestión de Expedientes",
      description: "Resumen general de los expedientes archivados en el IADEY",
      stats: [
        { id: 1, title: "Expedientes Activos", value: "156", change: "+12", icon: Briefcase, color: "blue", bgColor: "bg-blue-50", textColor: "text-blue-600" },
        { id: 2, title: "Inspecciones Pendientes", value: "23", change: "+5", icon: ClipboardCheck, color: "orange", bgColor: "bg-orange-50", textColor: "text-orange-600" },
        { id: 3, title: "Solicitudes Crédito", value: "45", change: "+8", icon: Handshake, color: "green", bgColor: "bg-green-50", textColor: "text-green-600" },
        { id: 4, title: "Contratos Activos", value: "89", change: "+15", icon: FileSignature, color: "purple", bgColor: "bg-purple-50", textColor: "text-purple-600" },
      ],
      pendingItems: [
        { id: 1, name: "María González", type: "Nuevo expediente", date: "2024-03-12", status: "Pendiente", priority: "Alta" },
        { id: 2, name: "Juan Pérez", type: "Actualización documentos", date: "2024-03-11", status: "En proceso", priority: "Media" },
        { id: 3, name: "Carlos Rodríguez", type: "Revisión inicial", date: "2024-03-10", status: "Pendiente", priority: "Alta" },
      ],
      actionButton: "Nuevo Registro",
      pendingTitle: "Actividad Reciente"
    },
    // ... resto de sectionData
  };

  // Obtener datos según la pestaña activa
  const getCurrentSectionData = () => {
    if (activeTab.startsWith("settings-")) {
      return settingsData;
    }
    if (sectionData[activeTab]) {
      return sectionData[activeTab];
    }
    return sectionData.overview;
  };

  const currentData = getCurrentSectionData();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Funciones de filtrado y ordenamiento (mantener igual)
  const filteredExpedientes = expedientes.filter(exp => {
    const matchesSearch = searchTerm === '' || 
      Object.values(exp).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const sortedExpedientes = [...filteredExpedientes].sort((a, b) => {
    if (sortConfig.key) {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedExpedientes.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedExpedientes = sortedExpedientes.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedExpedientes.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedExpedientes.map(exp => exp.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleViewExpediente = (id) => {
    console.log('Ver expediente:', id);
  };

  const handleEditExpediente = (id) => {
    console.log('Editar expediente:', id);
  };

  const handleDownloadExpediente = (id) => {
    console.log('Descargar expediente:', id);
  };

  const handleOpenInspectionForm = () => {
    navigate('/inspecciones-realizadas');
  };

  const resetFilters = () => {
    setFilters({
      tipo: '',
      estado: '',
      prioridad: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'Alta': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Media': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Baja': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return styles[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'En Proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Completado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Revisión': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Documentación Pendiente': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Programado': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Aprobado': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

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

  // Configuración para submenús
  const settingsData = {
    title: "Configuración del Sistema",
    description: "Administración de usuarios, emprendimientos y parámetros",
    stats: [
      { id: 1, title: "Usuarios Activos", value: "24", icon: Users, color: "blue" },
      { id: 2, title: "Emprendimientos Registrados", value: "156", icon: Building, color: "green" },
      { id: 3, title: "Parámetros Configurados", value: "89", icon: FileText, color: "purple" },
    ],
    pendingItems: [],
    actionButton: "Nueva Configuración",
    pendingTitle: "Configuraciones Recientes"
  };

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
                {currentData?.title || "Panel de Control"}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentData?.description || "Bienvenido al sistema IADEY"}
              </p>
            </div>

            {/* Barra de búsqueda y acciones */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar expedientes..."
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
                  onClick={handleOpenNewExpedienteModal}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  {currentData?.actionButton || "Nuevo Registro"}
                </button>
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <select
                    value={filters.tipo}
                    onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Nuevo Emprendimiento">Nuevo Emprendimiento</option>
                    <option value="Ampliación">Ampliación</option>
                    <option value="Renovación">Renovación</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Inspección">Inspección</option>
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
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Revisión">Revisión</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>

                  <select
                    value={filters.prioridad}
                    onChange={(e) => setFilters({...filters, prioridad: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todas las prioridades</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
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

            {/* DataTable de Expedientes */}
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
                          checked={selectedRows.length === paginatedExpedientes.length && paginatedExpedientes.length > 0}
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
                          onClick={() => handleSort('nombre')}>
                        <div className="flex items-center gap-2">
                          Emprendedor
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('tipo')}>
                        <div className="flex items-center gap-2">
                          Tipo
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('fecha')}>
                        <div className="flex items-center gap-2">
                          Fecha
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('monto')}>
                        <div className="flex items-center gap-2">
                          Monto
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inspector
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documentos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {paginatedExpedientes.map((expediente) => (
                      <tr key={expediente.id} className={`${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(expediente.id)}
                            onChange={() => handleSelectRow(expediente.id)}
                            className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {expediente.codigo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {expediente.nombre}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {expediente.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(expediente.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(expediente.estado)}`}>
                            {expediente.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(expediente.prioridad)}`}>
                            {expediente.prioridad}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {expediente.monto}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {expediente.inspector}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {expediente.documentos}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewExpediente(expediente.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Ver detalles"
                            >
                              <Eye size={18} className="text-[#2A9D8F]" />
                            </button>
                            <button
                              onClick={() => handleEditExpediente(expediente.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Editar"
                            >
                              <Edit size={18} className="text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDownloadExpediente(expediente.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Descargar"
                            >
                              <Download size={18} className="text-purple-500" />
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
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedExpedientes.length)} de {sortedExpedientes.length}
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
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* Modal para Nuevo Expediente */}
      {showNewExpedienteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header del modal */}
            <div className={`sticky top-0 flex justify-between items-center p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <FolderPlus size={28} className="text-[#2A9D8F]" />
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Nuevo Registro de Expediente
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Seleccione un emprendedor registrado y capture los documentos
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X size={24} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            {/* Body del modal - Formulario */}
            <div className="p-6">
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Información del Expediente */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <FileText size={20} className="text-[#2A9D8F]" />
                    Información del Expediente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Código de Expediente
                      </label>
                      <input
                        type="text"
                        value={newExpediente.codigo}
                        className={`w-full px-3 py-2 rounded-lg border bg-gray-100 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Fecha de Registro
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          value={newExpediente.fecha}
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-100 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Estado
                      </label>
                      <div className="relative">
                        <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value="Revisión"
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-100 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Inspector Asignado *
                      </label>
                      <select
                        value={newExpediente.inspector}
                        onChange={(e) => setNewExpediente({...newExpediente, inspector: e.target.value})}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                      >
                        <option value="">Seleccione un inspector</option>
                        {inspectores.map(inspector => (
                          <option key={inspector} value={inspector}>{inspector}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Buscar Emprendedor */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <UserCheck size={20} className="text-[#2A9D8F]" />
                    Emprendedor Registrado *
                  </h3>
                  
                  {!selectedEmprendedor ? (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Buscar por nombre, cédula o emprendimiento..."
                          value={searchEmprendedorTerm}
                          onChange={(e) => {
                            setSearchEmprendedorTerm(e.target.value);
                            setShowEmprendedorResults(true);
                          }}
                          onFocus={() => setShowEmprendedorResults(true)}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                      
                      {showEmprendedorResults && filteredEmprendedores.length > 0 && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-64 overflow-y-auto ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                          {filteredEmprendedores.map(emp => (
                            <div
                              key={emp.id}
                              onClick={() => handleSelectEmprendedor(emp)}
                              className={`p-3 cursor-pointer transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-600 border-b border-gray-600' 
                                  : 'hover:bg-gray-50 border-b border-gray-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {emp.nombre}
                                  </p>
                                  <div className="flex gap-3 text-sm mt-1">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                      <IdCard size={14} className="inline mr-1" />
                                      {emp.cedula}
                                    </span>
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                      <Briefcase size={14} className="inline mr-1" />
                                      {emp.emprendimiento}
                                    </span>
                                  </div>
                                </div>
                                <UserCheck size={18} className="text-[#2A9D8F]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={20} className="text-green-500" />
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              Emprendedor Seleccionado
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Nombre:</span>
                              <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {selectedEmprendedor.nombre}
                              </span>
                            </div>
                            <div>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Cédula:</span>
                              <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {selectedEmprendedor.cedula}
                              </span>
                            </div>
                            <div>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Teléfono:</span>
                              <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {selectedEmprendedor.telefono}
                              </span>
                            </div>
                            <div>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Email:</span>
                              <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {selectedEmprendedor.email}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Emprendimiento:</span>
                              <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {selectedEmprendedor.emprendimiento}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Dirección:</span>
                              <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {selectedEmprendedor.direccion}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleClearEmprendedor}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Requisitos y Captura de Documentos */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Camera size={20} className="text-[#2A9D8F]" />
                    Documentos Requeridos
                  </h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    * Documentos marcados como requeridos son obligatorios. Puede tomar foto desde la cámara o subir desde su computadora.
                  </p>
                  
                  <div className="space-y-4">
                    {requisitosLista.map((requisito) => {
                      const imagenes = capturedImages[requisito.id] || [];
                      const tieneImagenes = imagenes.length > 0;
                      
                      return (
                        <div key={requisito.id} className={`p-4 rounded-lg border ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        } ${requisito.requerido && !tieneImagenes ? 'border-yellow-500' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {requisito.requerido && (
                                  <span className="text-red-500 text-sm font-bold">*</span>
                                )}
                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {requisito.nombre}
                                </span>
                                {tieneImagenes && (
                                  <span className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded-full">
                                    {imagenes.length} documento(s) adjunto(s)
                                  </span>
                                )}
                                {requisito.requerido && !tieneImagenes && (
                                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                              
                              {/* Mostrar imágenes capturadas */}
                              {tieneImagenes && (
                                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                  {imagenes.map((img) => (
                                    <div key={img.id} className="relative group">
                                      <img
                                        src={img.imageData}
                                        alt={requisito.nombre}
                                        className="w-20 h-20 object-cover rounded-lg border"
                                      />
                                      <button
                                        onClick={() => handleDeleteImage(requisito.id, img.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <button
                                type="button"
                                onClick={() => handleOpenCamera(requisito)}
                                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                  darkMode 
                                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <Camera size={18} />
                                <span className="hidden sm:inline">Tomar Foto</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentRequisito(requisito);
                                  fileInputRef.current?.click();
                                }}
                                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                  darkMode 
                                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <Upload size={18} />
                                <span className="hidden sm:inline">Subir Archivo</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </form>
            </div>

            {/* Footer del modal */}
            <div className={`sticky bottom-0 flex justify-end gap-3 p-6 border-t ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewExpediente}
                className="px-6 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Guardar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cámara */}
      {showCameraModal && currentRequisito && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="bg-black rounded-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">
                Capturar: {currentRequisito.nombre}
              </h3>
              <button
                onClick={handleCloseCamera}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: "50vh" }}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="flex gap-4 mt-4">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653] transition-colors flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  Capturar Foto
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    handleCloseCamera();
                  }}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Subir desde PC
                </button>
              </div>
              
              <p className="text-gray-400 text-sm text-center mt-4">
                Asegúrese de que el documento sea legible y esté bien iluminado
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes auxiliares
const SectionStatCard = ({ stat, darkMode }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      yellow: "bg-yellow-50 text-yellow-600",
      red: "bg-red-50 text-red-600",
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600",
      cyan: "bg-cyan-50 text-cyan-600"
    };
    return colors[color] || colors.blue;
  };

  const Icon = stat.icon;
  
  return (
    <div className={`p-6 rounded-xl ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getColorClasses(stat.color).split(' ')[0]}`}>
          <Icon className={getColorClasses(stat.color).split(' ')[1]} size={24} />
        </div>
      </div>
      <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        {stat.value}
      </h3>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {stat.title}
      </p>
    </div>
  );
};

const PendingItem = ({ item, darkMode }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Pendiente': 'bg-yellow-500',
      'En proceso': 'bg-blue-500',
      'Completado': 'bg-green-500',
      'Urgente': 'bg-red-500',
      'Programada': 'bg-purple-500',
      'Vencido': 'bg-red-500',
      'Activo': 'bg-green-500',
      'Por renovar': 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className={`p-4 rounded-lg border ${
      darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
    } transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {item.name}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(item).map(([key, value]) => {
              if (key !== 'id' && key !== 'name' && key !== 'status') {
                return (
                  <div key={key}>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {key}: 
                    </span>
                    <span className={`ml-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {value}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        <button className="text-[#2A9D8F] hover:text-[#264653] text-sm">
          Ver detalles
        </button>
      </div>
    </div>
  );
};

export default Expediente;