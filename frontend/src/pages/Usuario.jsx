// pages/Usuario.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Edit,
  Eye,
  EyeOff,
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
  Loader2,
  Home,
  Hash,
  User
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
  
  // Estados para validaciones y UI
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Datos del backend
  const [usuarios, setUsuarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  
  // Dominios de correo
  const dominiosCorreo = [
    "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
    "yahoo.es", "outlook.es", "hotmail.es", "gmail.com.ve",
    "cantv.net", "movistar.com.ve", "digitel.com.ve", "iadey.gob.ve"
  ];

  // Datos geográficos de Yaracuy
  const municipiosYaracuy = [
    "Aristides Bastidas", "Bolívar", "Bruzual", "Cocorote",
    "Independencia", "José Antonio Páez", "La Trinidad", "Manuel Monge",
    "Nirgua", "Peña", "San Felipe", "Sucre", "Urachiche", "Veroes",
  ];

  const parroquiasPorMunicipio = {
    "Aristides Bastidas": ["San Pablo"],
    Bolívar: ["Aroa"],
    Bruzual: ["Chivacoa", "Campo Elías"],
    Cocorote: ["Cocorote"],
    Independencia: ["Independencia"],
    "José Antonio Páez": ["Sabana de Parra"],
    "La Trinidad": ["Boraure"],
    "Manuel Monge": ["Yumare"],
    Nirgua: ["Nirgua", "Salom", "Temerla"],
    Peña: ["Yaritagua", "San Andrés"],
    "San Felipe": ["San Felipe", "Albarico", "San Javier"],
    Sucre: ["Sucre"],
    Urachiche: ["Urachiche"],
    Veroes: ["Farriar", "El Farrial"],
  };

  // Formulario de usuario (combinado persona + usuario)
  const [formData, setFormData] = useState({
    // Datos de persona
    nacionalidad: "V",
    cedula: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    telefono: "",
    correo_local: "",
    correo_dominio: "",
    correo: "",
    estado_civil: "",
    direccion: "",
    estado: "Yaracuy",
    municipio: "",
    parroquia: "",
    tipo_persona: "usuario_sistema",
    // Datos de usuario
    clave: "",
    confirmPassword: "",
    rol: "",
    estatus: "activo",
    aceptaTerminos: false,
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

  // ============================================================================
  // UTILIDADES DE FORMATEO
  // ============================================================================
  
  const limpiarErrorCampo = (nombreCampo) => {
    if (fieldErrors[nombreCampo]) {
      setFieldErrors((prev) => ({
        ...prev,
        [nombreCampo]: null,
      }));
    }
    if (error) {
      setError("");
    }
  };
  
  const limpiarErroresPaso = () => {
    setFieldErrors({});
    setError("");
  };

  const capitalizeWhileTyping = (text) => {
    if (!text) return text;
    const words = text.split(" ");
    const processedWords = words.map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return processedWords.join(" ");
  };

  const formatearTelefono = (valor) => {
    let soloNumeros = valor.replace(/[^\d]/g, "");
    soloNumeros = soloNumeros.slice(0, 11);
    
    if (soloNumeros.length <= 4) {
      return soloNumeros;
    } else {
      return `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`;
    }
  };

  const capitalizeText = (text) => {
    if (!text) return text;
    return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  };

  // ============================================================================
  // VALIDACIONES AVANZADAS
  // ============================================================================
  
  const validarCedulaVenezolana = (cedula, nacionalidad) => {
    if (!cedula) return null;
    
    if (nacionalidad === "V") {
      const soloNumeros = cedula.replace(/[^\d]/g, "");
      
      if (soloNumeros.length < 6 || soloNumeros.length > 8) {
        return "La cédula venezolana debe tener entre 6 y 8 dígitos";
      }
      
      if (/^0+$/.test(soloNumeros)) {
        return "La cédula no puede ser solo ceros";
      }
      
      if (/^(\d)\1{5,}$/.test(soloNumeros)) {
        return "La cédula no puede tener dígitos repetitivos";
      }
    } else if (nacionalidad === "E") {
      const soloNumeros = cedula.replace(/[^\d]/g, "");
      
      if (soloNumeros.length < 4 || soloNumeros.length > 12) {
        return "La cédula de extranjero debe tener entre 4 y 12 dígitos";
      }
    }
    return null;
  };

  const validarNombreCompleto = (nombre, tipo) => {
    if (!nombre) return null;
    
    const trimmed = nombre.trim();
    
    if (trimmed.length < 2) {
      return `Los ${tipo} deben tener al menos 2 caracteres`;
    }
    
    if (trimmed.length > 50) {
      return `Los ${tipo} no deben exceder los 50 caracteres`;
    }
    
    const caracteresInvalidos = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/;
    if (caracteresInvalidos.test(trimmed)) {
      return `Los ${tipo} solo deben contener letras y espacios`;
    }
    
    if (/\s{2,}/.test(trimmed)) {
      return `Los ${tipo} no deben tener múltiples espacios consecutivos`;
    }
    
    return null;
  };

  const validarTelefono = (telefono) => {
    if (!telefono) return null;
    
    const cleaned = telefono.replace(/[\s\-\(\)]/g, "");
    
    if (!/^[\d+]+$/.test(cleaned)) {
      return "El teléfono solo debe contener números y el signo +";
    }
    
    const venezuelanPattern = /^(?:(?:0412|0414|0416|0424|0410|0426|0418|0420)\d{7})$/;
    const internationalPattern = /^\+58(?:412|414|416|424|410|426|418|420)\d{7}$/;
    const landlinePattern = /^(?:0212|0234|0235|0236|0237|0238|0239|0240|0241|0242|0243|0244|0245|0246|0247|0248|0249|0251|0252|0253|0254|0255|0256|0257|0258|0259|0261|0262|0263|0264|0265|0266|0267|0268|0269|0271|0272|0273|0274|0275|0276|0277|0278|0279|0281|0282|0283|0284|0285|0286|0287|0288|0289)\d{7}$/;
    
    if (!venezuelanPattern.test(cleaned) && !internationalPattern.test(cleaned) && !landlinePattern.test(cleaned)) {
      return "Ingresa un número de teléfono venezolano válido (Ej: 0412-1234567 o +584121234567)";
    }
    
    return null;
  };

  const validarCorreo = (correo, correo_local, correo_dominio) => {
    if (correo_local && correo_local.includes("@")) {
      return "No incluyas @dominio en el nombre de usuario. Selecciona el dominio en la lista desplegable.";
    }
    
    if (!correo_local && !correo) {
      return null;
    }
    
    if (correo && !correo_local && !correo_dominio) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(correo)) {
        return "Ingresa un correo electrónico válido";
      }
      return null;
    }
    
    if (!correo_local) {
      return "Ingresa la parte local del correo (antes del @)";
    }
    
    if (!correo_dominio) {
      return "Selecciona un dominio para tu correo";
    }
    
    if (correo_local.length < 3) {
      return "El nombre de usuario debe tener al menos 3 caracteres";
    }
    
    if (correo_local.length > 64) {
      return "El nombre de usuario es muy largo (máximo 64 caracteres)";
    }
    
    if (/^[._]|[._]$/.test(correo_local)) {
      return "El nombre de usuario no puede empezar o terminar con puntos o guiones";
    }
    
    if (/[._]{2,}/.test(correo_local)) {
      return "No se permiten puntos o guiones consecutivos";
    }
    
    if (!correo) {
      return "El correo no se ha generado correctamente";
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(correo)) {
      return "El correo generado no es válido";
    }
    
    return null;
  };

  const validarFechaNacimiento = (fecha) => {
    if (!fecha) return null;
    
    const fechaNac = new Date(fecha);
    const hoy = new Date();
    const fechaMinima = new Date("1930-01-01");
    
    if (isNaN(fechaNac.getTime())) {
      return "Fecha de nacimiento inválida";
    }
    
    if (fechaNac > hoy) {
      return "La fecha de nacimiento no puede ser futura";
    }
    
    if (fechaNac < fechaMinima) {
      return "Fecha de nacimiento demasiado antigua (anterior a 1930)";
    }
    
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    const dia = hoy.getDate() - fechaNac.getDate();
    
    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }
    
    if (edad < 18) {
      return "Debes ser mayor de 18 años para registrarte";
    }
    
    if (edad > 100) {
      return "Si eres mayor de 100 años, por favor contacta con soporte";
    }
    
    return null;
  };

  const validarDireccion = (direccion) => {
    if (!direccion || direccion.trim() === "") {
      return null;
    }
    
    if (direccion.trim().length < 5) {
      return "La dirección es demasiado corta (mínimo 5 caracteres)";
    }
    
    return null;
  };

  const validarContrasena = (contrasena) => {
    if (!contrasena) {
      return "La contraseña es obligatoria";
    }
    
    if (contrasena.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    
    if (contrasena.length > 50) {
      return "La contraseña no debe exceder los 50 caracteres";
    }
    
    if (!/[A-Z]/.test(contrasena)) {
      return "La contraseña debe contener al menos una letra mayúscula";
    }
    
    if (!/[a-z]/.test(contrasena)) {
      return "La contraseña debe contener al menos una letra minúscula";
    }
    
    if (!/[0-9]/.test(contrasena)) {
      return "La contraseña debe contener al menos un número";
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) {
      return "La contraseña debe contener al menos un carácter especial (!@#$%^&* etc.)";
    }
    
    return null;
  };

  const validarCampo = (name, value) => {
    let error = null;
    
    switch (name) {
      case "cedula":
        error = validarCedulaVenezolana(value, formData.nacionalidad);
        break;
      case "nombres":
        error = validarNombreCompleto(value, "nombres");
        break;
      case "apellidos":
        error = validarNombreCompleto(value, "apellidos");
        break;
      case "telefono":
        error = validarTelefono(value);
        break;
      case "correo":
        error = validarCorreo(value, formData.correo_local, formData.correo_dominio);
        break;
      case "fecha_nacimiento":
        error = validarFechaNacimiento(value);
        break;
      case "direccion":
        error = validarDireccion(value);
        break;
      case "clave":
        error = validarContrasena(value);
        break;
      case "confirmPassword":
        if (value !== formData.clave) {
          error = "Las contraseñas no coinciden";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const validarFormularioCompleto = () => {
    const errors = {};
    
    // Validar cédula
    if (!formData.cedula) {
      errors.cedula = "La cédula es obligatoria";
    } else {
      const cedulaError = validarCedulaVenezolana(formData.cedula, formData.nacionalidad);
      if (cedulaError) errors.cedula = cedulaError;
    }
    
    // Validar nombres
    if (!formData.nombres) {
      errors.nombres = "Los nombres son obligatorios";
    } else {
      const nombresError = validarNombreCompleto(formData.nombres, "nombres");
      if (nombresError) errors.nombres = nombresError;
    }
    
    // Validar apellidos
    if (!formData.apellidos) {
      errors.apellidos = "Los apellidos son obligatorios";
    } else {
      const apellidosError = validarNombreCompleto(formData.apellidos, "apellidos");
      if (apellidosError) errors.apellidos = apellidosError;
    }
    
    // Validar correo
    const correoError = validarCorreo(formData.correo, formData.correo_local, formData.correo_dominio);
    if (correoError) errors.correo = correoError;
    
    // Validar rol
    if (!formData.rol) {
      errors.rol = "Debes seleccionar un rol para el usuario";
    }
    
    // Validar contraseña solo en creación
    if (modalMode === "create") {
      if (!formData.clave) {
        errors.clave = "La contraseña es obligatoria";
      } else {
        const contrasenaError = validarContrasena(formData.clave);
        if (contrasenaError) errors.clave = contrasenaError;
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Debes confirmar la contraseña";
      } else if (formData.clave !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    
    // Validar municipio y parroquia
    if (formData.municipio && !formData.parroquia) {
      errors.parroquia = "Por favor selecciona una parroquia";
    }
    
    // Validaciones opcionales
    if (formData.telefono) {
      const telefonoError = validarTelefono(formData.telefono);
      if (telefonoError) errors.telefono = telefonoError;
    }
    
    if (formData.fecha_nacimiento) {
      const fechaError = validarFechaNacimiento(formData.fecha_nacimiento);
      if (fechaError) errors.fecha_nacimiento = fechaError;
    }
    
    if (formData.direccion) {
      const direccionError = validarDireccion(formData.direccion);
      if (direccionError) errors.direccion = direccionError;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // HANDLERS DEL FORMULARIO CON FORMATEO
  // ============================================================================
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type !== "checkbox") {
      limpiarErrorCampo(name);
    }
    
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    
    let nuevoValor = value;
    
    // Aplicar formateo según el campo
    if (name === "cedula") {
      nuevoValor = value.replace(/[^\d]/g, "");
    }
    
    if (name === "telefono") {
      nuevoValor = formatearTelefono(value);
    }
    
    if (name === "nombres" || name === "apellidos") {
      nuevoValor = capitalizeWhileTyping(value);
    }
    
    if (name === "correo_local") {
      nuevoValor = value.toLowerCase().replace(/[^a-z0-9._]/g, "");
      
      if (nuevoValor.includes("@")) {
        nuevoValor = nuevoValor.split("@")[0];
        setFieldErrors(prev => ({
          ...prev,
          correo: "No incluyas @dominio aquí. Selecciona el dominio en la lista desplegable."
        }));
      } else {
        if (fieldErrors.correo === "No incluyas @dominio aquí. Selecciona el dominio en la lista desplegable.") {
          limpiarErrorCampo("correo");
        }
      }
      
      const correoCompleto = nuevoValor && formData.correo_dominio
        ? `${nuevoValor}@${formData.correo_dominio}`
        : "";
      
      setFormData((prev) => ({
        ...prev,
        correo_local: nuevoValor,
        correo: correoCompleto,
      }));
      return;
    }
    
    if (name === "correo_dominio") {
      const correoCompleto = formData.correo_local && value
        ? `${formData.correo_local}@${value}`
        : "";
      
      setFormData((prev) => ({
        ...prev,
        correo_dominio: value,
        correo: correoCompleto,
      }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: nuevoValor }));
    
    if (name === "municipio") {
      setFormData((prev) => ({ ...prev, parroquia: "" }));
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Capitalizar nombres y apellidos al salir del campo
    if (name === "nombres" || name === "apellidos") {
      const capitalized = capitalizeText(value);
      if (capitalized !== value) {
        setFormData(prev => ({ ...prev, [name]: capitalized }));
      }
    }
    
    const error = validarCampo(name, value);
    
    if (error && value.trim() !== "") {
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Roles disponibles
  const roles = [
    { value: "Presidente", label: "Presidente(a)", descripcion: "Máxima autoridad del instituto" },
    { value: "Secretario", label: "Secretario(a)", descripcion: "Gestión administrativa y documental" },
    { value: "Inspector", label: "Inspector", descripcion: "Supervisión y fiscalización" },
    { value: "Analista de Credito", label: "Analista de Crédito", descripcion: "Evaluación y análisis de créditos" },
    { value: "Credito y Cobranza", label: "Crédito y Cobranza", descripcion: "Gestión de cobranzas y seguimiento de créditos" }
  ];

  // Estados civiles
  const estadosCiviles = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Unión Libre"];

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarUsuarios();
    setIsVisible(true);
  }, []);

  // Función para cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const usuariosResponse = await usuarioAPI.getAllUsuarios();
      
      if (usuariosResponse.success) {
        const usuariosConPersona = await Promise.all(
          usuariosResponse.data.map(async (usuario) => {
            try {
              const personaResponse = await personaAPI.getPersonaByCedula(usuario.cedula_usuario);
              if (personaResponse.success) {
                return {
                  ...usuario,
                  persona: personaResponse.data,
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
      presidentes: usuarios.filter(u => u.rol === "Presidente" || u.rol === "Presidente(a)").length,
      secretarios: usuarios.filter(u => u.rol === "Secretario" || u.rol === "Secretario(a)").length,
      inspectores: usuarios.filter(u => u.rol === "Inspector").length,
      analistas: usuarios.filter(u => u.rol === "Analista de Credito" || u.rol === "Analista de Crédito").length,
      cobranza: usuarios.filter(u => u.rol === "Credito y Cobranza" || u.rol === "Crédito y Cobranza").length,
      administradores: 0
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

  const totalPages = Math.ceil(sortedUsuarios.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsuarios = sortedUsuarios.slice(startIndex, startIndex + rowsPerPage);

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
    setFieldErrors({});
    
    // Extraer local y dominio del correo si es posible
    let correo_local = "";
    let correo_dominio = "";
    const email = user.persona?.correo || "";
    if (email && email.includes("@")) {
      const [local, dominio] = email.split("@");
      correo_local = local;
      correo_dominio = dominiosCorreo.includes(dominio) ? dominio : "";
    }
    
    setFormData({
      nacionalidad: user.persona?.nacionalidad || "V",
      cedula: user.cedula_usuario?.replace(/^[VE]-/, "") || "",
      nombres: user.persona?.nombres || "",
      apellidos: user.persona?.apellidos || "",
      fecha_nacimiento: user.persona?.fecha_nacimiento?.split('T')[0] || "",
      telefono: user.persona?.telefono || "",
      correo_local: correo_local,
      correo_dominio: correo_dominio,
      correo: email,
      estado_civil: user.persona?.estado_civil || "",
      direccion: user.persona?.direccion || "",
      estado: user.persona?.estado || "Yaracuy",
      municipio: user.persona?.municipio || "",
      parroquia: user.persona?.parroquia || "",
      tipo_persona: user.persona?.tipo_persona || "usuario_sistema",
      clave: "",
      confirmPassword: "",
      rol: user.rol,
      estatus: user.estatus,
      aceptaTerminos: false,
    });
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFieldErrors({});
    setFormData({
      nacionalidad: "V",
      cedula: "",
      nombres: "",
      apellidos: "",
      fecha_nacimiento: "",
      telefono: "",
      correo_local: "",
      correo_dominio: "",
      correo: "",
      estado_civil: "",
      direccion: "",
      estado: "Yaracuy",
      municipio: "",
      parroquia: "",
      tipo_persona: "usuario_sistema",
      clave: "",
      confirmPassword: "",
      rol: "",
      estatus: "activo", // Siempre activo al crear
      aceptaTerminos: false,
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
        await cargarUsuarios();
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
    if (!validarFormularioCompleto()) {
      setError("Por favor corrige los errores marcados en el formulario");
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const cedulaFormateada = `${formData.nacionalidad.toUpperCase()}-${formData.cedula}`;
      const correoFinal = formData.correo || (formData.correo_local && formData.correo_dominio ? `${formData.correo_local}@${formData.correo_dominio}` : "");
      
      if (modalMode === "create") {
        const personaData = {
          nacionalidad: formData.nacionalidad,
          cedula: cedulaFormateada,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          telefono: formData.telefono || null,
          correo: correoFinal,
          estado_civil: formData.estado_civil || null,
          direccion: formData.direccion || null,
          estado: formData.estado || null,
          municipio: formData.municipio || null,
          parroquia: formData.parroquia || null,
          tipo_persona: formData.tipo_persona,
        };
        
        const personaResponse = await personaAPI.createPersona(personaData);
        
        if (!personaResponse.success) {
          throw new Error(personaResponse.error || "Error al crear la persona");
        }
        
        const usuarioData = {
          cedula_usuario: cedulaFormateada,
          clave: formData.clave,
          rol: formData.rol,
          estatus: "activo" // Siempre activo para nuevos usuarios
        };
        
        const usuarioResponse = await usuarioAPI.createUsuario(usuarioData);
        
        if (!usuarioResponse.success) {
          throw new Error(usuarioResponse.error || "Error al crear el usuario");
        }
        
        setSuccessMessage(`Usuario ${formData.nombres} ${formData.apellidos} creado exitosamente`);
        await cargarUsuarios();
        
      } else if (modalMode === "edit" && selectedUser) {
        const personaData = {
          nacionalidad: formData.nacionalidad,
          cedula: cedulaFormateada,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          telefono: formData.telefono || null,
          correo: correoFinal,
          estado_civil: formData.estado_civil || null,
          direccion: formData.direccion || null,
          estado: formData.estado || null,
          municipio: formData.municipio || null,
          parroquia: formData.parroquia || null,
          tipo_persona: formData.tipo_persona,
        };
        
        await personaAPI.updatePersona(selectedUser.persona?.id, personaData);
        
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
        const tempPassword = Math.random().toString(36).slice(-8);
        const response = await usuarioAPI.updatePassword(selectedUser.id, tempPassword);
        
        if (response.success) {
          setSuccessMessage(`Contraseña restablecida. Nueva contraseña temporal: ${tempPassword}`);
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

  const getEstadoBadge = (estatus) => {
    const styles = {
      'activo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'inactivo': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'bloqueado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
      'Presidente': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Presidente(a)': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Secretario': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Secretario(a)': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Inspector': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Analista de Credito': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Analista de Crédito': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Credito y Cobranza': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Crédito y Cobranza': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Emprendedor': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
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

  const getPasswordValidation = (password) => ({
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const passwordValidations = getPasswordValidation(formData.clave);
  const allValidationsPassed = Object.values(passwordValidations).every(v => v === true);

  const hasError = (fieldName) => !!fieldErrors[fieldName];
  const getErrorMessage = (fieldName) => fieldErrors[fieldName];

  // ============================================================================
  // RENDERIZADO - MODAL FORMULARIO COMPLETO
  // ============================================================================
  
  const renderFormModal = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nacionalidad y Cédula */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Nacionalidad *
          </label>
          <select
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
          >
            <option value="V">Venezolano(a)</option>
            <option value="E">Extranjero(a)</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Cédula *
          </label>
          <div className="relative">
            <Hash size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
                hasError('cedula') ? 'border-red-500' : ''
              }`}
              placeholder="12345678"
            />
          </div>
          {hasError('cedula') && (
            <p className="text-xs text-red-500 mt-1">{getErrorMessage('cedula')}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Formato: {formData.nacionalidad}-{formData.cedula || "12345678"}
          </p>
        </div>
        
        {/* Nombres y Apellidos */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Nombres *
          </label>
          <input
            type="text"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
              hasError('nombres') ? 'border-red-500' : ''
            }`}
            placeholder="Tus nombres"
          />
          {hasError('nombres') && (
            <p className="text-xs text-red-500 mt-1">{getErrorMessage('nombres')}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Apellidos *
          </label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
              hasError('apellidos') ? 'border-red-500' : ''
            }`}
            placeholder="Tus apellidos"
          />
          {hasError('apellidos') && (
            <p className="text-xs text-red-500 mt-1">{getErrorMessage('apellidos')}</p>
          )}
        </div>
        
        {/* Fecha Nacimiento y Teléfono */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Fecha Nacimiento
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
                hasError('fecha_nacimiento') ? 'border-red-500' : ''
              }`}
            />
          </div>
          {hasError('fecha_nacimiento') && (
            <p className="text-xs text-red-500 mt-1">{getErrorMessage('fecha_nacimiento')}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Teléfono
          </label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
                hasError('telefono') ? 'border-red-500' : ''
              }`}
              placeholder="0412-1234567"
            />
          </div>
          {hasError('telefono') && (
            <p className="text-xs text-red-500 mt-1">{getErrorMessage('telefono')}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Formato: 0412-1234567</p>
        </div>
        
        {/* Correo Electrónico con dominio desplegable */}
        <div className="col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Correo Electrónico *
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="correo_local"
                value={formData.correo_local}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
                  hasError('correo') ? 'border-red-500' : ''
                }`}
                placeholder="usuario"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-bold text-lg">@</span>
              <select
                name="correo_dominio"
                value={formData.correo_dominio}
                onChange={handleChange}
                className={`flex-1 sm:w-48 px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
                  hasError('correo') ? 'border-red-500' : ''
                }`}
              >
                <option value="">Seleccionar dominio</option>
                {dominiosCorreo.map((dominio) => (
                  <option key={dominio} value={dominio}>{dominio}</option>
                ))}
              </select>
            </div>
          </div>
          
          {hasError('correo') && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {getErrorMessage('correo')}
            </p>
          )}
          
          {formData.correo && !hasError('correo') && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={14} />
                Tu correo será: <strong>{formData.correo}</strong>
              </p>
            </div>
          )}
        </div>
        
        {/* Estado Civil */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Estado Civil
          </label>
          <select
            name="estado_civil"
            value={formData.estado_civil}
            onChange={handleChange}
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
        
        {/* Municipio y Parroquia */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Municipio
          </label>
          <select
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
          >
            <option value="">Selecciona un municipio</option>
            {municipiosYaracuy.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Parroquia
          </label>
          <select
            name="parroquia"
            value={formData.parroquia}
            onChange={handleChange}
            disabled={!formData.municipio}
            className={`w-full px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50' 
                : 'bg-white border-gray-200 disabled:bg-gray-100'
            } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
              hasError('parroquia') ? 'border-red-500' : ''
            }`}
          >
            <option value="">Selecciona una parroquia</option>
            {formData.municipio && parroquiasPorMunicipio[formData.municipio]?.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {hasError('parroquia') && (
            <p className="text-xs text-red-500 mt-1">{getErrorMessage('parroquia')}</p>
          )}
        </div>
        
        {/* Dirección */}
        <div className="col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Dirección
          </label>
          <div className="relative">
            <Home size={18} className="absolute left-3 top-3 text-gray-400" />
            <textarea
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] resize-y ${
                hasError('direccion') ? 'border-red-500' : ''
              }`}
              placeholder="Ingresa tu dirección (opcional)"
            />
          </div>
          {hasError('direccion') && (
            <p className="text-xs text-red-500 mt-1">{getErrorMessage('direccion')}</p>
          )}
        </div>
        
        {/* Datos de Acceso */}
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
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
              hasError('rol') ? 'border-red-500' : ''
            }`}
          >
            <option value="">Seleccionar rol</option>
            {roles.map(rol => (
              <option key={rol.value} value={rol.value}>{rol.label}</option>
            ))}
          </select>
          {hasError('rol') && (
            <p className="text-xs text-red-500 mt-1">{getErrorMessage('rol')}</p>
          )}
        </div>
        
        {/* Estado - Visible solo en edición, informativo en creación */}
        {modalMode === "edit" && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Estado
            </label>
            <select
              name="estatus"
              value={formData.estatus}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>
        )}

        {modalMode === "create" && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Estado
            </label>
            <div className={`px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-green-400' 
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} />
                <span className="font-medium">Activo</span>
                <span className="text-xs opacity-75">(Los usuarios nuevos siempre se crean como activos)</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Contraseña - Solo en creación */}
        {modalMode === "create" && (
          <>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Contraseña *
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="clave"
                  value={formData.clave}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
                    hasError('clave') && !allValidationsPassed ? 'border-red-500' : ''
                  }`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Requisitos de contraseña */}
              {formData.clave && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.minLength ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                      {passwordValidations.minLength && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <span className={passwordValidations.minLength ? "text-green-600" : "text-gray-500"}>
                      🔒 Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasUpperCase ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                      {passwordValidations.hasUpperCase && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <span className={passwordValidations.hasUpperCase ? "text-green-600" : "text-gray-500"}>
                      🔠 Una mayúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasLowerCase ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                      {passwordValidations.hasLowerCase && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <span className={passwordValidations.hasLowerCase ? "text-green-600" : "text-gray-500"}>
                      🔡 Una minúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasNumber ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                      {passwordValidations.hasNumber && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <span className={passwordValidations.hasNumber ? "text-green-600" : "text-gray-500"}>
                      🔢 Un número
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasSpecialChar ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                      {passwordValidations.hasSpecialChar && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <span className={passwordValidations.hasSpecialChar ? "text-green-600" : "text-gray-500"}>
                      🔣 Un carácter especial (!@#$%^&* etc.)
                    </span>
                  </div>
                </div>
              )}
              
              {hasError('clave') && !allValidationsPassed && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {getErrorMessage('clave')}
                </p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] ${
                    hasError('confirmPassword') ? 'border-red-500' : ''
                  }`}
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {hasError('confirmPassword') && (
                <p className="text-xs text-red-500 mt-1">{getErrorMessage('confirmPassword')}</p>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mt-4">
        <p className={`text-sm flex items-start gap-2 ${darkMode ? 'text-blue-800' : 'text-blue-800'}`}>
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>
            {modalMode === "create" 
              ? "Los campos marcados con * son obligatorios. La contraseña debe cumplir con todos los requisitos de seguridad. El usuario se creará con estado Activo."
              : "Los campos marcados con * son obligatorios. Modifica solo los datos que necesites actualizar."}
          </span>
        </p>
      </div>
    </div>
  );

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

            {/* Modal de Usuario */}
            {modalOpen && (
              <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
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

                    {(modalMode === "create" || modalMode === "edit") && renderFormModal()}

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