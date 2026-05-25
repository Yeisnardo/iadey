// frontend/src/components/GestionExpedientes.jsx
import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  FileText,
  DollarSign,
  User,
  CheckCircle,
  Building,
  X,
  Check,
  FolderPlus,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import expedienteAPI from '../services/api_expediente';
import usuarioAPI from '../services/api_usuario';
import Swal from 'sweetalert2';

// 🎨 CONFIGURACIÓN DE COLORES POR ESTADO - Psicología del Color
const statusConfig = {
  // 🟡 AMARILLO/ÁMBAR - Atención, precaución, revisión necesaria
  'En revisión': {
    label: 'En revisión',
    icon: '🔍',
    color: 'amber',
    classes: {
      badge: 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-400/20',
      dot: 'bg-amber-500',
      border: 'border-l-amber-500',
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
    },
    description: 'Requiere atención y verificación'
  },
  
  // 🔵 AZUL - Confianza, progreso, actividad en curso
  'En proceso': {
    label: 'En proceso',
    icon: '🔄',
    color: 'sky',
    classes: {
      badge: 'bg-sky-100 text-sky-800 ring-1 ring-sky-600/20 dark:bg-sky-900/40 dark:text-sky-200 dark:ring-sky-400/20',
      dot: 'bg-sky-500',
      border: 'border-l-sky-500',
      hover: 'hover:bg-sky-50 dark:hover:bg-sky-900/20'
    },
    description: 'Activo y en desarrollo'
  },
  
  // 🟢 VERDE ESMERALDA - Éxito, finalización, equilibrio
  'Aprobado': {
    label: 'Aprobado',
    icon: '✅',
    color: 'emerald',
    classes: {
      badge: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-400/20',
      dot: 'bg-emerald-500',
      border: 'border-l-emerald-500',
      hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
    },
    description: 'Finalizado exitosamente'
  },
  
  // ⚪ GRIS/NEUTRO - Neutralidad, espera, inactivo
  'Pendiente': {
    label: 'Pendiente',
    icon: '⏳',
    color: 'slate',
    classes: {
      badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20',
      dot: 'bg-slate-500',
      border: 'border-l-slate-500',
      hover: 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
    },
    description: 'En espera de procesamiento'
  },
  
  // 🔴 ROJO - Alerta, error, rechazo
  'Rechazado': {
    label: 'Rechazado',
    icon: '❌',
    color: 'rose',
    classes: {
      badge: 'bg-rose-100 text-rose-800 ring-1 ring-rose-600/20 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-400/20',
      dot: 'bg-rose-500',
      border: 'border-l-rose-500',
      hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/20'
    },
    description: 'No aprobado o rechazado'
  },
  
  // 🟣 PÚRPURA/VIOLETA - Especial, premium, destacado
  'Prioritario': {
    label: 'Prioritario',
    icon: '⭐',
    color: 'violet',
    classes: {
      badge: 'bg-violet-100 text-violet-800 ring-1 ring-violet-600/20 dark:bg-violet-900/40 dark:text-violet-200 dark:ring-violet-400/20',
      dot: 'bg-violet-500',
      border: 'border-l-violet-500',
      hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/20'
    },
    description: 'Atención prioritaria'
  }
};

// Componente StatusBadge reutilizable
const StatusBadge = ({ status, showCode = true, code = '', size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig['Pendiente'];
  
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-6 py-2 text-base'
  };
  
  return (
    <div className="space-y-1">
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all ${sizeClasses[size]} ${config.classes.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.classes.dot} ${status === 'En proceso' ? 'animate-pulse' : ''}`}></span>
        <span className="text-xs">{config.icon}</span>
        {config.label}
      </span>
      {showCode && code && (
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {code}
        </p>
      )}
    </div>
  );
};

const GestionExpedientes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  
  // Estados para datos
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requisitos, setRequisitos] = useState([]);
  const [inspectores, setInspectores] = useState([]);
  const [nextNumber, setNextNumber] = useState(null);
  
  // Estados para el modal de creación de expediente
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    id_solicitud: '',
    id_usuario: '',
    id_requisitos: [],
    codigo_expediente: '',
    estatus: 'En revisión',
    observaciones: ''
  });
  
  // Estados para ver detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);
  
  // Estados para ver expediente
  const [showExpedienteModal, setShowExpedienteModal] = useState(false);
  const [expedienteDetalle, setExpedienteDetalle] = useState(null);
  
  // Estados para notificaciones y usuario
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Bienvenido al sistema de expedientes", time: "Ahora", read: false }
  ]);
  const [currentUser, setCurrentUser] = useState(null);

  // Configuración de SweetAlert2
  const swalConfig = {
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#e5e7eb' : '#1f2937',
    confirmButtonColor: '#2A9D8F',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'rounded-xl shadow-2xl',
      title: 'text-xl font-bold',
      htmlContainer: 'text-base',
      confirmButton: 'px-6 py-2 rounded-lg font-medium',
      cancelButton: 'px-6 py-2 rounded-lg font-medium',
    }
  };

  // Toast configuration
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const usuario = usuarioAPI.getCurrentUser();
      setCurrentUser(usuario);
      
      await Promise.all([
        cargarSolicitudesAprobadas(),
        cargarRequisitos(),
        cargarInspectores()
      ]);
      
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire({
        ...swalConfig,
        title: 'Error',
        text: `Error al cargar datos iniciales: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
      }).then((result) => {
        if (result.isConfirmed) {
          cargarDatosIniciales();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarSolicitudesAprobadas = async () => {
    try {
      const response = await expedienteAPI.getSolAprobadasExp();
      if (response.success) {
        setSolicitudesAprobadas(response.data);
        console.log(`✅ ${response.count} solicitudes aprobadas cargadas`);
        console.log("📊 Solicitudes con expediente:", response.data.filter(s => s.tiene_expediente).length);
      } else {
        console.error("Error:", response.error);
        Swal.fire({
          ...swalConfig,
          title: 'Error',
          text: response.error || 'Error al cargar solicitudes',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      Swal.fire({
        ...swalConfig,
        title: 'Error',
        text: 'Error al cargar solicitudes aprobadas',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  const cargarRequisitos = async () => {
    try {
      const response = await expedienteAPI.getRequisitos();
      if (response.success) {
        console.log("✅ Requisitos cargados:", response.data);
        setRequisitos(response.data);
      } else {
        console.error("Error cargando requisitos:", response.error);
        Swal.fire({
          ...swalConfig,
          title: 'Error',
          text: 'Error al cargar requisitos',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error("Error cargando requisitos:", error);
      Swal.fire({
        ...swalConfig,
        title: 'Error',
        text: 'Error al cargar requisitos',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  const cargarInspectores = async () => {
    try {
      const response = await usuarioAPI.getAllUsuarios();
      if (response.success) {
        const todosUsuarios = response.data;
        
        // Filtrar inspectores
        const inspectoresFiltrados = todosUsuarios.filter(
          usuario => {
            const rol = (usuario.rol || '').toLowerCase();
            return rol === 'inspector';
          }
        );
        
        // Formatear para asegurar que tengan los campos necesarios
        const inspectoresFormateados = inspectoresFiltrados.map(inspector => ({
          ...inspector,
          id: inspector.id,
          id_usuario: inspector.id,
          nombre_completo: inspector.nombre_completo || 
                          `${inspector.nombres || ''} ${inspector.apellidos || ''}`.trim() ||
                          `Inspector #${inspector.id}`,
          cedula_usuario: inspector.cedula_usuario || 'Sin cédula'
        }));
        
        setInspectores(inspectoresFormateados);
        console.log("✅ Inspectores cargados:", inspectoresFormateados);
        console.log("📋 IDs disponibles:", inspectoresFormateados.map(i => i.id));
        
        if (inspectoresFormateados.length === 0) {
          Swal.fire({
            ...swalConfig,
            title: '⚠️ Atención',
            text: 'No hay inspectores registrados en el sistema. Contacte al administrador.',
            icon: 'warning',
            confirmButtonText: 'Entendido',
          });
        }
      } else {
        console.error("Error cargando inspectores:", response.error);
        Swal.fire({
          ...swalConfig,
          title: 'Error',
          text: 'Error al cargar inspectores',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error("Error cargando inspectores:", error);
      Swal.fire({
        ...swalConfig,
        title: 'Error',
        text: 'Error al cargar inspectores',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  };

const generarCodigoExpediente = (solicitud, numeroAutoincrementable) => {
    const cedula = solicitud.cedula || '00000000';
    const año = new Date().getFullYear();
    const numero = String(numeroAutoincrementable).padStart(4, '0');
    return `EXP-${cedula}-${año}-${numero}`;
};

const handleAbrirModalExpediente = (solicitud) => {
    // Calcular el siguiente número basado en los expedientes existentes
    const expedientesExistentes = solicitudesAprobadas.filter(s => s.tiene_expediente).length;
    const numeroAutoincrementable = expedientesExistentes + 1;
    
    const codigo = generarCodigoExpediente(solicitud, numeroAutoincrementable);
    
    setSolicitudSeleccionada(solicitud);
    setFormData({
        id_solicitud: solicitud.id_solicitud,
        id_usuario: '',
        id_requisitos: [],
        codigo_expediente: codigo,
        estatus: 'En revisión',
        observaciones: ''
    });
    setShowModal(true);
};

  const handleVerDetalle = (solicitud) => {
    setSolicitudDetalle(solicitud);
    setShowDetailModal(true);
  };

  const handleVerExpediente = (solicitud) => {
    setExpedienteDetalle(solicitud);
    setShowExpedienteModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequisitoChange = (requisitoId) => {
    setFormData(prev => {
      const isSelected = prev.id_requisitos.includes(requisitoId);
      let newRequisitos;
      
      if (isSelected) {
        newRequisitos = prev.id_requisitos.filter(id => id !== requisitoId);
      } else {
        newRequisitos = [...prev.id_requisitos, requisitoId];
      }
      
      return { ...prev, id_requisitos: newRequisitos };
    });
  };

  const handleCrearExpediente = async () => {
    // Validaciones
    const errores = [];
    
    if (!formData.id_usuario) {
      errores.push("Debe seleccionar un inspector asignado");
    }
    
    if (formData.id_requisitos.length === 0) {
      errores.push("Debe seleccionar al menos un requisito");
    }
    
    if (!formData.codigo_expediente) {
      errores.push("El código de expediente es requerido");
    }
    
    if (errores.length > 0) {
      Swal.fire({
        ...swalConfig,
        title: '⚠️ Validación',
        html: errores.map(error => `<p class="text-left">• ${error}</p>`).join(''),
        icon: 'warning',
        confirmButtonText: 'Corregir',
      });
      return;
    }
    
    setCreating(true);
    
    try {
      // Verificar que el inspector seleccionado existe
      const inspectorSeleccionado = inspectores.find(
        inspector => String(inspector.id) === String(formData.id_usuario)
      );
      
      if (!inspectorSeleccionado) {
        throw new Error(`No se encontró el inspector con ID: ${formData.id_usuario}`);
      }
      
      console.log("✅ Inspector seleccionado:", {
        id: inspectorSeleccionado.id,
        cedula: inspectorSeleccionado.cedula_usuario,
        nombre: inspectorSeleccionado.nombre_completo
      });
      
      const expedienteData = {
        id_solicitud: formData.id_solicitud,
        id_usuario: parseInt(formData.id_usuario),
        id_requisitos: formData.id_requisitos.map(id => parseInt(id)),
        codigo_expediente: formData.codigo_expediente,
        estatus: formData.estatus,
        observaciones: formData.observaciones || 'Sin observaciones iniciales'
      };
      
      console.log("📤 Enviando datos al backend:", expedienteData);
      
      const response = await expedienteAPI.createExpediente(expedienteData);
      
      if (response.success) {
        // SweetAlert2 de éxito con detalles del expediente
        await Swal.fire({
          ...swalConfig,
          title: '¡Expediente Creado Exitosamente!',
          html: `
            <div class="space-y-3 py-2">
              <div class="flex items-center gap-3 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}">
                <span class="text-lg">📋</span>
                <div class="flex-1">
                  <p class="text-xs opacity-70 mb-1">Código de Expediente</p>
                  <p class="font-mono font-bold text-[#2A9D8F]">${response.data?.codigo_expediente || formData.codigo_expediente}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}">
                <span class="text-lg">👤</span>
                <div class="flex-1">
                  <p class="text-xs opacity-70 mb-1">Solicitante</p>
                  <p class="font-medium">${solicitudSeleccionada.nombre_completo}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}">
                <span class="text-lg">🔍</span>
                <div class="flex-1">
                  <p class="text-xs opacity-70 mb-1">Inspector Asignado</p>
                  <p class="font-medium">${inspectorSeleccionado.nombre_completo}</p>
                </div>
              </div>
              <div class="mt-3 p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-center">
                <p class="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  ✅ El expediente está listo para su gestión y seguimiento
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          showCancelButton: true,
          cancelButtonText: 'Ver Solicitudes',
        }).then((result) => {
          if (result.isDismissed) {
            // Si presiona "Ver Solicitudes", recargar datos
            cargarSolicitudesAprobadas();
          }
        });
        
        setShowModal(false);
        await cargarSolicitudesAprobadas();
      } else {
        Swal.fire({
          ...swalConfig,
          title: 'Error al Crear',
          text: response.error || 'Error desconocido al crear el expediente',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error("Error detallado:", error);
      Swal.fire({
        ...swalConfig,
        title: 'Error',
        text: `Error al crear el expediente: ${error.message || "Error desconocido"}`,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        footer: '<p class="text-sm text-gray-500 dark:text-gray-400">Verifique los datos e intente nuevamente</p>'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await cargarDatosIniciales();
      
      // Toast de éxito
      Toast.fire({
        icon: 'success',
        title: '✅ Datos actualizados correctamente',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#e5e7eb' : '#1f2937',
      });
    } catch (error) {
      Swal.fire({
        ...swalConfig,
        title: 'Error',
        text: 'Error al actualizar los datos',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          handleRefresh();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const filteredSolicitudes = solicitudesAprobadas.filter((solicitud) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      solicitud.nombre_completo?.toLowerCase().includes(searchLower) ||
      solicitud.cedula?.toLowerCase().includes(searchLower) ||
      solicitud.nombre_emprendimiento?.toLowerCase().includes(searchLower) ||
      solicitud.id_solicitud?.toString().includes(searchLower) ||
      solicitud.motivo_solicitud?.toLowerCase().includes(searchLower) ||
      solicitud.expediente?.codigo_expediente?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: solicitudesAprobadas.length,
    conExpediente: solicitudesAprobadas.filter(s => s.tiene_expediente).length,
    pendientes: solicitudesAprobadas.filter(s => !s.tiene_expediente).length,
    emprendimientos: solicitudesAprobadas.filter(s => s.nombre_emprendimiento).length
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const user = {
    name: currentUser?.nombre_completo || currentUser?.name || "Usuario",
    email: currentUser?.email || currentUser?.id_usuario || "",
    role: currentUser?.rol === "admin" ? "Administrador" : "Analista",
    avatar: null,
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: '¿Estás seguro de que deseas salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
        cancelButton: 'px-6 py-2 rounded-lg font-medium',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authChange"));
        window.location.href = "/login";
      }
    });
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
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
          activeTab="expedientes"
          setActiveTab={() => {}}
          darkMode={darkMode}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
          <div className="p-4 md:p-6 mt-16">
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>
                  Gestión de Expedientes
                </h1>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Solicitudes aprobadas listas para crear expedientes
                </p>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                } shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Actualizar
              </button>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg transition-all hover:shadow-xl border-l-4 border-l-emerald-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Total Solicitudes
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {stats.total}
                    </p>
                  </div>
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg transition-all hover:shadow-xl border-l-4 border-l-sky-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Con Expediente
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {stats.conExpediente}
                    </p>
                  </div>
                  <FileText size={32} className="text-sky-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg transition-all hover:shadow-xl border-l-4 border-l-amber-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs uppercase font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Pendientes
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {stats.pendientes}
                    </p>
                  </div>
                  <FolderPlus size={32} className="text-amber-500" />
                </div>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar por solicitante, cédula, expediente..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? "bg-gray-800 border-gray-700 text-white focus:border-[#2A9D8F]" 
                      : "bg-white border-gray-200 focus:border-[#2A9D8F]"
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all`} 
                />
              </div>
            </div>

            {/* Tabla de solicitudes */}
            <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F] mx-auto mb-4"></div>
                  <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Cargando solicitudes aprobadas...
                  </p>
                </div>
              ) : filteredSolicitudes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emprendimiento</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                      {filteredSolicitudes.map((solicitud) => (
                        <tr 
                          key={solicitud.id_solicitud} 
                          className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors ${
                            solicitud.tiene_expediente 
                              ? statusConfig[solicitud.expediente?.estatus_expediente]?.classes.hover || ''
                              : statusConfig['Pendiente'].classes.hover
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-sm font-mono font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                              #{solicitud.id_solicitud}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {solicitud.nombre_completo || "N/A"}
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                C.I: {solicitud.cedula || "N/A"} 
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {solicitud.nombre_emprendimiento || "N/A"}
                            </p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {formatFecha(solicitud.fecha_solicitud)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {solicitud.tiene_expediente ? (
                              <StatusBadge 
                                status={solicitud.expediente?.estatus_expediente || 'En revisión'}
                                code={solicitud.expediente?.codigo_expediente}
                                showCode={true}
                                size="sm"
                              />
                            ) : (
                              <StatusBadge 
                                status="Pendiente"
                                showCode={false}
                                size="sm"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleVerDetalle(solicitud)} 
                                className={`p-2 rounded-lg transition-all ${
                                  darkMode 
                                    ? "hover:bg-gray-600 text-blue-400 hover:text-blue-300" 
                                    : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                                }`}
                                title="Ver detalles"
                              >
                                <Eye size={18} />
                              </button>
                              
                              {!solicitud.tiene_expediente ? (
                                <button 
                                  onClick={() => handleAbrirModalExpediente(solicitud)} 
                                  className={`p-2 rounded-lg transition-all ${
                                    darkMode 
                                      ? "hover:bg-gray-600 text-amber-400 hover:text-amber-300" 
                                      : "hover:bg-amber-50 text-amber-600 hover:text-amber-700"
                                  }`}
                                  title="Crear expediente"
                                >
                                  <FolderPlus size={18} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleVerExpediente(solicitud)} 
                                  className={`p-2 rounded-lg transition-all ${
                                    darkMode 
                                      ? "hover:bg-gray-600 text-purple-400 hover:text-purple-300" 
                                      : "hover:bg-purple-50 text-purple-600 hover:text-purple-700"
                                  }`}
                                  title="Ver expediente"
                                >
                                  <FileText size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <CheckCircle size={48} className="mx-auto text-slate-400 mb-4" />
                  <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {searchTerm ? "No se encontraron resultados" : "No hay solicitudes aprobadas para procesar"}
                  </p>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mt-2`}>
                    {searchTerm 
                      ? "Intenta con otros términos de búsqueda" 
                      : "Las solicitudes aprobadas aparecerán aquí automáticamente"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MODAL: Crear Expediente */}
          {showModal && solicitudSeleccionada && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setShowModal(false)}></div>
              <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full max-w-2xl rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-2xl max-h-[90vh] overflow-y-auto`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} sticky top-0 ${darkMode ? "bg-gray-800" : "bg-white"} z-10 flex justify-between items-center`}>
                    <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
                      <FolderPlus className="text-amber-500" size={24} />
                      Crear Expediente
                    </h2>
                    <button 
                      onClick={() => setShowModal(false)} 
                      className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-sky-900/30 border border-sky-800" : "bg-sky-50 border border-sky-100"} mb-4`}>
                      <h3 className={`font-semibold mb-2 ${darkMode ? "text-sky-300" : "text-sky-800"}`}>
                        Solicitud #{solicitudSeleccionada.id_solicitud}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className={`text-xs ${darkMode ? "text-sky-300" : "text-sky-600"}`}>Solicitante:</span>
                          <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                            {solicitudSeleccionada.nombre_completo}
                          </p>
                        </div>
                        <div>
                          <span className={`text-xs ${darkMode ? "text-sky-300" : "text-sky-600"}`}>Cédula/RIF:</span>
                          <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                            {solicitudSeleccionada.cedula}
                          </p>
                        </div>
                        <div>
                          <span className={`text-xs ${darkMode ? "text-sky-300" : "text-sky-600"}`}>Emprendimiento:</span>
                          <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                            {solicitudSeleccionada.nombre_emprendimiento || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Código de Expediente <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="codigo_expediente"
                        value={formData.codigo_expediente}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border font-mono text-sm ${
                          darkMode 
                            ? "bg-gray-700 border-gray-600 text-white focus:border-[#2A9D8F]" 
                            : "bg-white border-gray-300 text-gray-900 focus:border-[#2A9D8F]"
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all`}
                        placeholder="EXP-2024-0001"
                        readOnly
                      />
                      <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Código generado automáticamente
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Inspector Asignado <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="id_usuario"
                        value={formData.id_usuario}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? "bg-gray-700 border-gray-600 text-white focus:border-[#2A9D8F]" 
                            : "bg-white border-gray-300 text-gray-900 focus:border-[#2A9D8F]"
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all`}
                      >
                        <option value="">Seleccione un inspector</option>
                        {inspectores.map(inspector => (
                          <option 
                            key={inspector.id} 
                            value={inspector.id}
                          >
                            {inspector.nombre_completo || `Inspector #${inspector.id}`} 
                            {inspector.cedula_usuario ? ` - ${inspector.cedula_usuario}` : ''}
                          </option>
                        ))}
                      </select>
                      {inspectores.length === 0 && (
                        <p className="text-xs text-rose-500 mt-1">
                          ⚠️ No hay inspectores disponibles. Contacte al administrador.
                        </p>
                      )}
                      {inspectores.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          {inspectores.length} inspector(es) disponible(s)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Estatus del Expediente
                      </label>
                      <select
                        name="estatus"
                        value={formData.estatus}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? "bg-gray-700 border-gray-600 text-white focus:border-[#2A9D8F]" 
                            : "bg-white border-gray-300 text-gray-900 focus:border-[#2A9D8F]"
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all`}
                      >
                        {Object.keys(statusConfig).map(status => (
                          <option key={status} value={status}>
                            {statusConfig[status].icon} {statusConfig[status].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Requisitos Entregados <span className="text-rose-500">*</span>
                      </label>
                      <div className={`p-3 rounded-lg border ${
                        darkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-200 bg-gray-50"
                      } max-h-48 overflow-y-auto`}>
                        {requisitos.length > 0 ? (
                          requisitos.map(requisito => {
                            const requisitoId = requisito.id_requisitos || requisito.id;
                            const isChecked = formData.id_requisitos.includes(requisitoId);
                            
                            return (
                              <label 
                                key={requisitoId} 
                                className="flex items-start gap-2 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleRequisitoChange(requisitoId)}
                                  className="w-4 h-4 mt-0.5 text-[#2A9D8F] rounded focus:ring-[#2A9D8F] focus:ring-2"
                                />
                                <div className="flex-1">
                                  <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    {requisito.nombre_requisito || `Requisito #${requisitoId}`}
                                  </span>
                                  {requisito.descripcion && (
                                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mt-0.5`}>
                                      {requisito.descripcion}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })
                        ) : (
                          <p className={`text-sm text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            No hay requisitos configurados
                          </p>
                        )}
                      </div>
                      
                      {formData.id_requisitos.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-600/20">
                            <Check size={12} />
                            {formData.id_requisitos.length} requisito(s) seleccionado(s)
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Observaciones
                      </label>
                      <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="3"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? "bg-gray-700 border-gray-600 text-white focus:border-[#2A9D8F]" 
                            : "bg-white border-gray-300 text-gray-900 focus:border-[#2A9D8F]"
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all resize-none`}
                        placeholder="Observaciones adicionales sobre el expediente..."
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setShowModal(false)}
                        className={`px-4 py-2 rounded-lg ${
                          darkMode 
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        } transition-all disabled:opacity-50`}
                        disabled={creating}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCrearExpediente}
                        disabled={creating || inspectores.length === 0}
                        className="px-6 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Creando...
                          </>
                        ) : (
                          <>
                            <FolderPlus size={18} />
                            Crear Expediente
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: Detalle de Solicitud */}
          {showDetailModal && solicitudDetalle && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setShowDetailModal(false)}></div>
              <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full max-w-4xl rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-2xl max-h-[90vh] overflow-y-auto`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} sticky top-0 ${darkMode ? "bg-gray-800" : "bg-white"} z-10 flex justify-between items-center`}>
                    <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      Detalle de Solicitud #{solicitudDetalle.id_solicitud}
                    </h2>
                    <button 
                      onClick={() => setShowDetailModal(false)} 
                      className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="px-6 py-4">
                    {solicitudDetalle.tiene_expediente && (
                      <div className="mb-4">
                        <StatusBadge 
                          status={solicitudDetalle.expediente?.estatus_expediente || 'En revisión'}
                          code={solicitudDetalle.expediente?.codigo_expediente}
                          showCode={true}
                          size="md"
                        />
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
                        <FileText size={20} className="text-sky-500" /> Información General
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Monto Solicitado</label>
                          <p className={`text-lg font-bold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                            {formatMonto(solicitudDetalle.monto_solicitado)}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Fecha de Solicitud</label>
                          <p className={`text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>
                            {formatFecha(solicitudDetalle.fecha_solicitud)}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Motivo</label>
                          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {solicitudDetalle.motivo_solicitud || "No especificado"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
                        <User size={20} className="text-violet-500" /> Datos del Solicitante
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nombre Completo</label>
                          <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                            {solicitudDetalle.nombre_completo}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Cédula/RIF</label>
                          <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                            {solicitudDetalle.cedula}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Teléfono</label>
                          <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                            {solicitudDetalle.telefono || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</label>
                          <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                            {solicitudDetalle.email || "N/A"}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dirección</label>
                          <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                            {solicitudDetalle.direccion || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {solicitudDetalle.nombre_emprendimiento && (
                      <div className="mb-6">
                        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
                          <Building size={20} className="text-amber-500" /> Datos del Emprendimiento
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nombre</label>
                            <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                              {solicitudDetalle.nombre_emprendimiento}
                            </p>
                          </div>
                          <div>
                            <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Años de Experiencia</label>
                            <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                              {solicitudDetalle.anos_experiencia || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sector</label>
                            <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                              {solicitudDetalle.sector || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Actividad</label>
                            <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                              {solicitudDetalle.actividad || "N/A"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dirección</label>
                            <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                              {solicitudDetalle.direccion_emprendimiento || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: Ver Expediente */}
          {showExpedienteModal && expedienteDetalle && expedienteDetalle.expediente && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setShowExpedienteModal(false)}></div>
              <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full max-w-4xl rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-2xl max-h-[90vh] overflow-y-auto`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} sticky top-0 ${darkMode ? "bg-gray-800" : "bg-white"} z-10 flex justify-between items-center`}>
                    <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
                      <FileText className="text-purple-500" size={24} />
                      Expediente {expedienteDetalle.expediente.codigo_expediente}
                    </h2>
                    <button 
                      onClick={() => setShowExpedienteModal(false)} 
                      className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="px-6 py-4">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <StatusBadge 
                          status={expedienteDetalle.expediente.estatus_expediente || 'En revisión'}
                          showCode={false}
                          size="md"
                        />
                        <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Creado: {formatFecha(expedienteDetalle.expediente.fecha_creacion)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Código de Expediente
                        </label>
                        <p className={`text-lg font-mono font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                          {expedienteDetalle.expediente.codigo_expediente}
                        </p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Inspector Asignado
                        </label>
                        <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                          {expedienteDetalle.expediente.inspector_nombre || 'No asignado'}
                        </p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Solicitante
                        </label>
                        <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                          {expedienteDetalle.nombre_completo}
                        </p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Cédula
                        </label>
                        <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                          {expedienteDetalle.cedula}
                        </p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Solicitud
                        </label>
                        <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                          #{expedienteDetalle.id_solicitud}
                        </p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Monto
                        </label>
                        <p className={`text-lg font-bold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                          {formatMonto(expedienteDetalle.monto_solicitado)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Observaciones
                      </label>
                      <div className={`p-3 rounded-lg mt-1 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {expedienteDetalle.expediente.observaciones || 'Sin observaciones'}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className={`text-xs uppercase font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Requisitos del Expediente
                      </label>
                      <div className={`p-3 rounded-lg mt-1 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        {expedienteDetalle.expediente.id_requisitos ? (
                          <div className="flex flex-wrap gap-2">
                            {expedienteDetalle.expediente.id_requisitos.split(',').map((reqId, index) => (
                              <span 
                                key={index}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  darkMode 
                                    ? 'bg-gray-600 text-gray-200 ring-1 ring-gray-500' 
                                    : 'bg-white text-gray-700 border border-gray-200 ring-1 ring-gray-100'
                                }`}
                              >
                                Requisito #{reqId.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            No hay requisitos registrados
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setShowExpedienteModal(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Footer darkMode={darkMode} />
        </main>
      </div>
    </div>
  );
};

export default GestionExpedientes;